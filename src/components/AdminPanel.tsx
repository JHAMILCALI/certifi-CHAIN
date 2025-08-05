import { useState } from 'react';

interface AdminPanelProps {
  account: string;
  modoOscuro: boolean;
}

const AdminPanel = ({ account, modoOscuro }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('instituciones');

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
        Panel de Administración
      </h1>
      
      {/* Pestañas */}
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
      
      {/* Contenido de las pestañas */}
      <div className={`p-6 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white shadow'}`}>
        {activeTab === 'instituciones' && (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Gestión de Instituciones
            </h2>
            <p className={modoOscuro ? 'text-gray-300' : 'text-gray-600'}>
              Aquí puedes agregar, editar o eliminar instituciones autorizadas para emitir certificados.
            </p>
            {/* Tabla de instituciones, formularios, etc. */}
          </div>
        )}
        
        {activeTab === 'directores' && (
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
              Gestión de Directores
            </h2>
            <p className={modoOscuro ? 'text-gray-300' : 'text-gray-600'}>
              Administra los directores y administrativos que pueden gestionar certificados.
            </p>
          </div>
        )}
        
        {/* Otras pestañas... */}
      </div>
    </div>
  );
};

export default AdminPanel;