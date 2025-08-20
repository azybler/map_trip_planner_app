import React, { useState } from 'react';
import type { MapSearchResult } from '../types';

interface SearchComponentProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results: MapSearchResult[] = await response.json();

      if (results.length > 0) {
        const result = results[0];
        onLocationSelect(parseFloat(result.lat), parseFloat(result.lon));
      } else {
        setError('Location not found');
      }
    } catch (err) {
      setError('Error searching for location');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Search for a location (e.g., Melbourne, Paris, Tokyo)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="search-input"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="search-button"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <div className="search-error">{error}</div>}
    </div>
  );
};

export default SearchComponent;