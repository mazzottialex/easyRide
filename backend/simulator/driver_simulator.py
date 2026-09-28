import argparse
import json
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def send_location(base_url, ride_id, token, coordinate):
    body = json.dumps({"location": f"{coordinate[0]},{coordinate[1]}"}).encode()
    request = Request(
        f"{base_url}/api/rides/{ride_id}/location",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="PATCH",
    )
    try:
        with urlopen(request, timeout=10):
            return
    except (HTTPError, URLError) as error:
        raise RuntimeError(f"Location update failed: {error}") from error


def simulate_route(coordinates, base_url, ride_id, token, step_seconds):
    for coordinate in coordinates:
        send_location(base_url, ride_id, token, coordinate)
        time.sleep(step_seconds)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ride_id")
    parser.add_argument("token")
    parser.add_argument("--base-url", default="http://localhost:3000")
    parser.add_argument("--step-seconds", type=float, default=1)
    args = parser.parse_args()

    route = json.load(sys.stdin)

    simulate_route(
        route,
        args.base_url,
        args.ride_id,
        args.token,
        args.step_seconds,
    )
    print("Simulation completed")


if __name__ == "__main__":
    main()
