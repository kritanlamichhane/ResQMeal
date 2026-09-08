import math
from typing import List, Tuple

EARTH_RADIUS_KM = 6371.0

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two points on a sphere using the Haversine formula.
    Returns distance in kilometers.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) *
         math.sin(delta_lambda / 2.0) ** 2)
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(EARTH_RADIUS_KM * c, 2)

def get_bounding_box(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Returns (min_lat, max_lat, min_lon, max_lon) for an initial fast spatial bounding-box filter.
    """
    delta_lat = radius_km / 111.0 # 1 deg lat is approx 111 km
    delta_lon = radius_km / (111.0 * math.cos(math.radians(lat)) + 1e-9)
    
    return (lat - delta_lat, lat + delta_lat, lon - delta_lon, lon + delta_lon)
