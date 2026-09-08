"""
ResQMeal Load & Concurrency Benchmark
=====================================
Usage:
  python load_tests/concurrent_reservations_stress.py --url http://localhost:8000 --listing-id 1 --concurrency 50
"""

import argparse
import time
import concurrent.futures
import statistics
try:
    import httpx
except ImportError:
    import urllib.request
    import json

def benchmark_concurrent_reservations(base_url: str, listing_id: int, total_requests: int = 50, concurrency: int = 15):
    print(f"=== ResQMeal Concurrent Reservation Benchmark ===")
    print(f"Target: {base_url}/api/v1/reservations")
    print(f"Listing ID: {listing_id} | Total Requests: {total_requests} | Concurrency: {concurrency}")
    
    # First, authenticate as a consumer
    login_url = f"{base_url}/api/v1/auth/login"
    login_payload = {"email": "consumer@resqmeal.com", "password": "Consumer@1234"}
    
    with httpx.Client(timeout=10.0) as client:
        r = client.post(login_url, json=login_payload)
        if r.status_code != 200:
            print(f"Failed to authenticate: {r.text}")
            return
        token = r.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    reserve_payload = {"listing_id": listing_id, "quantity": 1}

    latencies = []
    statuses = {}
    
    def send_reserve():
        start = time.perf_counter()
        try:
            with httpx.Client(timeout=10.0) as cl:
                res = cl.post(f"{base_url}/api/v1/reservations", json=reserve_payload, headers=headers)
                elapsed = (time.perf_counter() - start) * 1000.0 # ms
                return res.status_code, elapsed
        except Exception as e:
            return 500, 0.0

    t0 = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as pool:
        futures = [pool.submit(send_reserve) for _ in range(total_requests)]
        for f in concurrent.futures.as_completed(futures):
            code, lat = f.result()
            latencies.append(lat)
            statuses[code] = statuses.get(code, 0) + 1
    total_time = time.perf_counter() - t0

    print("\n--- Benchmark Results ---")
    print(f"Total Elapsed Time: {round(total_time, 2)}s")
    print(f"Throughput: {round(total_requests / total_time, 1)} req/s")
    print(f"Status Code Breakdown: {statuses}")
    if latencies:
        latencies.sort()
        print(f"p50 Latency: {round(statistics.median(latencies), 1)} ms")
        p95_idx = int(len(latencies) * 0.95)
        p99_idx = int(len(latencies) * 0.99)
        print(f"p95 Latency: {round(latencies[p95_idx], 1)} ms")
        print(f"p99 Latency: {round(latencies[p99_idx], 1)} ms")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8000")
    parser.add_argument("--listing-id", type=int, default=1)
    parser.add_argument("--concurrency", type=int, default=20)
    parser.add_argument("--requests", type=int, default=50)
    args = parser.parse_args()

    benchmark_concurrent_reservations(args.url, args.listing_id, args.requests, args.concurrency)
