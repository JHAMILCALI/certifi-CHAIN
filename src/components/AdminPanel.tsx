import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import abiJson from "../contracts/CertifyRoles/CertifyRoles.json";

interface AdminPanelProps {
  account: string;
  modoOscuro: boolean;
}

const AdminPanel = ({ modoOscuro }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState("instituciones");
  const [directorAddress, setDirectorAddress] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [directores, setDirectores] = useState<string[]>([]);
  const [studentAddress, setStudentAddress] = useState("");
  const [estudiantes, setEstudiantes] = useState<string[]>([]);

  const contractAddress = "0xDaC5fd597801Fe86422fE64D714F9F6452424927"; // <-- actualiza esto
  const abi = abiJson.abi;

  const getContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask no está disponible");

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(contractAddress, abi, signer);
  };

  const fetchDirectores = async () => {
    try {
      const contract = await getContract();
      const result = await contract.getAllDirectors();
      setDirectores(result);
    } catch (error) {
      console.error("Error al obtener directores:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "directores") {
      fetchDirectores();
    }
  }, [activeTab]);

  const handleAddDirector = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.addDirector(directorAddress);
      await tx.wait();
      setMensaje(`Director ${directorAddress} agregado exitosamente.`);
      setDirectorAddress("");
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        setMensaje("❌ Acción cancelada por el usuario.");
      } else {
        setMensaje(`⚠️ Error: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDirector = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.removeDirector(directorAddress);
      await tx.wait();
      setMensaje(`Director ${directorAddress} eliminado exitosamente.`);
      setDirectorAddress("");
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        setMensaje("❌ Acción cancelada por el usuario.");
      } else {
        setMensaje(`⚠️ Error: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const contract = await getContract();
      const result = await contract.getAllStudents();
      setEstudiantes(result);
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
    }
  };

  const handleAddStudent = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.addStudent(studentAddress);
      await tx.wait();
      setMensaje(`Estudiante ${studentAddress} agregado exitosamente.`);
      setStudentAddress("");
      fetchEstudiantes(); // actualizar lista
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        setMensaje("❌ Acción cancelada por el usuario.");
      } else {
        setMensaje(`⚠️ Error: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.removeStudent(studentAddress);
      await tx.wait();
      setMensaje(`Estudiante ${studentAddress} eliminado exitosamente.`);
      setStudentAddress("");
      fetchEstudiantes(); // actualizar lista
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        setMensaje("❌ Acción cancelada por el usuario.");
      } else {
        setMensaje(`⚠️ Error: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (activeTab === "estudiantes") {
    fetchEstudiantes();
  }
}, [activeTab]);


  return (
    <div>
      <h1
        className={`text-3xl font-bold mb-6 ${
          modoOscuro ? "text-white" : "text-gray-800"
        }`}
      >
        Panel de Administración
      </h1>

      <div
        className={`flex border-b mb-6 ${
          modoOscuro ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {[
          "instituciones",
          "directores",
          "estudiantes",
          "configuracion",
          "auditoria",
        ].map((tab) => (
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
        {activeTab === "instituciones" && (
          <div>
            <h2
              className={`text-xl font-semibold mb-4 ${
                modoOscuro ? "text-white" : "text-gray-800"
              }`}
            >
              Gestión de Instituciones
            </h2>
            <p className={modoOscuro ? "text-gray-300" : "text-gray-600"}>
              Aquí puedes agregar, editar o eliminar instituciones autorizadas
              para emitir certificados.
            </p>
          </div>
        )}

        {activeTab === "directores" && (
          <div>
            <h2
              className={`text-xl font-semibold mb-4 ${
                modoOscuro ? "text-white" : "text-gray-800"
              }`}
            >
              Gestión de Directores
            </h2>
            <p className={modoOscuro ? "text-gray-300" : "text-gray-600 mb-4"}>
              Administra los directores y administrativos que pueden gestionar
              certificados.
            </p>

            <input
              type="text"
              placeholder="Dirección del director"
              value={directorAddress}
              onChange={(e) => setDirectorAddress(e.target.value)}
              className="border px-4 py-2 w-full mb-4 rounded"
            />

            <div className="flex gap-4">
              <button
                onClick={handleAddDirector}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Agregar Director
              </button>
              <button
                onClick={handleRemoveDirector}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Eliminar Director
              </button>
            </div>

            {mensaje && (
              <div
                className={`mt-4 p-2 rounded ${
                  modoOscuro
                    ? "bg-gray-700 text-green-300"
                    : "bg-gray-100 text-green-700"
                }`}
              >
                {mensaje}
              </div>
            )}

            {directores.length > 0 && (
              <div className="mt-6">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    modoOscuro ? "text-white" : "text-gray-800"
                  }`}
                >
                  Lista de Directores:
                </h3>
                <ul className="list-disc pl-5">
                  {directores.map((dir, index) => (
                    <li
                      key={index}
                      className={`${
                        modoOscuro ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {dir}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "estudiantes" && (
          <div>
            <h2
              className={`text-xl font-semibold mb-4 ${
                modoOscuro ? "text-white" : "text-gray-800"
              }`}
            >
              Gestión de Estudiantes
            </h2>
            <p className={modoOscuro ? "text-gray-300" : "text-gray-600 mb-4"}>
              Administra los estudiantes autorizados a recibir certificados.
            </p>

            <input
              type="text"
              placeholder="Dirección del estudiante"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              className="border px-4 py-2 w-full mb-4 rounded"
            />

            <div className="flex gap-4">
              <button
                onClick={handleAddStudent}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Agregar Estudiante
              </button>
              <button
                onClick={handleRemoveStudent}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Eliminar Estudiante
              </button>
            </div>

            {mensaje && (
              <div
                className={`mt-4 p-2 rounded ${
                  modoOscuro
                    ? "bg-gray-700 text-green-300"
                    : "bg-gray-100 text-green-700"
                }`}
              >
                {mensaje}
              </div>
            )}

            {estudiantes.length > 0 && (
              <div className="mt-6">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    modoOscuro ? "text-white" : "text-gray-800"
                  }`}
                >
                  Lista de Estudiantes:
                </h3>
                <ul className="list-disc pl-5">
                  {estudiantes.map((stu, index) => (
                    <li
                      key={index}
                      className={modoOscuro ? "text-gray-300" : "text-gray-700"}
                    >
                      {stu}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
