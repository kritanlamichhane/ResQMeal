/**
 * Bangalore Neighborhood Geolocation Configuration
 * 
 * Defines standard neighborhood discovery centers and bounding coordinates 
 * for Bangalore surplus food matching. Used by the Hero location picker
 * and the Consumer Discovery Dashboard.
 */

export interface NeighborhoodLocation {
  id: string;
  name: string;
  label: string;
  lat: number;
  lng: number;
  landmark: string;
}

export const BANGALORE_NEIGHBORHOODS: NeighborhoodLocation[] = [
  { 
    id: 'central', 
    name: 'Bangalore Central', 
    label: 'Central / MG Road', 
    lat: 12.9716, 
    lng: 77.5946, 
    landmark: 'Lavelle Rd, MG Rd, Commercial St' 
  },
  { 
    id: 'indiranagar', 
    name: 'Indiranagar', 
    label: 'Indiranagar', 
    lat: 12.9784, 
    lng: 77.6408, 
    landmark: '100 Feet Rd, 12th Main' 
  },
  { 
    id: 'koramangala', 
    name: 'Koramangala', 
    label: 'Koramangala', 
    lat: 12.9352, 
    lng: 77.6245, 
    landmark: '4th Block, 80ft Rd, Sony World' 
  },
  { 
    id: 'hsr', 
    name: 'HSR Layout', 
    label: 'HSR Layout', 
    lat: 12.9121, 
    lng: 77.6446, 
    landmark: '27th Main, Sector 1-4' 
  },
  { 
    id: 'whitefield', 
    name: 'Whitefield', 
    label: 'Whitefield', 
    lat: 12.9698, 
    lng: 77.7500, 
    landmark: 'ITPL, Hope Farm, EPIP' 
  },
  { 
    id: 'jayanagar', 
    name: 'Jayanagar', 
    label: 'Jayanagar', 
    lat: 12.9463, 
    lng: 77.5938, 
    landmark: '4th Block, South End Circle' 
  },
];

/**
 * Resolves a search string or location name to the nearest configured neighborhood coordinates.
 */
export function resolveNeighborhood(query: string): NeighborhoodLocation {
  const normalized = query.trim().toLowerCase();
  const matched = BANGALORE_NEIGHBORHOODS.find(
    (n) => n.name.toLowerCase().includes(normalized) ||
           n.label.toLowerCase().includes(normalized) ||
           n.landmark.toLowerCase().includes(normalized) ||
           normalized.includes(n.id)
  );
  return matched || BANGALORE_NEIGHBORHOODS[0];
}
