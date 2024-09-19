import React, { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers'; // Usando ethers para el contrato
import GuestbookArtifact from './GuestbookAbi.json'; // ABI del contrato
import './App.css'; // Aquí agregaré los estilos

const contractAddress = '0xb48c3613F117a087c4f3786fB7f95F00fd12c706';

function App() {
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new Web3Provider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const network = await provider.getNetwork();
          if (network.chainId !== 1115) {
            throw new Error("Por favor, cambia a Core Testnet en MetaMask.");
          }

          const signer = provider.getSigner();
          const tempContract = new Contract(contractAddress, GuestbookArtifact.abi, signer);
          setContract(tempContract);

          const entries = await tempContract.getEntries();
          setEntries(entries);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError("Por favor, instala MetaMask.");
        setLoading(false);
      }
    };
    init();
  }, []);

  const signGuestbook = async () => {
    if (!contract) {
      setError("¡El contrato no está inicializado!");
      return;
    }
    if (!name || !email || !country || !message || !signature) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    try {
      setSigning(true);
      const tx = await contract.signGuestbook(name, message, {
        gasLimit: 300000,
      });
      const receipt = await tx.wait();
      const updatedEntries = await contract.getEntries();
      setEntries(updatedEntries);
      setError("");
    } catch (error) {
      setError("Error al firmar el libro de visitas. Inténtalo de nuevo.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>ADD YOUR SIGNATURE</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input 
          type="text" 
          placeholder="Enter your name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          disabled={signing}
        />
        <input 
          type="email" 
          placeholder="Enter Your Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={signing} 
        />
        <input 
          type="text" 
          placeholder="Enter Your Country" 
          value={country} 
          onChange={(e) => setCountry(e.target.value)} 
          disabled={signing} 
        />
        <textarea 
          placeholder="What actions can you take to help achieve peace?" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          disabled={signing}
        ></textarea>
        <textarea 
          placeholder="Signature" 
          value={signature} 
          onChange={(e) => setSignature(e.target.value)} 
          disabled={signing}
        ></textarea>
        <div className="buttons">
          <button onClick={signGuestbook} disabled={signing || loading}>
            {signing ? 'Signing...' : 'Save'}
          </button>
          <button onClick={() => {
            setName("");
            setEmail("");
            setCountry("");
            setMessage("");
            setSignature("");
          }} disabled={signing}>Clear</button>
        </div>
      </div>
      <div className="entries-section">
        <h2>SIGNATORIES</h2>
        <p>SIGNATURE COUNT: {entries.length}</p>
        <ul>
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <li key={index}>
                <strong>{entry.name}:</strong> {entry.message}
              </li>
            ))
          ) : (
            <p>No signatures yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
