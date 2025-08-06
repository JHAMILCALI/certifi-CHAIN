import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from "./contracts/CertifyRoles";
import Web3Modal from 'web3modal';
import AdminPanel from './components/AdminPanel';
import DirectorPanel from './components/DirectorPanel';
import StudentPanel from './components/StudentPanel';
//import RoleSelector from './components/RoleSelector';


// Tipos para los roles
type UserRole = 'admin' | 'director' | 'student' | null;

const App = () => {
  const [account, setAccount] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(true);

  // Simulación: Verificar rol basado en la dirección de la wallet
  const verificarRol = async (address: string, signer: any): Promise<UserRole> => {
  try {
    const contract = getContract(signer);
    const role: string = await contract.checkRole(address);
    if (role === "admin" || role === "director" || role === "student") {
      return role as UserRole;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error verificando rol:", error);
    return null;
  }
};

  const conectarBilletera = async () => {
  setLoading(true);
  try {
    const web3Modal = new Web3Modal();
    const conexion = await web3Modal.connect();
    const proveedor = new ethers.BrowserProvider(conexion);
    const firmante = await proveedor.getSigner();
    const direccion = await firmante.getAddress();

    const rol = await verificarRol(direccion, firmante); // ← ahora pasas el signer

    setAccount(direccion);
    setUserRole(rol);
  } catch (error) {
    console.error("Error conectando billetera:", error);
  } finally {
    setLoading(false);
  }
};


  const alternarModo = () => {
    setModoOscuro(!modoOscuro);
  };

  // Aplicar clase de modo oscuro/claro al elemento html
  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [modoOscuro]);

  const desconectar = () => {
    setAccount('');
    setUserRole(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${modoOscuro ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Encabezado común para todos los roles */}
      <header className={`shadow-sm ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${modoOscuro ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                NFT
              </div>
              <span className={`ml-3 text-xl font-semibold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                CertifyChain
                {userRole && (
                  <span className="ml-2 text-sm capitalize">
                    ({userRole})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Botón de modo oscuro/claro */}
              <button onClick={alternarModo} className={`p-2 rounded-full ${modoOscuro ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}>
                {modoOscuro ? '☀️' : '🌙'}
              </button>

              {/* Estado de conexión */}
              {account ? (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                    {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                  </span>
                  <button 
                    onClick={desconectar}
                    className={`px-3 py-1 rounded-lg text-sm ${modoOscuro ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <button 
                  onClick={conectarBilletera}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition ${modoOscuro ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Conectando...' : 'Conectar Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal basado en el rol */}
      <main className="container mx-auto px-6 py-8">
        {!account ? (
          <div className="text-center max-w-2xl mx-auto">
            <h1 className={`text-3xl md:text-4xl font-bold mb-6 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Plataforma de Certificados NFT
            </h1>
            <p className={`text-xl mb-8 ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
              Conecta tu billetera para acceder al panel correspondiente según tu rol en la plataforma.
            </p>
            <button 
              onClick={conectarBilletera}
              disabled={loading}
              className={`px-8 py-3 rounded-lg transition font-medium ${modoOscuro ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Conectando...' : 'Conectar Wallet'}
            </button>
          </div>
        ) : userRole === 'admin' ? (
          <AdminPanel account={account} modoOscuro={modoOscuro} />
        ) : userRole === 'director' ? (
          <DirectorPanel account={account} modoOscuro={modoOscuro} />
        ) : (
          <StudentPanel account={account} modoOscuro={modoOscuro} />
        )}
      </main>
    </div>
  );
};

export default App;