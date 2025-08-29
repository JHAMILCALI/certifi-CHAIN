import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { PinataSDK } from "pinata";
import certificadoImg from "../assets/certificado2.jpg";
import { ethers } from "ethers";
import { getCertiChainTokenContract } from "../contracts/CertiChainToken";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";


interface DirectorPanelProps {
  account: string;
  modoOscuro: boolean;
  signer?: ethers.Signer; // Añadido signer como prop opcional
}

// Configuración de Supabase
const supabase = createClient(
  "https://llemzfnbfdxwxqhpfhzv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZW16Zm5iZmR4d3hxaHBmaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTI5NzMsImV4cCI6MjA3MDU4ODk3M30.TLDKGeJcDtGSLMITfABeFLucNoApEYuRYzgz9lhbziE"
);

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_GATEWAY_URL,
});

const DirectorPanel = ({ modoOscuro, signer, account }: DirectorPanelProps) => {
  const [activeTab, setActiveTab] = useState("emitir");
  const [nombre, setNombre] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [link, setLink] = useState("");
  const [showJsonForm, setShowJsonForm] = useState(false);
  const [walletToMint, setWalletToMint] = useState("");
  const [showMintForm, setShowMintForm] = useState(false);
  const [mintStatus, setMintStatus] = useState("");
  const [jsonLink, setJsonLink] = useState("");
  const [mintPrice, setMintPrice] = useState("0");
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  // Estado para almacenar el ID del certificado creado
  const [certificadoId, setCertificadoId] = useState<string>(uuidv4());

  const [jsonData, setJsonData] = useState({
    description: "",
    name: "",
    base: "",
    content: "",
  });

  const certRef = useRef<HTMLDivElement>(null);

  // Función para guardar certificado en Supabase
  const guardarCertificadoEnBD = async (
    nombreEstudiante: string,
    institucionNombre: string,
    walletDestinatario: string,
    ipfsCertificado?: string,
    ipfsMetadata?: string,
    creadorWallet?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("certificados")
        .insert([
          {
            id: certificadoId, // Usar el ID generado
            nombre_estudiante: nombreEstudiante,
            institucion: institucionNombre,
            wallet_destinatario: walletDestinatario,
            ipfs_certificado: ipfsCertificado || null,
            ipfs_metadata: ipfsMetadata || null,
            estado: "emitido",
            creado_por: creadorWallet || account || null,
            fecha_emision: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error guardando en BD:", error);
        throw error;
      }

      console.log("✅ Certificado guardado en BD:", data);
      setCertificadoId(data.id);
      return data;
    } catch (error) {
      console.error("❌ Error al guardar en base de datos:", error);
      throw error;
    }
  };

  // Función para actualizar certificado con hash de transacción
  const actualizarCertificadoConTx = async (
    certificadoId: string,
    txHash: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("certificados")
        .update({
          tx_hash: txHash,
          estado: "minted",
        })
        .eq("id", certificadoId)
        .select()
        .single();

      if (error) {
        console.error("Error actualizando certificado:", error);
        throw error;
      }

      console.log("✅ Certificado actualizado con TX:", data);
      return data;
    } catch (error) {
      console.error("❌ Error al actualizar certificado:", error);
      throw error;
    }
  };

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
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        providerOrSigner = provider;
      }

      const contract = getCertiChainTokenContract(providerOrSigner);
      const price = await contract.mintPrice();
      const priceInEth = ethers.formatEther(price);
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

  useEffect(() => {
    if (!document.getElementById("codeGPTWidgetScript")) {
      const script = document.createElement("script");
      script.id = "codeGPTWidgetScript";
      script.type = "module";
      script.async = true;
      script.defer = true;
      script.src = "https://widget.codegpt.co/chat-widget.js";
      script.setAttribute(
        "data-widget-id",
        "4dcf2feb-cd3d-4334-aae9-cc0f2e928926"
      );

      document.body.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById("codeGPTWidgetScript");
      if (existingScript && existingScript.parentNode === document.body) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

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
        const ipfsJsonLink = `https://${
          import.meta.env.VITE_GATEWAY_URL
        }/ipfs/${cid}`;
        setUploadStatus(`✅ JSON subido exitosamente.`);
        setJsonLink(ipfsJsonLink);

        // 🔥 GUARDAR EN BASE DE DATOS AQUÍ
        try {
          setUploadStatus("💾 Guardando certificado en base de datos...");
          await guardarCertificadoEnBD(
            nombre,
            institucion,
            walletToMint || "", // Si ya hay wallet, lo usamos, sino lo dejamos vacío por ahora
            link, // IPFS de la imagen
            ipfsJsonLink, // IPFS del metadata JSON
            account // Wallet del creador
          );
          setUploadStatus(
            "✅ Certificado guardado en base de datos y listo para mintear."
          );
        } catch (dbError) {
          console.error("Error guardando en BD:", dbError);
          setUploadStatus(
            "⚠️ JSON subido pero error al guardar en BD. Puedes continuar con el mint."
          );
        }

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
      setIsMinting(true);
      setMintStatus("🔄 Conectando a contrato...");

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

      // Verificar función
      if (typeof contract.mintPrice !== "function") {
        throw new Error(
          "La función mintPrice no existe en el contrato. Revisa el ABI."
        );
      }

      // Obtener precio
      setMintStatus("💰 Obteniendo precio actual...");
      const currentPrice = await contract.mintPrice();
      console.log("💰 Precio en wei:", currentPrice.toString());
      console.log("💰 Precio en ETH:", ethers.formatEther(currentPrice));

      // Verificar wallet
      if (!ethers.isAddress(walletToMint)) {
        throw new Error("Dirección de wallet inválida");
      }
      console.log("✅ Dirección de wallet válida:", walletToMint);

      // Si no hay certificado en BD, crear uno ahora
      if (!certificadoId) {
        setMintStatus("💾 Guardando certificado en base de datos...");
        await guardarCertificadoEnBD(
          nombre,
          institucion,
          walletToMint,
          link,
          ipfsJsonLink,
          account
        );
      } else {
        // Actualizar con la wallet destinataria si cambió
        const { error } = await supabase
          .from("certificados")
          .update({ wallet_destinatario: walletToMint })
          .eq("id", certificadoId);

        if (error) {
          console.error("Error actualizando wallet destinataria:", error);
        }
      }

      // Ejecutar mint
      setMintStatus("🚀 Ejecutando mint en blockchain...");
      const tx = await contract.safeMint(walletToMint, ipfsJsonLink, {
        value: currentPrice,
      });

      setMintStatus("⏳ Esperando confirmación de blockchain...");
      const receipt = await tx.wait();
      console.log("✅ NFT minteado:", receipt);

      // Actualizar certificado con hash de transacción
      if (certificadoId) {
        setMintStatus("💾 Actualizando registro en base de datos...");
        await actualizarCertificadoConTx(certificadoId, receipt.hash);
      }

      setMintStatus(`✅ ¡NFT Certificate minteado exitosamente! 
🔗 Hash de transacción: ${receipt.hash}
💎 Token enviado a: ${walletToMint}
📋 Metadata IPFS: ${ipfsJsonLink}`);
    } catch (error: any) {
      console.error("❌ Error en mintNFT:", error.message || error);
      setMintStatus(`❌ Error en el mint: ${error.message || error}`);
    } finally {
      setIsMinting(false);
    }
  }

  return (
    <div
      className={`min-h-screen ${modoOscuro ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Contenedor principal (95% del ancho en pantallas grandes, con máximo de 1800px) */}
      <div className="mx-auto py-10 w-full lg:w-[95%] xl:max-w-[1800px] 2xl:max-w-[2000px]">
        {/* Contenedor interno (padding grande + sombra pronunciada) */}
        <div
          className={`p-10 md:p-16 lg:p-20 rounded-2xl ${
            modoOscuro ? "bg-gray-800" : "bg-white shadow-2xl"
          }`}
        >
          {/* Título principal (texto gigante) */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-12 ${
              modoOscuro ? "text-white" : "text-gray-800"
            }`}
          >
            Panel de Director/Administrativo
          </h1>

          {/* Pestañas (botones grandes) */}
          <div
            className={`flex border-b-2 mb-12 ${
              modoOscuro ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {["emitir", "verificar", "historial", "reportes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-xl md:text-2xl font-medium capitalize ${
                  modoOscuro ? "text-gray-300" : "text-gray-600"
                } ${
                  activeTab === tab
                    ? modoOscuro
                      ? "border-b-4 border-blue-500 text-white"
                      : "border-b-4 border-blue-500 text-blue-600"
                    : ""
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Contenido principal (espaciado amplio) */}
          <div
            className={`p-10 md:p-12 rounded-xl ${
              modoOscuro ? "bg-gray-700" : "bg-gray-50 shadow-lg"
            }`}
          >
            {activeTab === "emitir" && (
              <>
                {/* Grid de 2 columnas (formulario + certificado) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
                  {/* Columna izquierda: Formulario */}
                  <div className="space-y-8">
                    <h2
                      className={`text-3xl font-semibold ${
                        modoOscuro ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Emitir Nuevos Certificados
                    </h2>

                    {/* <p className={`mt-2 text-sm ${modoOscuro ? "text-gray-400" : "text-gray-600"}`}>
                    ID del certificado: <span className="font-mono">{certificadoId}</span>
                  </p>
                  <div style={{ marginTop: '20px' }}>
                    <QRCodeSVG value={`${"http://localhost:5176"}/${certificadoId}`} size={256}/>
                  </div> */}

                    <input
                      type="text"
                      placeholder="Nombre del estudiante"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className={`w-full p-4 text-xl rounded-xl border-2 ${
                        modoOscuro
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="Institución"
                      value={institucion}
                      onChange={(e) => setInstitucion(e.target.value)}
                      className={`w-full p-4 text-xl rounded-xl border-2 ${
                        modoOscuro
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  {/* Columna derecha: Certificado (con tamaño flexible) */}
                  <div className="flex justify-center w-full">
                    <div
                      ref={certRef}
                      className="relative w-full max-w-[900px]"
                      style={{
                        aspectRatio: "1086 / 768",
                        backgroundImage: `url(${certificadoImg})`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        fontFamily: "serif",
                      }}
                    >
                      {/* QR (gener QR con ID) */}
                      <div className="absolute top-4 right-4">
                        <QRCodeSVG
                          value={`${"https://certifi-chain.vercel.app"}/${certificadoId}`}
                          size={80}
                        />
                      </div>
                      {/* Nombre (texto dinámico) */}
                      <div
                        className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-black whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                          fontSize: `${Math.max(
                            1.5,
                            3 - nombre.length * 0.03
                          )}vw`,
                          maxWidth: "95%",
                          top: "33%",
                        }}
                      >
                        {nombre}
                      </div>

                      {/* Institución */}
                      <div
                        className="absolute top-[48%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-black whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                          fontSize: `${Math.max(
                            1.2,
                            2.5 - institucion.length * 0.03
                          )}vw`,
                          maxWidth: "85%",
                        }}
                      >
                        {institucion}
                      </div>

                      {/* Fecha */}
                      <div
                        className="absolute text-black"
                        style={{
                          bottom: "22%",
                          left: "15%",
                          top: "78%",
                          fontSize: "1.3vw",
                        }}
                      >
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de acción principal */}
                <div className="mt-16 flex justify-center">
  <button
    onClick={handleUpload}
    className={`group px-12 py-5 text-xl rounded-xl font-bold transition-all duration-200 relative overflow-hidden ${
      modoOscuro
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-blue-500 hover:bg-blue-600"
    }`}
  >
    {/* Glow animado detrás */}
    <span
      className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
      style={{
        background:
          "linear-gradient(270deg, #ff0080, #7928ca, #00ffea, #ff0080)",
        backgroundSize: "600% 600%",
        animation: "rgbGlow 3s linear infinite",
        filter: "blur(14px)",
        zIndex: 0,
      }}
    />
    
    {/* Texto */}
    <span className="relative z-10 text-white">
      Generar y Subir Certificado
    </span>

    {/* Keyframes para la animación */}
    <style>
      {`
        @keyframes rgbGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}
    </style>
  </button>
</div>


                {/* Sección de Metadata JSON */}
                {showJsonForm && (
                  <div className="mt-16 space-y-6">
                    <h3
                      className={`text-2xl font-semibold ${
                        modoOscuro ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Subir Metadata JSON
                    </h3>
                    <input
                      type="text"
                      placeholder="Descripción del certificado"
                      value={jsonData.description}
                      onChange={(e) =>
                        setJsonData({
                          ...jsonData,
                          description: e.target.value,
                        })
                      }
                      className={`w-full p-4 text-xl rounded-xl border-2 ${
                        modoOscuro
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Nombre del certificado"
                      value={jsonData.name}
                      onChange={(e) =>
                        setJsonData({ ...jsonData, name: e.target.value })
                      }
                      className={`w-full p-4 text-xl rounded-xl border-2 ${
                        modoOscuro
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Base/Curso"
                      value={jsonData.base}
                      onChange={(e) =>
                        setJsonData({ ...jsonData, base: e.target.value })
                      }
                      className={`w-full p-4 text-xl rounded-xl border-2 ${
                        modoOscuro
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Contenido/Especialidad"
                      value={jsonData.content}
                      onChange={(e) =>
                        setJsonData({ ...jsonData, content: e.target.value })
                      }
                      className={`w-full p-4 text-xl rounded-xl border-2 ${
                        modoOscuro
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    <button
                      onClick={handleJsonUpload}
                      className="px-8 py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors text-lg"
                    >
                      Subir JSON a IPFS
                    </button>
                  </div>
                )}

                {uploadStatus && (
                  <div
                    className={`mt-8 p-5 rounded-xl text-center text-xl ${
                      uploadStatus.includes("✅")
                        ? modoOscuro
                          ? "bg-green-800 text-green-200"
                          : "bg-green-100 text-green-700"
                        : uploadStatus.includes("❌")
                        ? modoOscuro
                          ? "bg-red-800 text-red-200"
                          : "bg-red-100 text-red-700"
                        : modoOscuro
                        ? "bg-blue-800 text-blue-200"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {uploadStatus}
                  </div>
                )}

                {link && (
                  <div className="mt-8 text-center">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xl underline"
                    >
                      🔗 Ver Certificado en IPFS
                    </a>
                  </div>
                )}

                {/* FORMULARIO DE MINT */}
                {showMintForm && (
                  <div className="mt-16 space-y-8">
                    <h3
                      className={`text-2xl font-semibold ${
                        modoOscuro ? "text-white" : "text-gray-800"
                      }`}
                    >
                      🎯 Mint NFT Certificate - Cualquier persona puede mintear
                    </h3>

                    {certificadoId && (
                      <div
                        className={`p-5 rounded-xl ${
                          modoOscuro
                            ? "bg-green-900 border border-green-700"
                            : "bg-green-50 border border-green-200"
                        }`}
                      >
                        <p
                          className={`text-xl ${
                            modoOscuro ? "text-green-200" : "text-green-800"
                          }`}
                        >
                          💾 Certificado guardado en BD con ID:{" "}
                          <code className="font-mono">{certificadoId}</code>
                        </p>
                      </div>
                    )}

                    <div
                      className={`p-6 rounded-xl ${
                        modoOscuro
                          ? "bg-blue-900 border border-blue-700"
                          : "bg-blue-50 border border-blue-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium text-xl ${
                            modoOscuro ? "text-blue-200" : "text-blue-800"
                          }`}
                        >
                          💰 Costo del certificado NFT:
                        </span>
                        <span
                          className={`font-bold text-2xl ${
                            modoOscuro ? "text-blue-100" : "text-blue-900"
                          }`}
                        >
                          {isLoadingPrice
                            ? "⏳ Cargando..."
                            : `${mintPrice} ETH`}
                        </span>
                      </div>
                      <p
                        className={`text-xl mt-3 ${
                          modoOscuro ? "text-blue-300" : "text-blue-600"
                        }`}
                      >
                        🌍 Cualquier persona con MetaMask puede pagar y mintear
                        este certificado
                      </p>
                    </div>

                    <div className="space-y-4">
                      <span
                        className={`text-xl ${
                          modoOscuro ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        📋 JSON Metadata IPFS:
                      </span>
                      <a
                        href={jsonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 text-lg underline break-all"
                      >
                        {jsonLink}
                      </a>
                    </div>

                    <input
                      type="text"
                      placeholder="Dirección wallet destinataria (0x...)"
                      value={walletToMint}
                      onChange={(e) => setWalletToMint(e.target.value)}
                      className={`w-full p-4 text-xl rounded-xl border-2 ${
                        modoOscuro
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />

                    <button
                      onClick={() => mintNFT(jsonLink)}
                      disabled={
                        !walletToMint ||
                        !jsonLink ||
                        isLoadingPrice ||
                        isMinting
                      }
                      className={`w-full p-5 text-xl rounded-xl font-bold transition-all duration-200 relative overflow-hidden ${
                        !walletToMint ||
                        !jsonLink ||
                        isLoadingPrice ||
                        isMinting
                          ? "bg-gray-400 cursor-not-allowed"
                          : modoOscuro
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      <span className="relative z-10 text-white">
                        {isLoadingPrice
                          ? "⏳ Cargando precio..."
                          : isMinting
                          ? "⏳ Minteando..."
                          : `💎 Mint Certificate NFT (${mintPrice} ETH)`}
                      </span>
                    </button>

                    {mintStatus && (
                      <div
                        className={`p-5 rounded-xl whitespace-pre-line text-xl ${
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

                    <div className="flex justify-center">
                      <button
                        onClick={getMintPrice}
                        disabled={isLoadingPrice}
                        className={`px-8 py-3 text-lg rounded-xl ${
                          modoOscuro
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        } disabled:opacity-50`}
                      >
                        {isLoadingPrice
                          ? "⏳ Actualizando..."
                          : "🔄 Actualizar precio"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorPanel;
