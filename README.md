# 📜 CertyfChain  

**CertyfChain** es una plataforma descentralizada para la **emisión, gestión y verificación de certificados académicos en formato NFT (ERC-721)**.  
El proyecto busca brindar **transparencia, inmutabilidad y trazabilidad** a los procesos de certificación utilizando **blockchain** y almacenamiento en **IPFS (Pinata)**.  

---

## 🚀 Tecnologías utilizadas  

- **Frontend**:  
  - [React + Vite](https://vitejs.dev/) ⚡  
  - [TypeScript](https://www.typescriptlang.org/)  
  - [TailwindCSS](https://tailwindcss.com/)  

- **Smart Contracts**:  
  - **Solidity**  
  - Roles y permisos (Admin / Director / Estudiante)  
  - Contrato **ERC-721** para certificados como NFTs  

- **Blockchain**:  
  - [Ethereum](https://ethereum.org/) (o compatible con EVM)  
  - Contrato de roles: `0xDaC5fd597801Fe86422fE64D714F9F6452424927`  
  - Contrato ERC721 (NFT Certificados): `0x86Ae08076DBD7c1227cBD3d8743062C3bBB91F54`  

- **Almacenamiento descentralizado**:  
  - [Pinata](https://www.pinata.cloud/) + [IPFS](https://ipfs.tech/)  

- **Wallets**:  
  - Integración con **WalletConnect / MetaMask**  

---

## 📂 Estructura del proyecto  

```
project/
├── node_modules/         ← Dependencias
├── public/               ← Archivos estáticos
├── src/
│   ├── assets/           ← Imágenes y recursos
│   ├── components/       ← Componentes principales
│   │   ├── AdminPanel.tsx
│   │   ├── AnimatedBackground.tsx
│   │   ├── DirectorPanel.tsx
│   │   ├── RoleSelector.tsx
│   │   └── StudentPanel.tsx
│   ├── contracts/        ← Conexión con los Smart Contracts
│   │   └── CertifyRoles/
│   │       ├── CertiChainTokenABI.json
│   │       ├── CertifyRoles.json
│   │       ├── CertiChainToken.ts
│   │       ├── CertifyRoles.ts
│   │       └── getContract.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
```

---

## 🔑 Roles en el sistema  

### 👑 **Admin**  
- Solo el **owner del contrato** puede ser Admin.  
- Puede **asignar y eliminar roles** (Directores y Estudiantes).  

### 🎓 **Director**  
- Designado por el Admin.  
- Tiene acceso al panel de **certificación**.  
- Flujo de emisión de certificado:  
  1. Genera la **imagen del certificado** (sobre un template en `DirectorPanel`).  
  2. Se sube la imagen a **IPFS (Pinata)**.  
  3. Llena el formulario de **metadatos JSON** (NFT-like metadata).  
  4. El JSON también se sube a IPFS.  
  5. Ingresa la **dirección del estudiante** y paga `0.0001 ETH`.  
  6. Llama a `safeMint` del contrato ERC721 → NFT en blockchain.  
  7. Obtiene el **hash de transacción** para validación en Etherscan.  

### 👩‍🎓 **Estudiante**  
- Se conecta con su wallet.  
- Puede:  
  - Visualizar sus certificados emitidos.  
  - Ver imagen + metadatos JSON desde IPFS.  
  - Verificar en **Etherscan** su certificado NFT.  
  - Importar el NFT directamente en su billetera.  

---

## ⚙️ Flujo de funcionamiento  

1. **Conexión de Wallet**  
   - El usuario ingresa y conecta su wallet (MetaMask / WalletConnect).  
   - El contrato detecta su rol → Muestra el panel correspondiente.  

2. **Paneles según rol**  
   - **Admin**: asignar roles (Director / Estudiante).  
   - **Director**: emitir certificados (imagen + metadata → NFT).  
   - **Estudiante**: visualizar certificados recibidos.  

3. **Emisión de Certificados**  
   - El director genera el certificado, lo sube a IPFS, completa metadatos y ejecuta `safeMint`.  

4. **Verificación**  
   - El estudiante revisa su NFT en la dApp o directamente en **Etherscan**.  
   - Garantía de **autenticidad e inmutabilidad** gracias a blockchain.  

---

## 📦 Instalación y ejecución  

```bash
# Clonar repositorio
git clone https://github.com/JHAMILCALI/certifi-CHAIN.git
cd certifi-CHAIN

# Instalar dependencias
npm install

# Levantar entorno de desarrollo
npm run dev
```

La aplicación estará disponible en:  
👉 `https://certifi-chain.vercel.app/`  

---

## 🔒 Seguridad y transparencia  

- Los certificados están emitidos como **NFTs ERC-721**.  
- No pueden ser alterados ni eliminados de la blockchain.  
- Toda la metadata (imagen + JSON) está en **IPFS**, garantizando descentralización.  

---

## 📖 Conclusión  

**CertyfChain** transforma la manera de emitir y validar certificados académicos,  
aprovechando el poder de **Ethereum + IPFS** para asegurar que los documentos sean:  

✔️ Únicos  
✔️ Verificables  
✔️ Inmutables  
✔️ Descentralizados  