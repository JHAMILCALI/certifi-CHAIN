import { BrowserProvider, Contract } from 'ethers';
import abi from './CertifyRoles/CertifyRoles.json'; // ajusta esto si tu abi está en otro lugar

const contractAddress = '0xb676b1737743DDc6C0731b98EDEC32DB299843a2'; // reemplaza con tu dirección real del contrato

const getContract = () => {
  const provider = new BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, CertifyRoles.abi, signer);
};
