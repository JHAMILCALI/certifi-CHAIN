import { useState } from 'react'
import { PinataSDK } from 'pinata'

interface DirectorPanelProps {
  account: string;
  modoOscuro: boolean;
}

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT, // ⚠️ asegúrate de tener esta variable en tu .env
  pinataGateway: import.meta.env.VITE_GATEWAY_URL,
});

const DirectorPanel = ({ modoOscuro }: DirectorPanelProps) => {
  const [activeTab, setActiveTab] = useState('emitir');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [link, setLink] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadStatus('🌀 Obteniendo URL prefirmada...');
      const urlResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/presigned_url`);
      const data = await urlResponse.json();

      setUploadStatus('⬆️ Subiendo certificado a IPFS...');
      const upload = await pinata.upload.public.file(file).url(data.url);

      if (upload.cid) {
        const ipfsLink = await pinata.gateways.public.convert(upload.cid);
        setLink(ipfsLink);
        setUploadStatus('✅ Certificado subido exitosamente.');
      } else {
        setUploadStatus('❌ Falló la subida del archivo.');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus(`⚠️ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
        Panel de Director/Administrativo
      </h1>

      <div className={`flex border-b mb-6 ${modoOscuro ? 'border-gray-700' : 'border-gray-200'}`}>
        {['emitir', 'verificar', 'historial', 'reportes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${modoOscuro ? 'text-gray-300' : 'text-gray-600'} ${
              activeTab === tab
                ? modoOscuro
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'border-b-2 border-blue-500 text-blue-600'
                : ''
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={`p-6 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white shadow'}`}>
        {activeTab === 'emitir' && (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Emitir Nuevos Certificados
            </h2>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4"
            />
            <button
              onClick={handleUpload}
              disabled={!file}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Subir Certificado
            </button>

            {uploadStatus && (
              <div className={`mt-4 p-2 rounded ${modoOscuro ? 'bg-gray-700 text-green-300' : 'bg-gray-100 text-green-700'}`}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorPanel;
