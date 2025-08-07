import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { PinataSDK } from "pinata";
import certificadoImg from '../assets/certificado.jpg'; 

interface DirectorPanelProps {
  account: string;
  modoOscuro: boolean;
}

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_GATEWAY_URL,
});

const DirectorPanel = ({ modoOscuro }: DirectorPanelProps) => {
  const [activeTab, setActiveTab] = useState("emitir");
  const [nombre, setNombre] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [link, setLink] = useState("");
  const [showJsonForm, setShowJsonForm] = useState(false); // 🔽 NUEVO
  const [jsonData, setJsonData] = useState({
    description: "",
    name: "",
    base: "",
    content: ""
  }); // 🔽 NUEVO

  const certRef = useRef<HTMLDivElement>(null);

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
        setShowJsonForm(true); // 🔽 Mostrar formulario para el JSON
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
  // parte del json
  const handleJsonUpload = async () => {
  const metadata = {
    description: jsonData.description,
    external_url: "https://wirawallet.com",
    image: link,
    name: jsonData.name,
    attributes: [
      { trait_type: "Base", value: jsonData.base },
      { trait_type: "Content", value: jsonData.content }
    ]
  };

  try {
    setUploadStatus("📦 Subiendo metadata JSON...");

    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/pinata/json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    const cid = result?.cid;
    if (cid) {
      const ipfsJsonLink = `${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`;
      setUploadStatus(`✅ JSON subido exitosamente. [Ver JSON](${ipfsJsonLink})`);
    } else {
      throw new Error("No se recibió el CID");
    }
  } catch (error: any) {
    console.error("Error al subir JSON:", error);
    setUploadStatus("❌ Error al subir JSON: " + (error?.message || "ver consola"));
  }
};




  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
        Panel de Director/Administrativo
      </h1>

      {/* ...Tabs... */}

      <div className={`p-6 rounded-lg ${modoOscuro ? "bg-gray-800" : "bg-white shadow"}`}>
        {activeTab === "emitir" && (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
              Emitir Nuevos Certificados
            </h2>

            {/* Campos básicos */}
            <input type="text" placeholder="Nombre del estudiante" value={nombre}
              onChange={(e) => setNombre(e.target.value)} className="mb-4 block w-full p-2 border rounded" />
            <input type="text" placeholder="Institución" value={institucion}
              onChange={(e) => setInstitucion(e.target.value)} className="mb-4 block w-full p-2 border rounded" />

            <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
              Generar y Subir Certificado
            </button>

            {uploadStatus && (
              <div className={`mt-4 p-2 rounded ${modoOscuro ? "bg-gray-700 text-green-300" : "bg-gray-100 text-green-700"}`}>
                {uploadStatus}
              </div>
            )}

            {link && (
              <div className="mt-4">
                <a href={link} target="_blank" rel="noopener noreferrer" className="underline text-blue-400">
                  Ver Certificado IPFS
                </a>
              </div>
            )}

            {/* 🔽 FORMULARIO JSON */}
            {showJsonForm && (
              <div className="mt-8 p-4 border rounded bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Llenar Metadata JSON</h3>
                <input type="text" placeholder="Descripción"
                  value={jsonData.description} onChange={(e) => setJsonData({ ...jsonData, description: e.target.value })}
                  className="mb-2 block w-full p-2 border rounded" />
                <input type="text" placeholder="Nombre"
                  value={jsonData.name} onChange={(e) => setJsonData({ ...jsonData, name: e.target.value })}
                  className="mb-2 block w-full p-2 border rounded" />
                <input type="text" placeholder="Base"
                  value={jsonData.base} onChange={(e) => setJsonData({ ...jsonData, base: e.target.value })}
                  className="mb-2 block w-full p-2 border rounded" />
                <input type="text" placeholder="Content"
                  value={jsonData.content} onChange={(e) => setJsonData({ ...jsonData, content: e.target.value })}
                  className="mb-4 block w-full p-2 border rounded" />

                <button onClick={handleJsonUpload} className="bg-green-600 text-white px-4 py-2 rounded">
                  Subir JSON
                </button>
              </div>
            )}

            {/* Certificado Preview */}
            <div ref={certRef} style={{
              width: "1386px",
              height: "980px",
              backgroundImage: `url(${certificadoImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "serif",
              margin: "0 auto",
              boxShadow: "0 0 15px rgba(0,0,0,0.2)",
              borderRadius: "8px",
            }}>
              <h1 style={{ fontSize: "50px", fontWeight: "bold", marginBottom: "30px", color: "#000" }}>{nombre}</h1>
              <h2 style={{ fontSize: "32px", marginBottom: "10px", color: "#000" }}>{institucion}</h2>
              <p style={{ fontSize: "24px", color: "#000" }}>Fecha: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorPanel;
