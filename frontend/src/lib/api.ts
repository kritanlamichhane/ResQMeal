const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('resqmeal_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      throw new Error(errorData.message || errorData.detail || 'An error occurred with the request.');
    }

    return response.json();
  }

  // Auth
  login(credentials: { email: string; password: string }) {
    return this.request<{ access_token: string; refresh_token: string; role: string; user_id: number; full_name: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(data: any) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getMe() {
    return this.request<any>('/auth/me');
  }

  // Listings
  getListings(params?: Record<string, any>) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });
    }
    return this.request<any>(`/listings?${query.toString()}`);
  }

  getNearbyListings(lat: number, lng: number, radiusKm: number = 10, category?: string, isVegetarian?: boolean) {
    const query = new URLSearchParams({ lat: String(lat), lng: String(lng), radius_km: String(radiusKm) });
    if (category) query.append('category', category);
    if (isVegetarian !== undefined) query.append('is_vegetarian', String(isVegetarian));
    return this.request<any[]>(`/listings/nearby?${query.toString()}`);
  }

  getListing(id: number) {
    return this.request<any>(`/listings/${id}`);
  }

  createListing(data: any) {
    return this.request<any>('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  deleteListing(id: number) {
    return this.request<any>(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Reservations
  reserveFood(listingId: number, quantity: number) {
    return this.request<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId, quantity }),
    });
  }

  getMyReservations() {
    return this.request<any[]>('/reservations/my');
  }

  getReservation(id: number) {
    return this.request<any>(`/reservations/${id}`);
  }

  cancelReservation(id: number, reason?: string) {
    return this.request<any>(`/reservations/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  confirmPickup(pickupCode: string) {
    return this.request<any>('/reservations/confirm-pickup', {
      method: 'POST',
      body: JSON.stringify({ pickup_code: pickupCode }),
    });
  }

  getProviderActiveReservations() {
    return this.request<any[]>('/reservations/provider/active');
  }

  // Notifications
  getNotifications() {
    return this.request<any[]>('/notifications');
  }

  getUnreadNotificationCount() {
    return this.request<{ unread_count: number }>('/notifications/unread-count');
  }

  markNotificationRead(id: number) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  markAllNotificationsRead() {
    return this.request<any>('/notifications/read-all', {
      method: 'POST',
    });
  }

  // AI & Analytics
  predictSurplus(data: any) {
    return this.request<any>('/ai/predict-surplus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getSmartPricing(data: any) {
    return this.request<any>('/ai/smart-pricing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  extractFoodImage(data: any) {
    return this.request<any>('/ai/extract-food-image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  matchDonations() {
    return this.request<any[]>('/ai/match-donations');
  }

  getPlatformMetrics() {
    return this.request<any>('/analytics/platform');
  }

  getProviderAnalytics() {
    return this.request<any>('/analytics/provider');
  }

  // System
  getSystemHealth() {
    return this.request<any>('/admin/system-health');
  }

  runExpirationWorker() {
    return this.request<any>('/admin/run-expiration', { method: 'POST' });
  }

  getAdminUsers() {
    return this.request<any[]>('/admin/users');
  }
}

export const api = new ApiClient();
