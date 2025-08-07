import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { PinataSDK } from "pinata";

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
  const [mostrarCertificado, setMostrarCertificado] = useState(false);

  const handleUpload = async () => {
    if (!nombre || !institucion) {
      setUploadStatus("⚠️ Por favor completa todos los campos.");
      return;
    }

    setMostrarCertificado(true); // Mostrar certificado antes de capturarlo

    try {
      setUploadStatus("🖼️ Generando imagen...");
      await new Promise((r) => setTimeout(r, 100)); // Espera breve para renderizar

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
        const errorText = await urlResponse.text();
        throw new Error(`Error al obtener URL prefirmada: ${urlResponse.status} - ${errorText}`);
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
    <div>
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
          <div>
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

            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Generar y Subir Certificado
            </button>

            {uploadStatus && (
              <div
                className={`mt-4 p-2 rounded ${
                  modoOscuro
                    ? "bg-gray-700 text-green-300"
                    : "bg-gray-100 text-green-700"
                }`}
              >
                {uploadStatus}
              </div>
            )}

            {link && (
              <div className="mt-4">
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

            {/* Vista previa del certificado (solo si mostrarCertificado es true) */}
            {mostrarCertificado && (
              <div
                ref={certRef}
                style={{
                  width: "500px",
                  height: "350px",
                  backgroundImage: `url('/src/assets/certificado.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  fontFamily: "serif",
                  position: "relative",
                  margin: "0 auto",
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorPanel;
