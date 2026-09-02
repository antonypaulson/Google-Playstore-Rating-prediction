#!/usr/bin/env python3
"""Download googleplaystore.csv used by Google_apps.ipynb.

The official source is the public Kaggle dataset:
https://www.kaggle.com/datasets/lava18/google-play-store-apps

This script fetches a public copy of that file so the notebook can run
without a Kaggle account. Prefer downloading from Kaggle if you want the
canonical archive.
"""

from __future__ import annotations

import argparse
import csv
import sys
import urllib.error
import urllib.request
from pathlib import Path

# Public mirrors of lava18/google-play-store-apps (googleplaystore.csv).
SOURCES = [
    "https://raw.githubusercontent.com/DoyenPyth/Google-Play-Store-Apps/main/googleplaystore.csv",
    "https://raw.githubusercontent.com/muthazir/google-playstore-eda/master/googleplaystore.csv",
]

EXPECTED_COLUMNS = {
    "App",
    "Category",
    "Rating",
    "Reviews",
    "Size",
    "Installs",
    "Type",
    "Price",
    "Content Rating",
    "Genres",
    "Last Updated",
    "Current Ver",
    "Android Ver",
}


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "playstore-rating-prediction/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        dest.write_bytes(response.read())


def validate(path: Path) -> int:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError("CSV has no header row")
        missing = EXPECTED_COLUMNS.difference(reader.fieldnames)
        if missing:
            raise ValueError(f"CSV is missing expected columns: {sorted(missing)}")
        return sum(1 for _ in reader)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("data/googleplaystore.csv"),
        help="Destination path (default: data/googleplaystore.csv)",
    )
    args = parser.parse_args()

    if args.output.exists():
        rows = validate(args.output)
        print(f"Already present: {args.output} ({rows} rows)")
        return 0

    errors = []
    for url in SOURCES:
        try:
            print(f"Downloading {url}")
            download(url, args.output)
            rows = validate(args.output)
            print(f"Wrote {args.output} ({rows} rows)")
            return 0
        except (urllib.error.URLError, OSError, ValueError) as exc:
            errors.append(f"{url}: {exc}")
            if args.output.exists():
                args.output.unlink()

    print("Could not download googleplaystore.csv from public mirrors.", file=sys.stderr)
    print("Download it from Kaggle and place it at data/googleplaystore.csv:", file=sys.stderr)
    print("https://www.kaggle.com/datasets/lava18/google-play-store-apps", file=sys.stderr)
    for error in errors:
        print(f"  - {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
