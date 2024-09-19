import React, { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers'; // Usando ethers para el contrato
import GuestbookArtifact from './GuestbookAbi.json'; // ABI del contrato

const contractAddress = '0xb48c3613F117a087c4f3786fB7f95F00fd12c706';

function App() {
  const [contract, setContract] = useState(null);
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          console.log("Conectando a MetaMask...");
          const provider = new Web3Provider(window.ethereum); // Usar Web3Provider de ethers

          await provider.send("eth_requestAccounts", []); // Solicitar acceso a la cuenta

          const network = await provider.getNetwork();
          if (network.chainId !== 1115) {
            throw new Error("Por favor, cambia a Core Testnet en MetaMask.");
          }

          const signer = provider.getSigner();
          console.log("Signer obtenido:", signer);

          // Inicializar contrato usando el ABI y la dirección
          const tempContract = new Contract(contractAddress, GuestbookArtifact.abi, signer);
          setContract(tempContract);
          console.log("Contrato inicializado:", tempContract);

          // Obtener las entradas del contrato
          const entries = await tempContract.getEntries();
          setEntries(entries);
          console.log("Entradas cargadas:", entries);
        } catch (error) {
          console.error("Error al conectar el contrato:", error);
          setError(error.message);
        } finally {
          setLoading(false); // Detener la carga
        }
      } else {
        console.error("Por favor, instala MetaMask.");
        setError("Por favor, instala MetaMask.");
        setLoading(false);
      }
    };
    init();
  }, []);

  const signGuestbook = async () => {
    if (!contract) {
      console.error("¡El contrato no está inicializado!");
      setError("¡El contrato no está inicializado! Espera hasta que esté listo.");
      return;
    }

    if (!name || !message) {
      setError("Por favor, ingresa un nombre y un mensaje.");
      return;
    }

    try {
      setSigning(true); // Comienza el proceso de firma
      console.log("Firmando el libro de visitas con:", name, message);

      const tx = await contract.signGuestbook(name, message, {
        gasLimit: 300000, // Ajusta el límite de gas si es necesario
      });
      console.log("Transacción enviada:", tx);

      // Usamos tx.wait() para esperar a que la transacción sea minada
      const receipt = await tx.wait(); // Esto espera a que se confirme
      console.log("Transacción confirmada:", receipt);

      // Obtener entradas actualizadas
      const updatedEntries = await contract.getEntries();
      setEntries(updatedEntries);
      console.log("Entradas actualizadas:", updatedEntries);

      setError(""); // Limpiar errores en caso de éxito
    } catch (error) {
      console.error("Error al firmar el libro de visitas:", error);
      setError("Error al firmar el libro de visitas. Inténtalo de nuevo.");
    } finally {
      setSigning(false); // Terminar el proceso de firma
    }
  };

  return (
    <div>
      <h1>Declaración Universal de Paz</h1>
      {loading ? (
        <p>Cargando el contrato...</p>
      ) : (
        <>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input 
            type="text" 
            placeholder="Tu Nombre" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            disabled={signing} 
          />
          <input 
            type="text" 
            placeholder="Tu Mensaje" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            disabled={signing} 
          />
          <button onClick={signGuestbook} disabled={signing || loading}>
            {signing ? 'Firmando...' : 'Firmar Libro de Visitas'}
          </button>
          <ul>
            {entries.length > 0 ? (
              entries.map((entry, index) => (
                <li key={index}>
                  <strong>{entry.name}:</strong> {entry.message}
                </li>
              ))
            ) : (
              <p>No hay entradas todavía. ¡Sé el primero en firmar!</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
