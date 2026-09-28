"""
ResQMeal In-Memory Cache and Rate Limiting Service
==================================================
This module provides an in-memory caching, rate-limiting, and locking layer.
Designed for simple, reliable local execution without requiring an external Redis server.

Key Features:
- Key-Value storage with TTL (Time To Live) support.
- Sliding window / fixed window rate limiting per client IP.
- Mutex lock simulation to coordinate critical sections.
- Thread-safe operations using Python's threading.Lock.
"""

import time
import threading
from typing import Optional, Dict, Any

class InMemoryCacheService:
    """Thread-safe in-memory cache and locking service."""
    
    def __init__(self) -> None:
        self._store: Dict[str, str] = {}
        self._expires: Dict[str, float] = {}
        self._lock = threading.Lock()

    def is_live_redis(self) -> bool:
        """Returns False since we are running in simple in-memory mode."""
        return False

    def get(self, key: str) -> Optional[str]:
        """Retrieve a cached value by key if not expired."""
        with self._lock:
            now = time.time()
            if key in self._expires and self._expires[key] < now:
                self._store.pop(key, None)
                self._expires.pop(key, None)
                return None
            return self._store.get(key)

    def set(self, key: str, value: str, ttl_seconds: Optional[int] = 300) -> bool:
        """Store a key-value pair with an optional TTL expiration in seconds."""
        with self._lock:
            self._store[key] = str(value)
            if ttl_seconds:
                self._expires[key] = time.time() + ttl_seconds
            else:
                self._expires.pop(key, None)
            return True

    def delete(self, key: str) -> bool:
        """Remove a key from the cache."""
        with self._lock:
            self._store.pop(key, None)
            self._expires.pop(key, None)
            return True

    def incr(self, key: str) -> int:
        """Increment an integer counter atomically."""
        with self._lock:
            val = int(self._store.get(key, 0)) + 1
            self._store[key] = str(val)
            return val

    def check_rate_limit(self, key: str, limit: int = 60, window_seconds: int = 60) -> bool:
        """
        Check if the request rate for a given key is within allowed limits.
        
        Args:
            key: Unique identifier (e.g. 'client_ip:endpoint').
            limit: Maximum requests allowed within the window.
            window_seconds: Duration of the rate limiting window in seconds.
            
        Returns:
            True if request is permitted, False if limit exceeded.
        """
        rate_key = f"rate_limit:{key}"
        with self._lock:
            now = time.time()
            if rate_key in self._expires and self._expires[rate_key] < now:
                self._store.pop(rate_key, None)
                self._expires.pop(rate_key, None)

            current = self._store.get(rate_key)
            if current is None:
                self._store[rate_key] = "1"
                self._expires[rate_key] = now + window_seconds
                return True

            count = int(current)
            if count >= limit:
                return False

            self._store[rate_key] = str(count + 1)
            return True

    def acquire_lock(self, lock_name: str, timeout_seconds: int = 5) -> bool:
        """
        Acquire a non-blocking mutex lock for concurrency control.
        
        Args:
            lock_name: Unique lock identifier.
            timeout_seconds: Lock lease expiration time in seconds.
            
        Returns:
            True if acquired, False if already held.
        """
        key = f"lock:{lock_name}"
        with self._lock:
            now = time.time()
            if key in self._expires and self._expires[key] >= now:
                return False  # Lock already held
            
            self._store[key] = "locked"
            self._expires[key] = now + timeout_seconds
            return True

    def release_lock(self, lock_name: str) -> bool:
        """Release a previously acquired mutex lock."""
        key = f"lock:{lock_name}"
        return self.delete(key)

# Global singleton instance
cache_service = InMemoryCacheService()
