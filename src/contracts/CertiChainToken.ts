import { ethers } from "ethers";
import CertiChainTokenABI from "../contracts/CertifyRoles/CertiChainTokenABI.json";

// Dirección de tu contrato desplegado en la red correspondiente
const CERTICHAIN_TOKEN_ADDRESS = "0x86Ae08076DBD7c1227cBD3d8743062C3bBB91F54";
//const abi = CertiChainTokenABI.abi;

export function getCertiChainTokenContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CERTICHAIN_TOKEN_ADDRESS, CertiChainTokenABI.abi, signerOrProvider);
}