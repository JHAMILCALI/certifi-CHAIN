import React from 'react';
import { useParams } from 'react-router-dom';

const CertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Certificado Digital</h1>
      <p>ID del certificado:</p>
      <code style={{ fontSize: '18px', color: 'blue' }}>{id}</code>
      <p>Este certificado está registrado en el sistema ✅</p>
    </div>
  );
};

export default CertificatePage;
