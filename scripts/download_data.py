#!/usr/bin/env python3
"""Download googleplaystore.csv used by Google_apps.ipynb.

The official source is the public Kaggle dataset:
https://www.kaggle.com/datasets/lava18/google-play-store-apps

This script fetches a public copy of that file so the notebook can run
without a Kaggle account. Prefer downloading from Kaggle if you want the
canonical archive.

The file is accepted only if it matches the pinned SHA-256 and row count
of the lava18 googleplaystore.csv used by this notebook (10,841 rows).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import sys
import urllib.error
import urllib.request
from pathlib import Path

# Public mirrors of lava18/google-play-store-apps (googleplaystore.csv).
SOURCES = [
    "https://raw.githubusercontent.com/DoyenPyth/Google-Play-Store-Apps/main/googleplaystore.csv",
    "https://raw.githubusercontent.com/muthazir/google-playstore-eda/master/googleplaystore.csv",
]

# lava18 googleplaystore.csv (10,841 app rows). Reject truncated or substituted files.
EXPECTED_SHA256 = "3e438f48161961933d26e99a8d9fc8ed79edfaa9fb34f8838e1ab4ec7a9fab91"
EXPECTED_ROWS = 10841

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


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate(path: Path, check_checksum: bool = True) -> tuple[int, str]:
    digest = file_sha256(path)
    if check_checksum and digest != EXPECTED_SHA256:
        raise ValueError(
            f"SHA-256 mismatch for {path}: got {digest}, "
            f"expected {EXPECTED_SHA256}. This is not the lava18 "
            "googleplaystore.csv used by the notebook."
        )

    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError("CSV has no header row")
        missing = EXPECTED_COLUMNS.difference(reader.fieldnames)
        if missing:
            raise ValueError(f"CSV is missing expected columns: {sorted(missing)}")
        rows = sum(1 for _ in reader)

    if rows != EXPECTED_ROWS:
        raise ValueError(
            f"CSV has {rows} data rows, expected {EXPECTED_ROWS} "
            "(lava18 googleplaystore.csv)."
        )
    return rows, digest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("data/googleplaystore.csv"),
        help="Destination path (default: data/googleplaystore.csv)",
    )
    parser.add_argument(
        "--skip-checksum",
        action="store_true",
        help="Skip the pinned SHA-256 check (still requires columns and 10841 rows).",
    )
    args = parser.parse_args()

    if args.output.exists():
        try:
            rows, digest = validate(args.output, check_checksum=not args.skip_checksum)
        except ValueError as exc:
            print(exc, file=sys.stderr)
            print(
                "Replace the file with the lava18 googleplaystore.csv "
                "or download it again.",
                file=sys.stderr,
            )
            return 1
        status = "checksum skipped" if args.skip_checksum else "checksum ok"
        print(f"Already present: {args.output} ({rows} rows, {status}, sha256={digest})")
        return 0

    errors = []
    for url in SOURCES:
        try:
            print(f"Downloading {url}")
            download(url, args.output)
            rows, digest = validate(args.output, check_checksum=not args.skip_checksum)
            status = "checksum skipped" if args.skip_checksum else "checksum ok"
            print(f"Wrote {args.output} ({rows} rows, {status}, sha256={digest})")
            return 0
        except (urllib.error.URLError, OSError, ValueError) as exc:
            errors.append(f"{url}: {exc}")
            if args.output.exists():
                args.output.unlink()

    print("Could not download googleplaystore.csv from public mirrors.", file=sys.stderr)
    print("Download it from Kaggle and place it at data/googleplaystore.csv:", file=sys.stderr)
    print("https://www.kaggle.com/datasets/lava18/google-play-store-apps", file=sys.stderr)
    print(f"Expected SHA-256: {EXPECTED_SHA256}", file=sys.stderr)
    for error in errors:
        print(f"  - {error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
