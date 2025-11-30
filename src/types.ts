export interface Pin {
  id: string;
  type: 'stay' | 'eat' | 'activity';
  name: string;
  description: string;
  color: string;
  position: [number, number]; // [latitude, longitude]
  link?: string; // Optional external link
}

export interface MapSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}