import json
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.redis_cache import cache_service
from app.models.food_listing import FoodListing, ListingStatus, ListingType, FoodCategory
from app.models.provider import Provider
from app.models.user import User, UserRole
from app.schemas.listing import (
    FoodListingCreate, FoodListingUpdate, FoodListingResponse,
    PaginatedListingsResponse, ProviderSummary
)
from app.api.deps import get_current_user, get_current_provider, require_roles
from app.services.geo_service import calculate_haversine_distance, get_bounding_box

router = APIRouter()

def _format_listing_response(listing: FoodListing, distance_km: Optional[float] = None) -> FoodListingResponse:
    provider_summary = None
    if listing.provider:
        provider_summary = ProviderSummary(
            id=listing.provider.id,
            business_name=listing.provider.business_name,
            business_type=listing.provider.business_type,
            address=listing.provider.address,
            city=listing.provider.city,
            latitude=listing.provider.latitude,
            longitude=listing.provider.longitude
        )

    return FoodListingResponse(
        id=listing.id,
        provider_id=listing.provider_id,
        title=listing.title,
        description=listing.description,
        category=listing.category,
        quantity=listing.quantity,
        remaining_quantity=listing.remaining_quantity,
        unit=listing.unit,
        original_price=listing.original_price,
        surplus_price=listing.surplus_price,
        listing_type=listing.listing_type,
        image_url=listing.image_url,
        is_vegetarian=listing.is_vegetarian,
        preparation_time=listing.preparation_time,
        expiry_time=listing.expiry_time,
        pickup_start_time=listing.pickup_start_time,
        pickup_end_time=listing.pickup_end_time,
        latitude=listing.latitude,
        longitude=listing.longitude,
        status=listing.status,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        provider=provider_summary,
        distance_km=distance_km
    )

@router.get("", response_model=PaginatedListingsResponse)
def list_food_listings(
    category: Optional[FoodCategory] = None,
    listing_type: Optional[ListingType] = None,
    is_vegetarian: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    status_filter: Optional[ListingStatus] = ListingStatus.ACTIVE,
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(FoodListing)

    if status_filter:
        query = query.filter(FoodListing.status == status_filter)
    if category:
        query = query.filter(FoodListing.category == category)
    if listing_type:
        query = query.filter(FoodListing.listing_type == listing_type)
    if is_vegetarian is not None:
        query = query.filter(FoodListing.is_vegetarian == is_vegetarian)
    if min_price is not None:
        query = query.filter(FoodListing.surplus_price >= min_price)
    if max_price is not None:
        query = query.filter(FoodListing.surplus_price <= max_price)
    if search:
        query = query.filter(FoodListing.title.ilike(f"%{search}%"))

    total = query.count()
    items = query.order_by(FoodListing.created_at.desc()).offset((page - 1) * size).limit(size).all()

    return PaginatedListingsResponse(
        items=[_format_listing_response(item) for item in items],
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size if total > 0 else 1
    )

@router.get("/nearby", response_model=List[FoodListingResponse])
def get_nearby_listings(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lng: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(10.0, ge=0.5, le=50.0),
    category: Optional[FoodCategory] = None,
    listing_type: Optional[ListingType] = None,
    is_vegetarian: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Geospatial discovery endpoint with caching.
    Uses spatial bounding box filtering in SQL + Haversine precision sorting.
    """
    cache_key = f"nearby:{round(lat, 2)}:{round(lng, 2)}:{radius_km}:{category}:{listing_type}:{is_vegetarian}"
    cached_data = cache_service.get(cache_key)
    if cached_data:
        try:
            return json.loads(cached_data)
        except Exception:
            pass

    # 1. Bounding box query for optimal database indexing
    min_lat, max_lat, min_lon, max_lon = get_bounding_box(lat, lng, radius_km)
    
    query = (
        db.query(FoodListing)
        .filter(FoodListing.status == ListingStatus.ACTIVE)
        .filter(FoodListing.remaining_quantity > 0)
        .filter(FoodListing.latitude.between(min_lat, max_lat))
        .filter(FoodListing.longitude.between(min_lon, max_lon))
    )

    if category:
        query = query.filter(FoodListing.category == category)
    if listing_type:
        query = query.filter(FoodListing.listing_type == listing_type)
    if is_vegetarian is not None:
        query = query.filter(FoodListing.is_vegetarian == is_vegetarian)

    candidates = query.all()

    # 2. Compute exact spherical distance and sort
    results_with_distance = []
    for item in candidates:
        dist = calculate_haversine_distance(lat, lng, item.latitude, item.longitude)
        if dist <= radius_km:
            results_with_distance.append((item, dist))

    results_with_distance.sort(key=lambda x: x[1])

    formatted = [_format_listing_response(item, dist) for item, dist in results_with_distance]
    
    # Cache for 60 seconds
    try:
        cache_service.set(cache_key, json.dumps([f.dict() for f in formatted], default=str), ttl_seconds=60)
    except Exception:
        pass

    return formatted

@router.get("/{listing_id}", response_model=FoodListingResponse)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    return _format_listing_response(listing)

@router.post("", response_model=FoodListingResponse, status_code=status.HTTP_201_CREATED)
def create_food_listing(
    data: FoodListingCreate,
    provider: Provider = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    if data.pickup_start_time >= data.pickup_end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pickup start time must precede pickup end time."
        )

    listing = FoodListing(
        provider_id=provider.id,
        title=data.title,
        description=data.description,
        category=data.category,
        quantity=data.quantity,
        remaining_quantity=data.quantity,
        unit=data.unit,
        original_price=data.original_price,
        surplus_price=data.surplus_price if data.listing_type == ListingType.SALE else 0.0,
        listing_type=data.listing_type,
        image_url=data.image_url or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
        is_vegetarian=data.is_vegetarian,
        preparation_time=data.preparation_time,
        expiry_time=data.expiry_time,
        pickup_start_time=data.pickup_start_time,
        pickup_end_time=data.pickup_end_time,
        latitude=data.latitude or provider.latitude,
        longitude=data.longitude or provider.longitude,
        status=ListingStatus.ACTIVE
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return _format_listing_response(listing)

@router.put("/{listing_id}", response_model=FoodListingResponse)
def update_food_listing(
    listing_id: int,
    data: FoodListingUpdate,
    provider: Provider = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if listing.provider_id != provider.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this listing.")

    for field, val in data.dict(exclude_unset=True).items():
        setattr(listing, field, val)

    db.commit()
    db.refresh(listing)
    return _format_listing_response(listing)

@router.delete("/{listing_id}", status_code=status.HTTP_200_OK)
def cancel_listing(
    listing_id: int,
    provider: Provider = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found.")
    if listing.provider_id != provider.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this listing.")

    listing.status = ListingStatus.CANCELLED
    db.commit()
    return {"message": "Listing successfully cancelled."}
