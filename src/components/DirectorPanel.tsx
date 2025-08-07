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

      // Convert Blob to File
      const file = new File([blob], fileName, { type: "image/jpeg" });

      const upload = await pinata.upload.public
        .file(file, {
          metadata: {
            name: fileName,
          },
        })
        .url(data.url);

      if (upload.cid) {
        const ipfsLink = await pinata.gateways.public.convert(upload.cid);
        setLink(ipfsLink);
        setUploadStatus("✅ Certificado subido exitosamente.");
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

  return (
    <div className={`min-h-screen ${modoOscuro ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Contenedor principal con márgenes */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className={`p-6 rounded-lg ${modoOscuro ? "bg-gray-800" : "bg-white shadow"}`}>
          <h1
            className={`text-3xl font-bold mb-6 ${
              modoOscuro ? "text-white" : "text-gray-800"
            }`}
          >
            Panel de Director/Administrativo
          </h1>

          <div
            className={`flex border-b mb-6 ${
              modoOscuro ? "border-gray-700" : "border-gray-200"
            }`}
          >
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

          <div
            className={`p-6 rounded-lg ${
              modoOscuro ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            {activeTab === "emitir" && (
              <>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Columna izquierda - Formulario */}
                  <div className="w-full md:w-1/2">
                    <h2
                      className={`text-xl font-semibold mb-4 ${
                        modoOscuro ? "text-white" : "text-gray-800"
                      }`}
                    >
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

                  {/* Columna derecha - Vista previa del certificado */}
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
                      <h1
                        style={{
                          fontSize: "50px",
                          fontWeight: "bold",
                          marginBottom: "30px",
                          color: "#000",
                        }}
                      >
                        {nombre}
                      </h1>
                      <h2
                        style={{
                          fontSize: "32px",
                          marginBottom: "10px",
                          color: "#000",
                        }}
                      >
                        {institucion}
                      </h2>
                      <p style={{ fontSize: "24px", color: "#000" }}>
                        Fecha: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fila separada para el botón centrado con efecto RGB */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleUpload}
                    className="px-6 py-3 rounded-lg font-semibold shadow transition-all duration-200 relative overflow-hidden group"
                    style={{ zIndex: 1 }}
                  >
                    {/* Fondo RGB animado (solo visible en hover) */}
                    <span
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(270deg, #ff0080, #7928ca, #00ffea, #ff0080)',
                        backgroundSize: '600% 600%',
                        animation: 'rgbGlow 2s linear infinite',
                        filter: 'blur(12px)',
                        zIndex: 0,
                      }}
                    />
                    {/* Capa base del botón */}
                    <span 
                      className={`absolute inset-0 ${modoOscuro ? 'bg-blue-600' : 'bg-blue-500'} rounded-lg`}
                      style={{ zIndex: -1 }}
                    />
                    {/* Texto del botón */}
                    <span className="relative z-10 text-white">
                      Generar y Subir Certificado
                    </span>
                  </button>
                </div>

                {uploadStatus && (
                  <div
                    className={`mt-4 p-2 rounded text-center ${
                      modoOscuro
                        ? "bg-gray-700 text-green-300"
                        : "bg-gray-100 text-green-700"
                    }`}
                  >
                    {uploadStatus}
                  </div>
                )}

                {link && (
                  <div className="mt-4 text-center">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-400"
                    >
                      Ver Certificado IPFS
                    </a>
                  </div>
                )}

                {/* Estilos para la animación RGB */}
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