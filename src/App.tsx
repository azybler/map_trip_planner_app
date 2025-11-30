import { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import SearchComponent from './components/SearchComponent';
import PinManager from './components/PinManager';
import type { Pin } from './types';
import './App.css';

// localStorage keys
const STORAGE_KEYS = {
  PINS: 'trip-planner-pins',
  MAP_CENTER: 'trip-planner-map-center',
  MAP_ZOOM: 'trip-planner-map-zoom',
};

// Helper functions for localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

function App() {
  // Initialize state with localStorage data or defaults
  const [pins, setPins] = useState<Pin[]>(() => 
    loadFromStorage(STORAGE_KEYS.PINS, [])
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(() => 
    loadFromStorage(STORAGE_KEYS.MAP_CENTER, [40.7128, -74.0060]) // Default to NYC
  );
  const [mapZoom, setMapZoom] = useState(() => 
    loadFromStorage(STORAGE_KEYS.MAP_ZOOM, 10)
  );
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Save pins to localStorage whenever pins change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PINS, pins);
  }, [pins]);

  // Save map center to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MAP_CENTER, mapCenter);
  }, [mapCenter]);

  // Save map zoom to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MAP_ZOOM, mapZoom);
  }, [mapZoom]);

  const handleLocationSelect = (lat: number, lon: number) => {
    setMapCenter([lat, lon]);
    setMapZoom(12);
  };

  const handleMapClick = (position: [number, number]) => {
    setSelectedPosition(position);
  };

  const handleAddPin = (newPin: Omit<Pin, 'id'>) => {
    const pin: Pin = {
      ...newPin,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setPins([...pins, pin]);
  };

  const handleRemovePin = (id: string) => {
    setPins(pins.filter(pin => pin.id !== id));
  };

  const handleEditPin = (id: string, updatedPin: Omit<Pin, 'id'>) => {
    setPins(pins.map(pin => 
      pin.id === id 
        ? { ...updatedPin, id } 
        : pin
    ));
  };

  const handleClearSelection = () => {
    setSelectedPosition(null);
  };

  const handlePinClick = (pin: Pin) => {
    setMapCenter(pin.position);
    setMapZoom(15);
  };

  return (
    <div className="app">
      <button 
        className="hamburger-button"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isSidebarOpen}
      >
        <span className={`hamburger-icon ${isSidebarOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
      
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <SearchComponent onLocationSelect={handleLocationSelect} />
        <PinManager
          pins={pins}
          selectedPosition={selectedPosition}
          onAddPin={handleAddPin}
          onRemovePin={handleRemovePin}
          onEditPin={handleEditPin}
          onClearSelection={handleClearSelection}
        />
      </div>
      <div className="map-section">
        <MapComponent
          pins={pins}
          center={mapCenter}
          zoom={mapZoom}
          onMapClick={handleMapClick}
          onPinClick={handlePinClick}
          onRemovePin={handleRemovePin}
        />
      </div>
    </div>
  );
}

export default App;
