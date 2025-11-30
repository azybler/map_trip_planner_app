import React, { useState } from 'react';
import LocationBasedPinManager from './LocationBasedPinManager';
import ManualPinEntry from './ManualPinEntry';
import type { Pin } from '../types';

interface PinManagerProps {
  pins: Pin[];
  selectedPosition: [number, number] | null;
  onAddPin: (pin: Omit<Pin, 'id'>) => void;
  onRemovePin: (id: string) => void;
  onEditPin: (id: string, updatedPin: Omit<Pin, 'id'>) => void;
  onClearSelection: () => void;
}

const PinManager: React.FC<PinManagerProps> = ({
  pins,
  selectedPosition,
  onAddPin,
  onRemovePin,
  onEditPin,
  onClearSelection,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'stay' | 'eat' | 'activity'>('eat');
  const [color, setColor] = useState('#ff6b6b');
  const [link, setLink] = useState('');
  const [editingPin, setEditingPin] = useState<Pin | null>(null);

  const handleAddPin = () => {
    if (!selectedPosition || !name.trim()) return;

    onAddPin({
      name: name.trim(),
      description: description.trim(),
      type,
      color,
      position: selectedPosition,
      link: link.trim() || undefined,
    });

    // Reset form
    setName('');
    setDescription('');
    setType('eat');
    setColor('#ff6b6b');
    setLink('');
    onClearSelection();
  };

  const handleEditPin = (pin: Pin) => {
    setEditingPin(pin);
    setName(pin.name);
    setDescription(pin.description);
    setType(pin.type);
    setColor(pin.color);
    setLink(pin.link || '');
  };

  const handleSaveEdit = () => {
    if (!editingPin || !name.trim()) return;

    onEditPin(editingPin.id, {
      name: name.trim(),
      description: description.trim(),
      type,
      color,
      position: editingPin.position,
      link: link.trim() || undefined,
    });

    // Reset form
    setEditingPin(null);
    setName('');
    setDescription('');
    setType('eat');
    setColor('#ff6b6b');
    setLink('');
  };

  const handleCancelEdit = () => {
    setEditingPin(null);
    setName('');
    setDescription('');
    setType('eat');
    setColor('#ff6b6b');
    setLink('');
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

  return (
    <div className="pin-manager">
      <h2>Trip Planner</h2>
      
      {selectedPosition && (
        <div className="add-pin-form">
          <h3>Add New Pin</h3>
          <p className="position-info">
            Position: {selectedPosition[0].toFixed(4)}, {selectedPosition[1].toFixed(4)}
          </p>
          
          <div className="form-group">
            <label htmlFor="pin-name">Name:</label>
            <input
              id="pin-name"
              type="text"
              placeholder="e.g., Cozy Hotel, Great Restaurant, Museum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin-description">Description:</label>
            <textarea
              id="pin-description"
              placeholder="Add details about this place..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin-link">Website Link (optional):</label>
            <input
              id="pin-link"
              type="url"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin-type">Type:</label>
            <select
              id="pin-type"
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
            <label htmlFor="pin-color">Color:</label>
            <div className="color-picker">
              <input
                id="pin-color"
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
              disabled={!name.trim()}
              className="add-button"
            >
              Add Pin
            </button>
            <button
              onClick={onClearSelection}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!selectedPosition && !editingPin && (
        <div>
          <LocationBasedPinManager onAddPin={onAddPin} />
          
          <ManualPinEntry onAddPin={onAddPin} />
          
          <div className="instructions">
            <p>Or click anywhere on the map to add a pin at that precise location</p>
          </div>
        </div>
      )}

      {editingPin && (
        <div className="edit-pin-form">
          <h3>Edit Pin</h3>
          <p className="editing-info">
            Editing: {editingPin.name} at {editingPin.position[0].toFixed(4)}, {editingPin.position[1].toFixed(4)}
          </p>
          
          <div className="form-group">
            <label htmlFor="edit-pin-name">Name:</label>
            <input
              id="edit-pin-name"
              type="text"
              placeholder="e.g., Cozy Hotel, Great Restaurant, Museum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-pin-description">Description:</label>
            <textarea
              id="edit-pin-description"
              placeholder="Add details about this place..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-pin-link">Website Link (optional):</label>
            <input
              id="edit-pin-link"
              type="url"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-pin-type">Type:</label>
            <select
              id="edit-pin-type"
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
            <label htmlFor="edit-pin-color">Color:</label>
            <div className="color-picker">
              <input
                id="edit-pin-color"
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
              onClick={handleSaveEdit}
              disabled={!name.trim()}
              className="add-button"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="pins-list">
        <h3>Your Pins ({pins.length})</h3>
        {pins.length === 0 ? (
          <p className="no-pins">No pins added yet. Click on the map to start planning your trip!</p>
        ) : (
          <div className="pins-grid">
            {pins.map((pin) => (
              <div key={pin.id} className="pin-card">
                <div className="pin-header">
                  <div
                    className="pin-color-indicator"
                    style={{ backgroundColor: pin.color }}
                  />
                  <span className="pin-type-icon">
                    {pin.type === 'stay' ? '🏠' : pin.type === 'eat' ? '🍔' : '🎯'}
                  </span>
                  <h4 className="pin-name">{pin.name}</h4>
                </div>
                {pin.description && (
                  <p className="pin-description">{pin.description}</p>
                )}
                {pin.link && (
                  <div className="pin-link">
                    <a 
                      href={pin.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pin-link-url"
                    >
                      🔗 Visit Website
                    </a>
                  </div>
                )}
                <div className="pin-meta">
                  <span className="pin-type">{pin.type}</span>
                  <div className="pin-actions">
                    <button
                      onClick={() => handleEditPin(pin)}
                      className="edit-button"
                      aria-label={`Edit ${pin.name}`}
                      disabled={editingPin !== null}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onRemovePin(pin.id)}
                      className="remove-button"
                      aria-label={`Remove ${pin.name}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PinManager;