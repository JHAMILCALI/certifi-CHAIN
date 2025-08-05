import { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import abiJson from '../contracts/CertifyRoles/CertifyRoles.json';

interface AdminPanelProps {
  account: string;
  modoOscuro: boolean;
}

const AdminPanel = ({ account, modoOscuro }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('instituciones');
  const [directorAddress, setDirectorAddress] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = "0xb676b1737743DDc6C0731b98EDEC32DB299843a2"; // <-- actualiza esto
  const abi = abiJson.abi;

  const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask no está disponible");

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(contractAddress, abi, signer);
};


  const handleAddDirector = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.addDirector(directorAddress);
      await tx.wait();
      setMensaje(`Director ${directorAddress} agregado exitosamente.`);
      setDirectorAddress('');
    } catch (error: any) {
      setMensaje(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDirector = async () => {
    try {
      setLoading(true);
      const contract = getContract();
      const tx = await contract.removeDirector(directorAddress);
      await tx.wait();
      setMensaje(`Director ${directorAddress} eliminado exitosamente.`);
      setDirectorAddress('');
    } catch (error: any) {
      setMensaje(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
        Panel de Administración
      </h1>

      <div className={`flex border-b mb-6 ${modoOscuro ? 'border-gray-700' : 'border-gray-200'}`}>
        {['instituciones', 'directores', 'configuracion', 'auditoria'].map((tab) => (
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
        {activeTab === 'instituciones' && (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Gestión de Instituciones
            </h2>
            <p className={modoOscuro ? 'text-gray-300' : 'text-gray-600'}>
              Aquí puedes agregar, editar o eliminar instituciones autorizadas para emitir certificados.
            </p>
          </div>
        )}

        {activeTab === 'directores' && (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Gestión de Directores
            </h2>
            <p className={modoOscuro ? 'text-gray-300' : 'text-gray-600 mb-4'}>
              Administra los directores y administrativos que pueden gestionar certificados.
            </p>

            <input
              type="text"
              placeholder="Dirección del director"
              value={directorAddress}
              onChange={(e) => setDirectorAddress(e.target.value)}
              className="border px-4 py-2 w-full mb-4 rounded"
            />

            <div className="flex gap-4">
              <button onClick={handleAddDirector} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
                Agregar Director
              </button>
              <button onClick={handleRemoveDirector} disabled={loading} className="bg-red-500 text-white px-4 py-2 rounded">
                Eliminar Director
              </button>
            </div>

            {mensaje && (
              <div className={`mt-4 p-2 rounded ${modoOscuro ? 'bg-gray-700 text-green-300' : 'bg-gray-100 text-green-700'}`}>
                {mensaje}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;