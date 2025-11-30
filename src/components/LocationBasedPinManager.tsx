import React, { useState, useEffect, useRef } from 'react';
import type { Pin, MapSearchResult } from '../types';

interface LocationBasedPinManagerProps {
  onAddPin: (pin: Omit<Pin, 'id'>) => void;
}

interface SearchSuggestion extends MapSearchResult {
  place_id: string;
  importance: number;
}

const LocationBasedPinManager: React.FC<LocationBasedPinManagerProps> = ({ onAddPin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SearchSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'stay' | 'eat' | 'activity'>('eat');
  const [color, setColor] = useState('#ff6b6b');
  const [link, setLink] = useState('');
  
  const searchTimeoutRef = useRef<number | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search for autocomplete
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 2) {
      searchTimeoutRef.current = window.setTimeout(() => {
        searchLocations(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`
      );

      if (response.ok) {
        const results: SearchSuggestion[] = await response.json();
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSelectedLocation(suggestion);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    
    // Auto-populate name with a clean version of the location
    if (!name) {
      const locationName = suggestion.display_name.split(',')[0].trim();
      setName(locationName);
    }
  };

  const handleAddPin = () => {
    if (!selectedLocation || !name.trim()) return;

    onAddPin({
      name: name.trim(),
      description: description.trim(),
      type,
      color,
      position: [parseFloat(selectedLocation.lat), parseFloat(selectedLocation.lon)],
      link: link.trim() || undefined,
    });

    // Reset form
    setSearchQuery('');
    setSelectedLocation(null);
    setName('');
    setDescription('');
    setType('eat');
    setColor('#ff6b6b');
    setLink('');
    setSuggestions([]);
    setShowSuggestions(false);
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
    <div className="location-pin-manager">
      <h3>Add Pin by Location</h3>
      
      <div className="location-search-container" ref={suggestionsRef}>
        <div className="form-group">
          <label htmlFor="location-search">Search for a place:</label>
          <div className="search-input-container">
            <input
              id="location-search"
              type="text"
              placeholder="e.g., Central Park New York, Eiffel Tower Paris..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input location-search-input"
              autoComplete="off"
            />
            {isSearching && <div className="search-spinner">🔍</div>}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.place_id || index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-name">
                  {suggestion.display_name.split(',')[0]}
                </div>
                <div className="suggestion-address">
                  {suggestion.display_name.split(',').slice(1).join(',').trim()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div className="selected-location">
          <div className="location-preview">
            <strong>Selected:</strong> {selectedLocation.display_name.split(',')[0]}
            <div className="location-address">
              {selectedLocation.display_name.split(',').slice(1).join(',').trim()}
            </div>
          </div>

          <div className="pin-form">
            <div className="form-group">
              <label htmlFor="pin-name-location">Name:</label>
              <input
                id="pin-name-location"
                type="text"
                placeholder="e.g., My Hotel, Great Restaurant, Museum Visit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pin-description-location">Description:</label>
              <textarea
                id="pin-description-location"
                placeholder="Add details about this place..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pin-link-location">Website Link (optional):</label>
              <input
                id="pin-link-location"
                type="url"
                placeholder="https://example.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pin-type-location">Type:</label>
              <select
                id="pin-type-location"
                value={type}
                onChange={(e) => setType(e.target.value as 'stay' | 'eat' | 'activity')}
                className="form-select"
              >
                <option value="stay">🏠 Place to Stay</option>
                <option value="eat">🍽️ Place to Eat</option>
                <option value="activity">🎯 Activity</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pin-color-location">Color:</label>
              <div className="color-picker">
                <input
                  id="pin-color-location"
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

            <button
              onClick={handleAddPin}
              disabled={!name.trim() || !selectedLocation}
              className="add-button"
            >
              Add Pin at Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationBasedPinManager;