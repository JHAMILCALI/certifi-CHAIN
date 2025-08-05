import { useState } from 'react';

interface StudentPanelProps {
  account: string;
  modoOscuro: boolean;
}

const StudentPanel = ({ account, modoOscuro }: StudentPanelProps) => {
  const [certificados, setCertificados] = useState<any[]>([]); // Aquí almacenarías los certificados del estudiante

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
        Mis Certificados
      </h1>
      
      <div className={`p-6 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white shadow'}`}>
        {certificados.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificados.map((certificado, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${modoOscuro ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
              >
                <h3 className={`font-semibold mb-2 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                  {certificado.nombre}
                </h3>
                <p className={`text-sm mb-3 ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                  Emitido el: {certificado.fechaEmision}
                </p>
                <button 
                  className={`px-3 py-1 rounded text-sm ${modoOscuro ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  Ver Certificado
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className={`text-xl mb-4 ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
              No tienes certificados registrados aún.
            </p>
            <p className={modoOscuro ? 'text-gray-400' : 'text-gray-500'}>
              Los certificados que recibas aparecerán aquí automáticamente.
            </p>
          </div>
        )}
      </div>
      
      <div className={`mt-8 p-6 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white shadow'}`}>
        <h2 className={`text-xl font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
          Compartir Certificados
        </h2>
        <p className={`mb-4 ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
          Puedes compartir tus certificados con empleadores o instituciones.
        </p>
        {/* Opciones para compartir */}
      </div>
    </div>
  );
};

export default StudentPanel;