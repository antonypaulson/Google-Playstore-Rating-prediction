# Dataset

This project uses **Google Play Store Apps** by [Lavanya Gupta (lava18)](https://www.kaggle.com/datasets/lava18/google-play-store-apps) on Kaggle.

The CSV is not stored in this repository. The notebook only needs `googleplaystore.csv` (about 10k apps). The optional `googleplaystore_user_reviews.csv` file is not used.

## Columns used

`App`, `Category`, `Rating`, `Reviews`, `Size`, `Installs`, `Type`, `Price`, `Content Rating`, `Genres`, `Last Updated`, `Current Ver`, `Android Ver`

## How to obtain the file

**Option A — download script**

From the repository root:

```bash
python scripts/download_data.py
```

This writes `data/googleplaystore.csv` from a public copy of the same Kaggle file.

**Option B — Kaggle (official source)**

1. Open https://www.kaggle.com/datasets/lava18/google-play-store-apps
2. Download `googleplaystore.csv`
3. Place it at `data/googleplaystore.csv` or in the repository root

The notebook looks for the file in the current working directory first, then `data/`.
