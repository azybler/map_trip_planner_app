import React, { useState, useRef, useEffect } from 'react';
import type { Pin } from '../types';

interface ManualPinEntryProps {
  onAddPin: (pin: Omit<Pin, 'id'>) => void;
}

const ManualPinEntry: React.FC<ManualPinEntryProps> = ({ onAddPin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [latitude, setLatitude] = useState('');
  const latitudeInputRef = useRef<HTMLInputElement>(null);

  // Focus on latitude input when form is expanded
  useEffect(() => {
    if (isExpanded && latitudeInputRef.current) {
      latitudeInputRef.current.focus();
    }
  }, [isExpanded]);
  const [longitude, setLongitude] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'stay' | 'eat' | 'activity'>('eat');
  const [color, setColor] = useState('#ff6b6b');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  // Parse coordinate pair from pasted text (e.g., "21.045960, 105.840907")
  const parseCoordinatePair = (text: string): { lat: string; lon: string } | null => {
    // Remove extra whitespace and trim
    const cleaned = text.trim();
    
    // Match patterns like "lat, lon" or "lat lon" with optional spaces
    const patterns = [
      /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/, // "lat, lon" or "lat,lon"
      /^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/,     // "lat lon" (space separated)
    ];

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        
        // Validate the parsed values
        if (!isNaN(lat) && !isNaN(lon) && 
            lat >= -90 && lat <= 90 && 
            lon >= -180 && lon <= 180) {
          return { lat: match[1], lon: match[2] };
        }
      }
    }
    return null;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const parsed = parseCoordinatePair(pastedText);
    
    if (parsed) {
      e.preventDefault(); // Prevent default paste behavior
      setLatitude(parsed.lat);
      setLongitude(parsed.lon);
      setError('');
    }
    // If not a coordinate pair, let the default paste happen for single value
  };

  const validateCoordinates = (): boolean => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid numbers for latitude and longitude');
      return false;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90');
      return false;
    }

    if (lon < -180 || lon > 180) {
      setError('Longitude must be between -180 and 180');
      return false;
    }

    setError('');
    return true;
  };

  const handleAddPin = () => {
    if (!name.trim()) {
      setError('Please enter a name for the pin');
      return;
    }

    if (!validateCoordinates()) {
      return;
    }

    onAddPin({
      name: name.trim(),
      description: description.trim(),
      type,
      color,
      position: [parseFloat(latitude), parseFloat(longitude)],
      link: link.trim() || undefined,
    });

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setLatitude('');
    setLongitude('');
    setName('');
    setDescription('');
    setType('eat');
    setColor('#ff6b6b');
    setLink('');
    setError('');
    setIsExpanded(false);
  };

  const defaultColors = [
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Blue
    '#96ceb4', // Green
    '#feca57', // Yellow
    '#ff9ff3', // Pink
    '#54a0ff', // Light Blue
    '#5f27cd', // Purple
  ];

  const isFormValid = name.trim() && latitude && longitude;

  return (
    <div className="manual-pin-entry">
      <button
        className="expand-toggle-button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="toggle-icon">{isExpanded ? '−' : '+'}</span>
        <span>Add Pin by Coordinates</span>
      </button>

      {isExpanded && (
        <div className="manual-entry-form">
          <p className="form-hint">
            Enter the latitude and longitude, or paste a coordinate pair like "21.0459, 105.8409"
          </p>

          <div className="coordinates-row">
            <div className="form-group">
              <label htmlFor="manual-latitude">Latitude:</label>
              <input
                ref={latitudeInputRef}
                id="manual-latitude"
                type="text"
                inputMode="decimal"
                placeholder="e.g., 40.7128"
                value={latitude}
                onChange={(e) => {
                  setLatitude(e.target.value);
                  setError('');
                }}
                onPaste={handlePaste}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="manual-longitude">Longitude:</label>
              <input
                id="manual-longitude"
                type="text"
                inputMode="decimal"
                placeholder="e.g., -74.0060"
                value={longitude}
                onChange={(e) => {
                  setLongitude(e.target.value);
                  setError('');
                }}
                onPaste={handlePaste}
                className="form-input"
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="manual-pin-name">Name:</label>
            <input
              id="manual-pin-name"
              type="text"
              placeholder="e.g., My Favorite Spot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="manual-pin-description">Description:</label>
            <textarea
              id="manual-pin-description"
              placeholder="Add details about this place..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="manual-pin-link">Website Link (optional):</label>
            <input
              id="manual-pin-link"
              type="url"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="manual-pin-type">Type:</label>
            <select
              id="manual-pin-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'stay' | 'eat' | 'activity')}
              className="form-select"
            >
              <option value="stay">🏠 Place to Stay</option>
              <option value="eat">🍔 Place to Eat</option>
              <option value="activity">🎯 Activity</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="manual-pin-color">Color:</label>
            <div className="color-picker">
              <input
                id="manual-pin-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
              <div className="preset-colors">
                {defaultColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`color-preset ${color === presetColor ? 'selected' : ''}`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              onClick={handleAddPin}
              disabled={!isFormValid}
              className="add-button"
            >
              Add Pin
            </button>
            <button
              onClick={resetForm}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualPinEntry;
