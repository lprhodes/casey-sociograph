import { useState, useEffect } from 'react';
import Sociogram from './components/Sociogram';
import DataInputModal from './components/DataInputModal';
import { relationshipsData } from './data';
import './App.css';

const STORAGE_KEY = 'sociogram-data';
const ORIGINAL_DATA = relationshipsData; // Keep reference to original data

function App() {
  // Load data from localStorage or use original data
  const [data, setData] = useState(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return ORIGINAL_DATA;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsingCustomData, setIsUsingCustomData] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [data]);

  const handleDataUpdate = (newData) => {
    setData(newData);
    setIsUsingCustomData(true);
  };

  const handleResetToOriginal = () => {
    setData(ORIGINAL_DATA);
    setIsUsingCustomData(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Interactive Sociogram</h1>
            <p>Explore peer connections with multiple layout modes, zoom & pan controls, and rich interactions</p>
          </div>
          <button className="settings-btn" onClick={() => setIsModalOpen(true)} title="Update Data">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m8.66-13.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m13.66-8.48l-4.24-4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1"></path>
            </svg>
            Update Data
          </button>
        </div>
      </header>
      <Sociogram data={data} />
      <DataInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDataUpdate={handleDataUpdate}
        onResetToOriginal={handleResetToOriginal}
        isUsingCustomData={isUsingCustomData}
      />
    </div>
  );
}

export default App;
