import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Pin } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  pins: Pin[];
  center: [number, number];
  zoom: number;
  onMapClick: (position: [number, number]) => void;
  onPinClick: (pin: Pin) => void;
}

// Custom marker icon based on pin type and color
const createCustomIcon = (pin: Pin) => {
  const iconHtml = `
    <div style="
      background-color: ${pin.color};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">
      ${pin.type === 'stay' ? '🏠' : pin.type === 'eat' ? '🍽️' : '🎯'}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-pin-icon',
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
  });
};

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (position: [number, number]) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  pins,
  center,
  zoom,
  onMapClick,
  onPinClick,
}) => {
  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        key={`${center[0]}-${center[1]}`} // Force re-render when center changes
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.position}
            icon={createCustomIcon(pin)}
            eventHandlers={{
              click: () => onPinClick(pin),
            }}
          >
            <Popup>
              <div className="pin-popup">
                <h3>{pin.name}</h3>
                <p><strong>Type:</strong> {pin.type}</p>
                <p><strong>Description:</strong> {pin.description}</p>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: pin.color,
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginLeft: '5px',
                  }}
                />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;