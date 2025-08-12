import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { PinataSDK } from "pinata";
import certificadoImg from "../assets/certificado.jpg";
import { ethers } from "ethers";
import { getCertiChainTokenContract } from "../contracts/CertiChainToken";

interface DirectorPanelProps {
  account: string;
  modoOscuro: boolean;
  signer?: ethers.Signer;  // Añadido signer como prop opcional
}

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_GATEWAY_URL,
});

const DirectorPanel = ({ modoOscuro, signer }: DirectorPanelProps) => {
  const [activeTab, setActiveTab] = useState("emitir");
  const [nombre, setNombre] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [link, setLink] = useState("");
  const [showJsonForm, setShowJsonForm] = useState(false);
  const [walletToMint, setWalletToMint] = useState("");
  const [showMintForm, setShowMintForm] = useState(false);
  const [mintStatus] = useState("");
  const [jsonLink, setJsonLink] = useState("");
  const [mintPrice, setMintPrice] = useState("0");
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  //const [isMinting, setIsMinting] = useState(false); // Nuevo estado para controlar minting

  const [jsonData, setJsonData] = useState({
    description: "",
    name: "",
    base: "",
    content: "",
  });

  const certRef = useRef<HTMLDivElement>(null);

  // Función para obtener el precio actual del mint
  const getMintPrice = async () => {
    try {
      setIsLoadingPrice(true);
      
      let providerOrSigner;
      if (signer) {
        providerOrSigner = signer;
      } else {
        if (!(window as any).ethereum) {
          throw new Error("MetaMask no está instalado");
        }
        // Cambia esto:
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        providerOrSigner = provider;
      }
      
      const contract = getCertiChainTokenContract(providerOrSigner);
      const price = await contract.mintPrice();
      const priceInEth = ethers.formatEther(price); // Cambia utils.formatEther por formatEther
      setMintPrice(priceInEth);
    } catch (error) {
      console.error("Error obteniendo precio:", error);
      setMintPrice("0.001");
    } finally {
      setIsLoadingPrice(false);
    }
  };

  useEffect(() => {
    if (showMintForm) {
      getMintPrice();
    }
  }, [showMintForm]);

  // SUBIR IMAGEN
  const handleUpload = async () => {
    if (!nombre || !institucion) {
      setUploadStatus("⚠️ Por favor completa todos los campos.");
      return;
    }

    try {
      setUploadStatus("🖼️ Generando imagen...");
      const canvas = await html2canvas(certRef.current!, {
        useCORS: true,
        scale: 2,
      });

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg")
      );

      setUploadStatus("🌀 Obteniendo URL prefirmada...");
      const urlResponse = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/presigned_url`
      );

      if (!urlResponse.ok) {
        throw new Error(
          `Error al obtener URL prefirmada: ${urlResponse.statusText}`
        );
      }

      const contentType = urlResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await urlResponse.text();
        throw new Error(`Respuesta inesperada del servidor: ${text}`);
      }

      const data = await urlResponse.json();

      setUploadStatus("⬆️ Subiendo certificado a IPFS...");
      const fileName = `certificado-${nombre
        .toLowerCase()
        .replace(/\s+/g, "-")}.jpg`;

      const file = new File([blob], fileName, { type: "image/jpeg" });

      const upload = await pinata.upload.public
        .file(file, {
          metadata: { name: fileName },
        })
        .url(data.url);

      if (upload.cid) {
        const ipfsLink = await pinata.gateways.public.convert(upload.cid);
        setLink(ipfsLink);
        setUploadStatus("✅ Certificado subido exitosamente.");
        setShowJsonForm(true);
      } else {
        setUploadStatus("❌ Falló la subida del archivo.");
      }
    } catch (error) {
      console.error(error);
      setUploadStatus(
        `⚠️ Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // SUBIR JSON
  const handleJsonUpload = async () => {
    const metadata = {
      description: jsonData.description,
      external_url: "https://wirawallet.com",
      image: link,
      name: jsonData.name,
      attributes: [
        { trait_type: "Base", value: jsonData.base },
        { trait_type: "Content", value: jsonData.content },
      ],
    };

    try {
      setUploadStatus("📦 Subiendo metadata JSON...");

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/pinata/json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      const cid = result?.cid;
      if (cid) {
        const ipfsJsonLink = `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`;
        setUploadStatus(`✅ JSON subido exitosamente. Ver JSON: ${ipfsJsonLink}`);
        setJsonLink(ipfsJsonLink);
        setShowMintForm(true);
      } else {
        throw new Error("No se recibió el CID");
      }
    } catch (error: any) {
      console.error("Error al subir JSON:", error);
      setUploadStatus(
        "❌ Error al subir JSON: " + (error?.message || "ver consola")
      );
    }
  };

  // MINTEAR NFT
  async function mintNFT(ipfsJsonLink: string) {
  try {
    console.log("🔄 Conectando a contrato...");

    // Conectar con MetaMask si no está conectado
    if (!(window as any).ethereum) {
      throw new Error("MetaMask no está instalado.");
    }
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });

    // Provider y signer
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    // Instanciar contrato
    const contract = getCertiChainTokenContract(signer);

    // ✅ Verificar función
    if (typeof contract.mintPrice !== "function") {
      throw new Error("La función mintPrice no existe en el contrato. Revisa el ABI.");
    }

    // Obtener precio
    const currentPrice = await contract.mintPrice();
    console.log("💰 Precio en wei:", currentPrice.toString());

    // Aquí usamos formatEther de la versión nueva de ethers
    console.log("💰 Precio en ETH:", ethers.formatEther(currentPrice));
    //verifacamos wallet
    if (!ethers.isAddress(walletToMint)) {  // Cambia utils.isAddress por isAddress
      alert("Dirección de wallet inválida");
      return;
    }
    console.log("✅ Dirección de wallet válida:", walletToMint);
    // Ejecutar mint
    console.log("🚀 Ejecutando mint...");
    const tx = await contract.safeMint(walletToMint, ipfsJsonLink, { value: currentPrice });

    

    console.log("⏳ Esperando confirmación...");
    const receipt = await tx.wait();
    console.log("✅ NFT minteado:", receipt);

  } catch (error: any) {
    console.error("❌ Error en mintNFT:", error.message || error);
  }
}


  return (
    <div className={`min-h-screen ${modoOscuro ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className={`p-6 rounded-lg ${modoOscuro ? "bg-gray-800" : "bg-white shadow"}`}>
          <h1 className={`text-3xl font-bold mb-6 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
            Panel de Director/Administrativo
          </h1>

          <div className={`flex border-b mb-6 ${modoOscuro ? "border-gray-700" : "border-gray-200"}`}>
            {["emitir", "verificar", "historial", "reportes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize ${
                  modoOscuro ? "text-gray-300" : "text-gray-600"
                } ${
                  activeTab === tab
                    ? modoOscuro
                      ? "border-b-2 border-blue-500 text-white"
                      : "border-b-2 border-blue-500 text-blue-600"
                    : ""
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={`p-6 rounded-lg ${modoOscuro ? "bg-gray-800" : "bg-white shadow"}`}>
            {activeTab === "emitir" && (
              <>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Formulario de datos básicos */}
                  <div className="w-full md:w-1/2">
                    <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
                      Emitir Nuevos Certificados
                    </h2>

                    <input
                      type="text"
                      placeholder="Nombre del estudiante"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="mb-4 block w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Institución"
                      value={institucion}
                      onChange={(e) => setInstitucion(e.target.value)}
                      className="mb-4 block w-full p-2 border rounded"
                    />
                  </div>

                  {/* Vista previa del certificado */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    <div
                      ref={certRef}
                      style={{
                        width: "800px",
                        height: "450px",
                        backgroundImage: `url(${certificadoImg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        fontFamily: "serif",
                        position: "relative",
                        boxShadow: "0 0 15px rgba(0,0,0,0.2)",
                        borderRadius: "8px",
                      }}
                    >
                      <h1 style={{ fontSize: "50px", fontWeight: "bold", marginBottom: "30px", color: "#000" }}>
                        {nombre}
                      </h1>
                      <h2 style={{ fontSize: "32px", marginBottom: "10px", color: "#000" }}>
                        {institucion}
                      </h2>
                      <p style={{ fontSize: "24px", color: "#000" }}>
                        Fecha: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón subir imagen */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleUpload}
                    className="px-6 py-3 rounded-lg font-semibold shadow transition-all duration-200 relative overflow-hidden group"
                  >
                    <span
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      style={{
                        background: "linear-gradient(270deg, #ff0080, #7928ca, #00ffea, #ff0080)",
                        backgroundSize: "600% 600%",
                        animation: "rgbGlow 2s linear infinite",
                        filter: "blur(12px)",
                      }}
                    />
                    <span className={`absolute inset-0 ${modoOscuro ? "bg-blue-600" : "bg-blue-500"} rounded-lg`} />
                    <span className="relative z-10 text-white">
                      Generar y Subir Certificado
                    </span>
                  </button>
                </div>

                {/* Formulario JSON */}
                {showJsonForm && (
                  <div className="mt-8">
                    <h3 className={`text-lg font-semibold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
                      Subir Metadata JSON
                    </h3>
                    <input
                      type="text"
                      placeholder="Descripción del certificado"
                      value={jsonData.description}
                      onChange={(e) => setJsonData({ ...jsonData, description: e.target.value })}
                      className="mb-2 block w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Nombre del certificado"
                      value={jsonData.name}
                      onChange={(e) => setJsonData({ ...jsonData, name: e.target.value })}
                      className="mb-2 block w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Base/Curso"
                      value={jsonData.base}
                      onChange={(e) => setJsonData({ ...jsonData, base: e.target.value })}
                      className="mb-2 block w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Contenido/Especialidad"
                      value={jsonData.content}
                      onChange={(e) => setJsonData({ ...jsonData, content: e.target.value })}
                      className="mb-4 block w-full p-2 border rounded"
                    />
                    <button
                      onClick={handleJsonUpload}
                      className="px-6 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                    >
                      Subir JSON a IPFS
                    </button>
                  </div>
                )}

                {uploadStatus && (
                  <div className={`mt-4 p-3 rounded text-center ${
                    uploadStatus.includes("✅")
                      ? modoOscuro ? "bg-green-800 text-green-200" : "bg-green-100 text-green-700"
                      : uploadStatus.includes("❌")
                      ? modoOscuro ? "bg-red-800 text-red-200" : "bg-red-100 text-red-700"
                      : modoOscuro ? "bg-blue-800 text-blue-200" : "bg-blue-100 text-blue-700"
                  }`}>
                    {uploadStatus}
                  </div>
                )}

                {link && (
                  <div className="mt-4 text-center">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-400 hover:text-blue-300"
                    >
                      🔗 Ver Certificado en IPFS
                    </a>
                  </div>
                )}

                {/* FORMULARIO DE MINT */}
                {showMintForm && (
                  <div className="mt-8">
                    <h3 className={`text-lg font-semibold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
                      🎯 Mint NFT Certificate - Cualquier persona puede mintear
                    </h3>
                    
                    <div className={`mb-4 p-4 rounded-lg ${modoOscuro ? "bg-blue-900 border border-blue-700" : "bg-blue-50 border border-blue-200"}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${modoOscuro ? "text-blue-200" : "text-blue-800"}`}>
                          💰 Costo del certificado NFT:
                        </span>
                        <span className={`font-bold text-xl ${modoOscuro ? "text-blue-100" : "text-blue-900"}`}>
                          {isLoadingPrice ? "⏳ Cargando..." : `${mintPrice} ETH`}
                        </span>
                      </div>
                      <p className={`text-sm mt-2 ${modoOscuro ? "text-blue-300" : "text-blue-600"}`}>
                        🌍 Cualquier persona con MetaMask puede pagar y mintear este certificado
                      </p>
                    </div>

                    <div className="mb-4">
                      <span className={`text-sm ${modoOscuro ? "text-gray-400" : "text-gray-600"}`}>
                        📋 JSON Metadata IPFS:
                      </span>
                      <a
                        href={jsonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block underline text-blue-400 break-all hover:text-blue-300"
                      >
                        {jsonLink}
                      </a>
                    </div>

                    <input
                      type="text"
                      placeholder="Dirección wallet destinataria (0x...)"
                      value={walletToMint}
                      onChange={(e) => setWalletToMint(e.target.value)}
                      className={`mb-4 block w-full p-3 border rounded-lg ${
                        modoOscuro 
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />

                    {/* <button
                      onClick={mintNFT}
                      disabled={!walletToMint || !jsonLink || isLoadingPrice || isMinting}
                      className="w-full px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
                    >
                      <span
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                        style={{
                          background: "linear-gradient(270deg, #00d4aa, #00a8ff, #0078ff, #00d4aa)",
                          backgroundSize: "600% 600%",
                          animation: "rgbGlow 2s linear infinite",
                          filter: "blur(8px)",
                        }}
                      />
                      <span
                        className={`absolute inset-0 ${
                          !walletToMint || !jsonLink || isLoadingPrice || isMinting
                            ? "bg-gray-400"
                            : "bg-green-600 hover:bg-green-700"
                        } rounded-lg`}
                      />
                      <span className="relative z-10 text-white">
                        {isLoadingPrice 
                          ? "⏳ Cargando precio..." 
                          : isMinting
                          ? "⏳ Minteando..."
                          : `💎 Mint Certificate NFT (${mintPrice} ETH)`
                        }
                      </span>
                    </button> */}
                    <button
  onClick={() => mintNFT(jsonLink)}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Mint NFT
</button>


                    {mintStatus && (
                      <div
                        className={`mt-4 p-4 rounded-lg whitespace-pre-line ${
                          mintStatus.includes("✅")
                            ? modoOscuro 
                              ? "bg-green-800 text-green-100 border border-green-600" 
                              : "bg-green-100 text-green-800 border border-green-300"
                            : modoOscuro 
                              ? "bg-red-800 text-red-100 border border-red-600" 
                              : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {mintStatus}
                      </div>
                    )}

                    <div className="mt-4 text-center">
                      <button
                        onClick={getMintPrice}
                        disabled={isLoadingPrice}
                        className={`text-sm px-4 py-2 rounded ${
                          modoOscuro 
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } disabled:opacity-50`}
                      >
                        {isLoadingPrice ? "⏳ Actualizando..." : "🔄 Actualizar precio"}
                      </button>
                    </div>
                  </div>
                )}

                <style>
                  {`
                    @keyframes rgbGlow {
                      0% { background-position: 0% 50%; }
                      50% { background-position: 100% 50%; }
                      100% { background-position: 0% 50%; }
                    }
                  `}
                </style>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorPanel;
