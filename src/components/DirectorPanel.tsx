import { useState } from 'react';

interface DirectorPanelProps {
  account: string;
  modoOscuro: boolean;
}

const DirectorPanel = ({ account, modoOscuro }: DirectorPanelProps) => {
  const [activeTab, setActiveTab] = useState('emitir');

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
            {/* Formulario para emitir certificados */}
          </div>
        )}
        
        {activeTab === 'verificar' && (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Verificar Certificados Existentes
            </h2>
            {/* Herramientas de verificación */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorPanel;