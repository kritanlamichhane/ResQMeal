export type UserRole = 'CONSUMER' | 'PROVIDER' | 'NGO' | 'ADMIN';

export type FoodCategory = 'MEALS' | 'BAKERY' | 'GROCERY' | 'PRODUCE' | 'SNACKS' | 'DAIRY' | 'BEVERAGES';
export type ListingType = 'SALE' | 'DONATION';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'CANCELLED';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'FAILED';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  provider_id?: number;
  ngo_id?: number;
}

export interface ProviderSummary {
  id: number;
  business_name: string;
  business_type: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface FoodListing {
  id: number;
  provider_id: number;
  title: string;
  description?: string;
  category: FoodCategory;
  quantity: number;
  remaining_quantity: number;
  unit: string;
  original_price: number;
  surplus_price: number;
  listing_type: ListingType;
  image_url?: string;
  is_vegetarian: boolean;
  preparation_time?: string;
  expiry_time: string;
  pickup_start_time: string;
  pickup_end_time: string;
  latitude: number;
  longitude: number;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  provider?: ProviderSummary;
  distance_km?: number;
}

export interface Reservation {
  id: number;
  listing_id: number;
  user_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: ReservationStatus;
  pickup_code: string;
  expires_at: string;
  cancellation_reason?: string;
  created_at: string;
  listing?: FoodListing;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PlatformMetrics {
  total_meals_rescued: number;
  total_food_weight_kg: number;
  total_co2_prevented_kg: number;
  total_money_saved_consumers: number;
  total_revenue_recovered_providers: number;
  total_active_listings: number;
  total_providers: number;
  total_ngos: number;
  total_consumers: number;
  pickup_completion_rate_pct: number;
}

export interface SurplusPredictionResult {
  predicted_surplus_quantity: number;
  confidence_interval: [number, number];
  waste_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
  metrics: {
    mae: number;
    rmse: number;
    r2: number;
    sample_count: number;
  };
}

export interface SmartPricingResult {
  recommended_price: number;
  discount_percentage: number;
  urgency_tier: string;
  decay_factor: number;
  rationale: string;
  breakdown: Record<string, any>;
}

export interface NGOMatchItem {
  listing_id: number;
  title: string;
  provider_name: string;
  category: string;
  quantity: number;
  distance_km: number;
  urgency_hours: number;
  match_score: number;
  score_breakdown: Record<string, number>;
}
