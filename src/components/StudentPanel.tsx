import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";

interface StudentPanelProps {
  account: string;
  modoOscuro: boolean;
}

interface Certificado {
  id: string;
  nombre_estudiante: string;
  institucion: string;
  wallet_destinatario: string;
  fecha_emision: string;
  ipfs_certificado: string | null;
  ipfs_metadata: string | null;
  tx_hash: string | null;
  estado: string;
  creado_por: string | null;
  created_at: string;
  updated_at: string;
}

// Configuración de Supabase (usar las mismas credenciales)
const supabase = createClient(
  "https://llemzfnbfdxwxqhpfhzv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZW16Zm5iZmR4d3hxaHBmaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTI5NzMsImV4cCI6MjA3MDU4ODk3M30.TLDKGeJcDtGSLMITfABeFLucNoApEYuRYzgz9lhbziE"
);

const StudentPanel = ({ account, modoOscuro }: StudentPanelProps) => {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarImportar, setMostrarImportar] = useState(false);

  // Función para obtener los certificados del estudiante
  const obtenerCertificadosEstudiante = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Buscando certificados para wallet:", account);

      const { data, error } = await supabase
        .from("certificados")
        .select("*")
        .ilike("wallet_destinatario", account) // Búsqueda case-insensitive
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error consultando certificados:", error);
        setError("Error al cargar los certificados");
        return;
      }

      console.log("📋 Certificados encontrados:", data);
      setCertificados(data || []);
    } catch (error) {
      console.error("Error inesperado:", error);
      setError("Error inesperado al cargar certificados");
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener estado con emoji
  const obtenerEstadoConEmoji = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "emitido":
        return "📋 Emitido";
      case "minted":
        return "💎 NFT Minteado";
      case "revocado":
        return "❌ Revocado";
      default:
        return `📄 ${estado}`;
    }
  };

  // Función para ver certificado en IPFS
  const verCertificadoIPFS = (ipfsUrl: string) => {
    window.open(ipfsUrl, "_blank");
  };

  // Función para ver metadata JSON
  const verMetadataJSON = (metadataUrl: string) => {
    window.open(metadataUrl, "_blank");
  };

  // Función para ver transacción en blockchain (Sepolia Etherscan)
  const verTransaccionBlockchain = (txHash: string) => {
    const blockchainExplorer = "https://sepolia.etherscan.io/tx/";
    window.open(`${blockchainExplorer}${txHash}`, "_blank");
  };

  // Función para copiar wallet al portapapeles
  const copiarWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
    alert("Wallet copiada al portapapeles");
  };

  // useEffect para cargar certificados cuando cambie la wallet
  useEffect(() => {
    if (account) {
      obtenerCertificadosEstudiante();
    }
  }, [account]);

  return (
    <div
      className={`min-h-screen ${modoOscuro ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div
          className={`p-6 rounded-lg ${
            modoOscuro ? "bg-gray-800" : "bg-white shadow"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h1
              className={`text-3xl font-bold ${
                modoOscuro ? "text-white" : "text-gray-800"
              }`}
            >
              📜 Mis Certificados
            </h1>
            <button
              onClick={obtenerCertificadosEstudiante}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : modoOscuro
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? "⏳ Cargando..." : "🔄 Actualizar"}
            </button>
          </div>

          {/* Información de la wallet conectada */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              modoOscuro
                ? "bg-gray-700 border border-gray-600"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <p
              className={`text-sm ${
                modoOscuro ? "text-gray-300" : "text-blue-800"
              }`}
            >
              🔗 <strong>Wallet conectada:</strong>
              <span
                className="font-mono ml-2 cursor-pointer hover:underline"
                onClick={() => copiarWallet(account)}
                title="Clic para copiar"
              >
                {account}
              </span>
            </p>
            <p
              className={`text-xs mt-1 ${
                modoOscuro ? "text-gray-400" : "text-blue-600"
              }`}
            >
              Solo se muestran los certificados emitidos para esta wallet
            </p>
          </div>

          {/* Contenido principal */}
          {loading ? (
            <div className="text-center py-12">
              <div
                className={`text-2xl mb-4 ${
                  modoOscuro ? "text-gray-300" : "text-gray-600"
                }`}
              >
                ⏳ Cargando certificados...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className={`text-xl mb-4 text-red-500`}>❌ {error}</div>
              <button
                onClick={obtenerCertificadosEstudiante}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                🔄 Reintentar
              </button>
            </div>
          ) : certificados.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificados.map((certificado) => (
                <div
                  key={certificado.id}
                  className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
                    modoOscuro
                      ? "border-gray-700 bg-gray-700 hover:bg-gray-650"
                      : "border-gray-200 bg-white hover:shadow-xl"
                  }`}
                >
                  {/* Header del certificado */}
                  <div className="mb-4">
                    <h3
                      className={`font-semibold text-lg mb-2 ${
                        modoOscuro ? "text-white" : "text-gray-800"
                      }`}
                    >
                      👨‍🎓 {certificado.nombre_estudiante}
                    </h3>
                    <p
                      className={`text-sm mb-2 ${
                        modoOscuro ? "text-blue-300" : "text-blue-600"
                      }`}
                    >
                      🏫 {certificado.institucion}
                    </p>
                    <div
                      className={`text-sm mb-2 ${
                        modoOscuro ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      📅 <strong>Emitido:</strong>{" "}
                      {formatearFecha(certificado.fecha_emision)}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        certificado.estado === "minted"
                          ? "text-green-500"
                          : certificado.estado === "revocado"
                          ? "text-red-500"
                          : modoOscuro
                          ? "text-yellow-400"
                          : "text-yellow-600"
                      }`}
                    >
                      {obtenerEstadoConEmoji(certificado.estado)}
                    </div>
                  </div>

                  {/* Mostrar imagen del certificado si existe */}
                  {certificado.ipfs_certificado && (
                    <div className="mb-4">
                      <img
                        src={certificado.ipfs_certificado}
                        alt={`Certificado de ${certificado.nombre_estudiante}`}
                        className="w-full rounded-md border"
                        style={{ maxHeight: 250, objectFit: "contain" }}
                      />
                    </div>
                  )}

                  {/* Información técnica */}
                  <div
                    className={`mb-4 p-3 rounded text-xs ${
                      modoOscuro
                        ? "bg-gray-800 border border-gray-600"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div
                      className={`mb-1 ${
                        modoOscuro ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      🆔 <span className="font-mono">{certificado.id}</span>
                    </div>
                    {certificado.creado_por && (
                      <div
                        className={`mb-1 ${
                          modoOscuro ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        🏛️ Emisor:{" "}
                        <span className="font-mono text-xs">
                          {certificado.creado_por.substring(0, 10)}...
                        </span>
                      </div>
                    )}
                    {certificado.tx_hash && (
                      <div
                        className={`${
                          modoOscuro ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        ⛓️ TX:{" "}
                        <span className="font-mono text-xs">
                          {certificado.tx_hash.substring(0, 10)}...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-2">
                    {certificado.ipfs_certificado && (
                      <button
                        onClick={() =>
                          verCertificadoIPFS(certificado.ipfs_certificado!)
                        }
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                          modoOscuro
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        📜 Ver Certificado (IPFS)
                      </button>
                    )}

                    {certificado.ipfs_metadata && (
                      <button
                        onClick={() =>
                          verMetadataJSON(certificado.ipfs_metadata!)
                        }
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                          modoOscuro
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        📋 Ver Metadata JSON
                      </button>
                    )}

                    {certificado.tx_hash && (
                      <button
                        onClick={() =>
                          verTransaccionBlockchain(certificado.tx_hash!)
                        }
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                          modoOscuro
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-purple-500 hover:bg-purple-600 text-white"
                        }`}
                      >
                        ⛓️ Ver en Blockchain
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p
                className={`text-xl mb-4 ${
                  modoOscuro ? "text-gray-300" : "text-gray-600"
                }`}
              >
                No tienes certificados registrados aún.
              </p>
              <p
                className={`mb-6 ${
                  modoOscuro ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Los certificados que recibas para la wallet{" "}
                <strong>{account}</strong> aparecerán aquí automáticamente.
              </p>
              <button
                onClick={obtenerCertificadosEstudiante}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  modoOscuro
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                🔄 Verificar de nuevo
              </button>
            </div>
          )}
        </div>

        {/* Panel de compartir certificados */}
        {certificados.length > 0 && (
          <div
            className={`mt-8 p-6 rounded-lg ${
              modoOscuro ? "bg-gray-800" : "bg-white shadow"
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                modoOscuro ? "text-white" : "text-gray-800"
              }`}
            >
              🔗 Compartir Certificados
            </h2>
            <p
              className={`mb-4 ${
                modoOscuro ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Puedes compartir tus certificados con empleadores o instituciones
              usando los enlaces IPFS.
            </p>

            <div
              className={`p-4 rounded-lg ${
                modoOscuro
                  ? "bg-gray-700 border border-gray-600"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <h3
                className={`font-medium mb-2 ${
                  modoOscuro ? "text-white" : "text-gray-800"
                }`}
              >
                💡 Opciones para compartir:
              </h3>
              <ul
                className={`text-sm space-y-1 ${
                  modoOscuro ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <li>
                  📜 <strong>Certificado visual:</strong> Enlace directo a la
                  imagen del certificado
                </li>
                <li>
                  📋 <strong>Metadata JSON:</strong> Información técnica y
                  atributos del certificado
                </li>
                <li>
                  ⛓️ <strong>Blockchain:</strong> Prueba inmutable en la
                  blockchain (solo certificados minteados)
                </li>
                <li>
                  🆔 <strong>ID del certificado:</strong> Identificador único
                  para verificación
                </li>
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => copiarWallet(account)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  modoOscuro
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                📋 Copiar mi wallet
              </button>

              <button
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  modoOscuro
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                onClick={() => {
                  const resumen = `🎓 Tengo ${certificados.length} certificado(s) registrado(s) en la wallet: ${account}`;
                  navigator.clipboard.writeText(resumen);
                  alert("Resumen copiado al portapapeles");
                }}
              >
                📊 Copiar resumen
              </button>

              {/* Nuevo botón para importar NFT */}
              <button
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  modoOscuro
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
                onClick={() => setMostrarImportar(!mostrarImportar)}
              >
                🪙 Importar NFT a MetaMask
              </button>
            </div>

            {/* Bloque de instrucciones */}
            {mostrarImportar && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  modoOscuro
                    ? "border-gray-600 bg-gray-700"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    modoOscuro ? "text-white" : "text-gray-800"
                  }`}
                >
                  🪙 Pasos para importar tu NFT en MetaMask
                </h3>
                <ol
                  className={`list-decimal list-inside space-y-2 ${
                    modoOscuro ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>
                    En la parte de ariba nos saldra los certificados que hemos
                    recibido.
                    
                    Le daremos en <strong>Ver en Blochain</strong> para que nos lleve a ver donde esta nuetro NFT.
                    <div className="mt-4">
                  <img
                    src={img1}
                    alt="Ejemplo importar NFT"
                    className="rounded-lg shadow-md"
                  />
                </div>
                  </li>
                  <li>
                    Ve al apartdo <strong>copiar direcion</strong> y verificamos el numero de ID{" "}
                    <strong>"En este caso es el 7"</strong>.
                    <div className="mt-4">
                  <img
                    src={img2}
                    alt="Ejemplo importar NFT"
                    className="rounded-lg shadow-md"
                  />
                </div>
                  </li>
                  <li>
                    Abre tu billetera MetaMask y sigue los siguintes pasos{" "} cuando estemos en agregar nft selecionamos la red de <strong>sepolia</strong>
                    , en direcion pegamos lo que copiamos la direcion de la blockchain y en ID 7 y le damos a <strong>Importar</strong>.
                    <div className="mt-4">
                  <img
                    src={img3}
                    alt="Ejemplo importar NFT"
                    className="rounded-lg shadow-md"
                  />
                </div>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPanel;
