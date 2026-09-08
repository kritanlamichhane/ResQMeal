"""
ResQMeal Redis Layer & Cache Manager
====================================
Architectural Roles of Redis in ResQMeal:
1. Nearby Listings Cache:
   - Geospatial queries are computationally expensive (spatial index lookups + distance sorting).
   - Redis caches nearby search results by geohash / grid-rounded coordinates (TTL: 60s) to absorb repeated consumer searches.
2. Distributed Reservation Lock:
   - For high-concurrency listing spikes, an atomic Redis lock (`SET lock:listing:{id} NX EX 5`)
     prevents thundering herd problems on PostgreSQL rows during intense reservation rushes.
3. Rate Limiting:
   - Protects critical reservation endpoints (`POST /api/v1/reservations`) against bot flooding and abuse
     using sliding window counters (`rate_limit:{user_id}:{endpoint}`).
4. Session & Invalidation State:
   - Tracks blacklisted revoked refresh tokens upon user logout.
"""

import json
import time
import threading
from typing import Optional, Any
from app.core.config import settings

try:
    import redis
    _redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
    # Test connection
    _redis_client.ping()
    _use_redis = True
except Exception:
    _redis_client = None
    _use_redis = False


class InMemoryCacheFallback:
    """Thread-safe in-memory cache fallback for development without a running Redis server."""
    def __init__(self):
        self._store = {}
        self._expires = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[str]:
        with self._lock:
            now = time.time()
            if key in self._expires and self._expires[key] < now:
                self._store.pop(key, None)
                self._expires.pop(key, None)
                return None
            return self._store.get(key)

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        with self._lock:
            self._store[key] = value
            if ex:
                self._expires[key] = time.time() + ex
            else:
                self._expires.pop(key, None)
            return True

    def delete(self, key: str) -> bool:
        with self._lock:
            self._store.pop(key, None)
            self._expires.pop(key, None)
            return True

    def incr(self, key: str) -> int:
        with self._lock:
            val = int(self._store.get(key, 0)) + 1
            self._store[key] = str(val)
            return val

    def expire(self, key: str, seconds: int):
        with self._lock:
            if key in self._store:
                self._expires[key] = time.time() + seconds

_fallback_cache = InMemoryCacheFallback()


class CacheService:
    @staticmethod
    def is_live_redis() -> bool:
        return _use_redis

    @staticmethod
    def get(key: str) -> Optional[str]:
        if _use_redis and _redis_client:
            try:
                return _redis_client.get(key)
            except Exception:
                pass
        return _fallback_cache.get(key)

    @staticmethod
    def set(key: str, value: str, ttl_seconds: int = 300) -> bool:
        if _use_redis and _redis_client:
            try:
                return bool(_redis_client.set(key, value, ex=ttl_seconds))
            except Exception:
                pass
        return _fallback_cache.set(key, value, ex=ttl_seconds)

    @staticmethod
    def delete(key: str) -> bool:
        if _use_redis and _redis_client:
            try:
                return bool(_redis_client.delete(key))
            except Exception:
                pass
        return _fallback_cache.delete(key)

    @staticmethod
    def check_rate_limit(key: str, limit: int, window_seconds: int) -> bool:
        """
        Sliding / fixed window rate limiter.
        Returns True if within limit, False if rate limit exceeded.
        """
        rate_key = f"rate_limit:{key}"
        current = CacheService.get(rate_key)
        if current is None:
            CacheService.set(rate_key, "1", ttl_seconds=window_seconds)
            return True
        count = int(current)
        if count >= limit:
            return False
        # Increment
        if _use_redis and _redis_client:
            try:
                _redis_client.incr(rate_key)
                return True
            except Exception:
                pass
        _fallback_cache.incr(rate_key)
        return True

    @staticmethod
    def acquire_lock(lock_name: str, timeout_seconds: int = 5) -> bool:
        """Acquires a temporary non-blocking lock to coordinate critical operations."""
        key = f"lock:{lock_name}"
        if _use_redis and _redis_client:
            try:
                return bool(_redis_client.set(key, "locked", nx=True, ex=timeout_seconds))
            except Exception:
                pass
        with _fallback_cache._lock:
            now = time.time()
            if key in _fallback_cache._expires and _fallback_cache._expires[key] >= now:
                return False  # Already locked
            _fallback_cache._store[key] = "locked"
            _fallback_cache._expires[key] = now + timeout_seconds
            return True

    @staticmethod
    def release_lock(lock_name: str) -> bool:
        key = f"lock:{lock_name}"
        return CacheService.delete(key)

cache_service = CacheService()
