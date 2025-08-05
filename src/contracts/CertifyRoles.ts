import { ethers } from "ethers";

// ✅ ABI corregido: sin doble array
export const CertifyRolesABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_director", "type": "address" }
    ],
    "name": "addDirector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_student", "type": "address" }
    ],
    "name": "addStudent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_director", "type": "address" }
    ],
    "name": "removeDirector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_address", "type": "address" }
    ],
    "name": "checkRole",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "directors",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "students",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const getContract = (providerOrSigner: any) => {
  const contractAddress = "0xb676b1737743DDc6C0731b98EDEC32DB299843a2"; // ✅ Dirección correcta
  return new ethers.Contract(contractAddress, CertifyRolesABI, providerOrSigner);
};
