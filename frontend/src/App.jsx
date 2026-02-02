import { useState, useEffect } from 'react';
import { testConnection } from './services/api';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('checking...');

  useEffect(() => {
    // Test backend connection on load
    const checkAPI = async () => {
      try {
        const response = await testConnection();
        setApiStatus(`✓ Connected: ${response.status}`);
      } catch (error) {
        setApiStatus('✗ Backend not connected');
      }
    };
    
    checkAPI();
  }, []);

  return (
    <div className="App">
      <div className="api-status">
        Backend Status: {apiStatus}
      </div>
    </div>
  );
}

export default App;
