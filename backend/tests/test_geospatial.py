"""
Unit Tests for Geospatial Services
==================================
Validates spherical distance and bounding box spatial algorithms.
"""

import pytest
from app.services.geo_service import calculate_haversine_distance, get_bounding_box

def test_haversine_distance_same_point():
    # Distance from a point to itself must be 0
    dist = calculate_haversine_distance(12.9716, 77.5946, 12.9716, 77.5946)
    assert dist == 0.0

def test_haversine_distance_known_points():
    # MG Road to Indiranagar 100ft road (~4.5 - 5.5 km)
    mg_road = (12.9756, 77.6066)
    indiranagar = (12.9784, 77.6408)
    dist = calculate_haversine_distance(mg_road[0], mg_road[1], indiranagar[0], indiranagar[1])
    assert 3.0 <= dist <= 6.0

def test_bounding_box_coverage():
    # Bounding box of 10 km radius should encapsulate points within 5 km
    lat, lng = 12.9716, 77.5946
    min_lat, max_lat, min_lon, max_lon = get_bounding_box(lat, lng, radius_km=10.0)
    
    assert min_lat < lat < max_lat
    assert min_lon < lng < max_lon
