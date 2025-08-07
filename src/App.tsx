import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from "./contracts/CertifyRoles";
import Web3Modal from 'web3modal';
import AdminPanel from './components/AdminPanel';
import DirectorPanel from './components/DirectorPanel';
import StudentPanel from './components/StudentPanel';
import AnimatedBackground from './components/AnimatedBackground';

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

      const rol = await verificarRol(direccion, firmante);

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
    <div className={`min-h-screen transition-colors duration-300 relative ${modoOscuro ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AnimatedBackground />
      {/* Encabezado común para todos los roles */}
      <header className={`shadow-sm relative z-10 ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
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
              {account && (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                    {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
                  </span>
                  <button 
                    onClick={desconectar}
                    className={`px-3 py-1 rounded-lg text-sm ${modoOscuro ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                    disabled={loading}
                  >
                    Desconectar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal basado en el rol */}
      <main className="flex flex-1 items-center justify-center min-h-[calc(100vh-80px)] relative z-10">
        {!account ? (
          <div className={`text-center max-w-2xl mx-auto flex flex-col justify-center items-center w-full p-8 rounded-xl shadow-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-4xl md:text-5xl font-extrabold mb-6 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Plataforma de Certificados NFT
            </h2>
            <p className={`text-lg md:text-xl mb-8 ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
              Conecta tu billetera para acceder al panel correspondiente según tu rol en la plataforma.
            </p>
            <button 
              onClick={conectarBilletera}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold shadow transition-all duration-200 relative overflow-hidden
                ${modoOscuro ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                group
              `}
              style={{ zIndex: 1 }}
            >
              {/* Efecto RGB animado en el fondo al hacer hover */}
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
              <span className="relative z-10">
                {loading ? 'Conectando...' : 'Conectar Wallet'}
              </span>
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
