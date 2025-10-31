import { useState } from 'react';
import './DataInputModal.css';

export default function DataInputModal({ isOpen, onClose, onDataUpdate, onResetToOriginal, isUsingCustomData }) {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');

  const parseData = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const data = {};

    for (const line of lines) {
      // Parse format: "Name: Friend1, Friend2, Friend3"
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (!match) {
        throw new Error(`Invalid format in line: "${line}". Expected format: "Name: Friend1, Friend2, Friend3"`);
      }

      const [, name, friendsStr] = match;
      const friends = friendsStr.split(',').map(f => f.trim()).filter(f => f);

      if (friends.length === 0) {
        throw new Error(`No friends found for ${name}`);
      }

      data[name.trim()] = friends;
    }

    return data;
  };

  const handleSubmit = () => {
    try {
      setError('');
      const parsedData = parseData(inputText);

      // Validate we have at least some data
      if (Object.keys(parsedData).length === 0) {
        setError('No valid data found. Please paste data in the format: "Name: Friend1, Friend2, Friend3"');
        return;
      }

      onDataUpdate(parsedData);
      setInputText('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setInputText('');
    setError('');
  };

  const handleReset = () => {
    onResetToOriginal();
    setInputText('');
    setError('');
    onClose();
  };

  const exampleData = `Hannah: Hayden, Kaley, Kaylee
Nate: Cooper B, Tamia, Charlotte
Hunter: Mila, Livvy, Tamia`;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Sociogram Data</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {isUsingCustomData && (
            <div className="status-indicator">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Currently using custom data</span>
            </div>
          )}

          <p className="modal-description">
            Paste your sociogram data below. Each line should follow this format:
          </p>

          <div className="example-format">
            <code>{exampleData}</code>
          </div>

          <textarea
            className="data-input"
            placeholder="Paste your data here...&#10;Example:&#10;Alice: Bob, Charlie, Diana&#10;Bob: Alice, Eve"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={15}
          />

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="modal-footer">
            <div className="footer-left">
              {isUsingCustomData && (
                <button className="btn btn-warning" onClick={handleReset} title="Reset to original data provided by Luke">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Reset to Original
                </button>
              )}
            </div>
            <div className="footer-right">
              <button className="btn btn-secondary" onClick={handleClear}>
                Clear
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Update Graph
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
