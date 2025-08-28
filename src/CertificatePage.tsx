import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import AnimatedBackground from './components/AnimatedBackground';
import img1 from './assets/logo.svg';

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

// Configuración de Supabase
const supabase = createClient(
  'https://llemzfnbfdxwxqhpfhzv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZW16Zm5iZmR4d3hxaHBmaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTI5NzMsImV4cCI6MjA3MDU4ODk3M30.TLDKGeJcDtGSLMITfABeFLucNoApEYuRYzgz9lhbziE'
);

const CertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [certificado, setCertificado] = useState<Certificado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener el certificado por ID
  const obtenerCertificado = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('ID de certificado no proporcionado');
        return;
      }

      const { data, error } = await supabase
        .from('certificados')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Certificado no encontrado');
        } else {
          setError('Error al verificar el certificado');
        }
        return;
      }

      setCertificado(data);
    } catch (error) {
      console.error('Error inesperado:', error);
      setError('Error inesperado al verificar certificado');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener estado con color
  const obtenerEstadoInfo = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'emitido':
        return {
          texto: 'Emitido',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icono: '📋',
          descripcion: 'El certificado ha sido generado y está listo'
        };
      case 'minted':
        return {
          texto: 'NFT Certificado',
          color: 'bg-green-100 text-green-800 border-green-300',
          icono: '💎',
          descripcion: 'Certificado registrado permanentemente en blockchain'
        };
      case 'revocado':
        return {
          texto: 'Revocado',
          color: 'bg-red-100 text-red-800 border-red-300',
          icono: '❌',
          descripcion: 'Este certificado ha sido revocado'
        };
      default:
        return {
          texto: estado,
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icono: '📄',
          descripcion: 'Estado del certificado'
        };
    }
  };

  // Función para copiar al portapapeles
  const copiarTexto = (texto: string, mensaje: string) => {
    navigator.clipboard.writeText(texto);
    alert(mensaje);
  };

  // Función para abrir enlaces
  const abrirEnlace = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    obtenerCertificado();
  }, [id]);

  return (
  <div className="min-h-screen relative bg-gray-950 text-gray-100">
    <AnimatedBackground />
    
    {/* Header */}
    <div className="bg-gray-900 shadow-sm border-b border-gray-800 relative z-10">
  <div className="max-w-4xl mx-auto px-4 py-8"> {/* aumenté py-6 -> py-8 */}
    <h1 
      className="text-4xl md:text-5xl font-extrabold mb-6 relative leading-tight md:leading-snug"
      style={{
        background:
          "linear-gradient(90deg, #ff0080, #7928ca, #00ffea, #ff0080)",
        backgroundSize: "400% 400%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "rgbTextGlow 3s linear infinite",
        textAlign: "center"
      }}
    >
      Verificación de Certificado Digital
      <style>
        {`
          @keyframes rgbTextGlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </h1>

    <div className="flex items-center py-4 justify-center">
  <img
    src={img1}
    alt="CertiChain Logo"
    className="h-15 w-auto max-w-none md:h-20 lg:h-25"  // Aumenté el tamaño
    style={{
      minWidth: "300px",  // Aumenté el ancho mínimo
      objectFit: "contain",
    }}
  />
</div>
  </div>
</div>


    {/* Contenido principal */}
    <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
      {loading ? (
        // Estado de carga
        <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-800">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Verificando certificado...
          </h2>
          <p className="text-gray-400">
            Consultando información en la base de datos
          </p>
        </div>
      ) : error ? (
        // Estado de error
        <div className="bg-gray-900 rounded-2xl shadow-lg p-12 text-center border border-gray-800">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-3xl font-bold text-red-500 mb-4">
            {error}
          </h2>
          <p className="text-gray-400 mb-8">
            No se pudo verificar la autenticidad de este certificado.
          </p>
          <div className="bg-red-950 border border-red-700 rounded-xl p-6">
            <h3 className="font-semibold text-red-300 mb-2">
              ID consultado:
            </h3>
            <code className="bg-red-900 px-3 py-2 rounded font-mono text-sm text-red-200">
              {id}
            </code>
          </div>

          <button
  onClick={obtenerCertificado}
  className="group relative mt-6 px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors overflow-hidden"
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

  {/* Texto visible por encima */}
  <span className="relative z-10">Intentar Nuevamente</span>

  {/* Animación keyframes */}
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
      ) : certificado ? (
        // Certificado encontrado
        <div className="space-y-8">
          {/* Status Badge */}
          <div className="text-center">
            <div className={`inline-flex items-center px-6 py-3 rounded-full border ${obtenerEstadoInfo(certificado.estado).color} font-semibold text-lg`}>
              <span className="text-2xl mr-2">{obtenerEstadoInfo(certificado.estado).icono}</span>
              {obtenerEstadoInfo(certificado.estado).texto}
            </div>
            <p className="text-gray-400 mt-2">
              {obtenerEstadoInfo(certificado.estado).descripcion}
            </p>
          </div>

          {/* Información principal del certificado */}
          <div className="bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-4xl font-bold mb-2">
                {certificado.nombre_estudiante}
              </h2>
              <p className="text-blue-200 text-xl">
                {certificado.institucion}
              </p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Información básica */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <span className="text-2xl mr-2">📋</span>
                      Información del Certificado
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start p-4 bg-gray-800 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Estudiante</p>
                          <p className="text-lg font-semibold text-white">
                            {certificado.nombre_estudiante}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-start p-4 bg-gray-800 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Institución</p>
                          <p className="text-lg font-semibold text-white">
                            {certificado.institucion}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-start p-4 bg-gray-800 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Fecha de emisión</p>
                          <p className="text-lg font-semibold text-white">
                            {formatearFecha(certificado.fecha_emision)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información técnica */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <span className="text-2xl mr-2">🔧</span>
                      Información Técnica
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800 rounded-xl">
                        <p className="text-sm font-medium text-gray-400 mb-2">ID del Certificado</p>
                        <div className="flex items-center justify-between">
                          <code className="bg-gray-700 px-3 py-1 rounded text-sm font-mono text-gray-200">
                            {certificado.id}
                          </code>
                          <button
                            onClick={() => copiarTexto(certificado.id, 'ID copiado al portapapeles')}
                            className="text-blue-400 hover:text-blue-600 text-sm font-medium"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>

                      {certificado.wallet_destinatario && (
                        <div className="p-4 bg-gray-800 rounded-xl">
                          <p className="text-sm font-medium text-gray-400 mb-2">Wallet del Estudiante</p>
                          <div className="flex items-center justify-between">
                            <code className="bg-gray-700 px-3 py-1 rounded text-sm font-mono truncate mr-2 text-gray-200">
                              {certificado.wallet_destinatario}
                            </code>
                            <button
                              onClick={() => copiarTexto(certificado.wallet_destinatario, 'Wallet copiada al portapapeles')}
                              className="text-blue-400 hover:text-blue-600 text-sm font-medium whitespace-nowrap"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      )}

                      {certificado.creado_por && (
                        <div className="p-4 bg-gray-800 rounded-xl">
                          <p className="text-sm font-medium text-gray-400 mb-2">Emisor</p>
                          <code className="bg-gray-700 px-3 py-1 rounded text-sm font-mono truncate text-gray-200">
                            {certificado.creado_por}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen del certificado */}
          {certificado.ipfs_certificado && (
            <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <span className="text-3xl mr-3">🖼️</span>
                Certificado Digital
              </h3>
              <div className="flex justify-center">
                <img
                  src={certificado.ipfs_certificado}
                  alt={`Certificado de ${certificado.nombre_estudiante}`}
                  className="max-w-full h-auto rounded-xl shadow-md border border-gray-700"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </div>
          )}

          {/* Acciones y enlaces */}
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
              <span className="text-3xl mr-3">🔗</span>
              Enlaces y Verificación
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {certificado.ipfs_certificado && (
                <button
                  onClick={() => abrirEnlace(certificado.ipfs_certificado!)}
                  className="w-full p-4 bg-blue-950 hover:bg-blue-900 border border-blue-700 rounded-xl transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📜</div>
                  <div className="font-semibold text-blue-300">Ver Certificado</div>
                  <div className="text-sm text-blue-400">Abrir imagen IPFS</div>
                </button>
              )}

              {certificado.ipfs_metadata && (
                <button
                  onClick={() => abrirEnlace(certificado.ipfs_metadata!)}
                  className="w-full p-4 bg-green-950 hover:bg-green-900 border border-green-700 rounded-xl transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-semibold text-green-300">Metadata JSON</div>
                  <div className="text-sm text-green-400">Ver información técnica</div>
                </button>
              )}

              {certificado.tx_hash && (
                <button
                  onClick={() => abrirEnlace(`https://sepolia.etherscan.io/tx/${certificado.tx_hash}`)}
                  className="w-full p-4 bg-purple-950 hover:bg-purple-900 border border-purple-700 rounded-xl transition-colors text-center"
                >
                  <div className="text-2xl mb-2">⛓️</div>
                  <div className="font-semibold text-purple-300">Ver en Blockchain</div>
                  <div className="text-sm text-purple-400">Etherscan Sepolia</div>
                </button>
              )}
            </div>

            {/* Información de verificación */}
            <div className="mt-8 p-6 bg-green-950 border border-green-700 rounded-xl">
              <div className="flex items-center justify-center mb-4">
                <div className="text-4xl mr-3">✅</div>
                <h4 className="text-xl font-bold text-green-300">
                  Certificado Verificado
                </h4>
              </div>
              <p className="text-green-400 text-center mb-4">
                Este certificado ha sido verificado exitosamente y está registrado en nuestro sistema.
              </p>
              <div className="text-center text-sm text-green-500">
                <p>Última actualización: {formatearFecha(certificado.updated_at)}</p>
                <p className="mt-1">Sistema CertiChain - Certificados Blockchain</p>
              </div>
            </div>
          </div>

          {/* Footer con información adicional */}
          <div className="text-center p-6 bg-gray-900 rounded-xl border border-gray-800">
            <h4 className="font-semibold text-white mb-2">
              ¿Cómo verificar la autenticidad?
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">🔍</div>
                <p><strong>ID único:</strong> Cada certificado tiene un identificador único e irrepetible</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">🌐</div>
                <p><strong>IPFS:</strong> Los archivos están almacenados de forma descentralizada</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-2xl mb-2">⛓️</div>
                <p><strong>Blockchain:</strong> Registro inmutable en red Ethereum (cuando está minteado)</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </div>
);
};

export default CertificatePage;