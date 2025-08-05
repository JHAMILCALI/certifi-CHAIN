// App.tsx
import { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const App = () => {
  const [account, setAccount] = useState<string>('');
  const [nfts, setNfts] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');

  const handleConnectWallet = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(connection);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);
  };

  const fetchNFTs = async () => {
    if (!account) return;
    const res = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&action=tokennfttx&address=${account}&startblock=0&endblock=99999999&sort=asc&apikey=YourEtherscanApiKey`
    );
    const data = await res.json();
    const nfts = data.result.filter((nft: any) => nft.to.toLowerCase() === account.toLowerCase());
    setNfts(nfts);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploadStatus('Getting upload URL...');
      const urlResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/presigned_url`);
      const data = await urlResponse.json();

      setUploadStatus('Uploading file...');
      const uploadResponse = await fetch(data.url, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (uploadResponse.ok) {
        setUploadStatus('File uploaded successfully!');
        const cid = data.url.split('?')[0].split('/').pop();
        const gateway = import.meta.env.VITE_GATEWAY_URL;
        setLink(`https://${gateway}/ipfs/${cid}`);
      } else {
        setUploadStatus('Upload failed');
      }
    } catch (error) {
      setUploadStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  useEffect(() => {
    if (account) fetchNFTs();
  }, [account]);

  return (
    <div className="app">
      <h1>React + Pinata + MetaMask + NFT Viewer</h1>

      {!account ? (
        <button onClick={handleConnectWallet}>Connect MetaMask</button>
      ) : (
        <div>
          <p>Connected as: {account}</p>

          <div className="card">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file}>
              Upload to Pinata
            </button>
            {uploadStatus && <p>{uploadStatus}</p>}
            {link && <a href={link} target="_blank">View File</a>}
          </div>

          <h2>Your Sepolia NFTs</h2>
          <div className="nft-gallery">
            {nfts.map((nft, index) => (
              <div key={index} className="nft-item">
                <p><strong>Token ID:</strong> {nft.tokenID}</p>
                <p><strong>Contract:</strong> {nft.contractAddress}</p>
              </div>
            ))}
            {nfts.length === 0 && <p>No NFTs found on Sepolia</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
