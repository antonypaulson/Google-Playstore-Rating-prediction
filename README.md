# Google Play Store Rating Prediction

Capstone project by [Antony Paulson Chazhoor](https://github.com/antonypaulson). The notebook explores Google Play Store app metadata and trains four regression models to predict user ratings.

This repository keeps the original analysis. The notebook, requirements, and dataset instructions were updated so the project can be run on current Python, pandas, scikit-learn, seaborn, TensorFlow 2, and LightGBM.

## Executive Summary

The ability to use services and products on the go has been a major leap in this century. Applications on the Google play store aim to do exactly that. Owing to worldwide accessibility and the ease of use, it has not only become the most popular application download destination but also a hotbed for competing services to attract and gain customers. This project aims to employ machine learning & visual analytics concepts to gain insights into how applications become successful and achieve high user ratings.

The dataset chosen for this project was from the popular data website Kaggle. It contains over 10k application data, capturing various details like category, reviews, installs, size, etc. The aim of the capstone project was to first generally visualize the distribution of the dataset across categories, identify correlations among the parameters and to then find an accurate machine learning model which could fairly accurately predict user ratings on any app when similar data is available. Seaborn & Matplotlib libraries of python were used to perform visualizations on python. Subsequently, four different machine learning models were used and trained on this data.

Visualizations indicated that the apps were broadly distributed across 33 distinct categories and that the family category was the most popular within this dataset. It also showed that the user ratings in the dataset were either 0 or mostly between 3.0 to 5.0. In the latter ratings interval the distribution roughly followed a normal distribution with the peak at approximate ratings of 4.5. Correlations among some major parameters were also visualized for the data. After initial visualizing and data processing, the goal was to create a machine learning model to predict user ratings. Four different models namely Multiple Linear Regression, Neural Networks, Decision Tree Regression, and Light Gradient Boosted Tree Model were created and they were trained on the available data. The LightGBM model predicted user ratings with the least error rates and much better when compared to the other machine learning models. Finally the important parameters responsible for predicting were identified. It was highly enlightening to see that the size of an application had the highest say in user ratings followed by the more obvious presence of many user reviews.

The capstone project helped to answer various questions about the data with regards to the distribution of the data, which model to use for rating predictions and finally which parameters affected the ratings. The approach adopted in the project can easily be scaled for huge similar datasets and when implemented correctly can provide an insightful advantage over the competition in the market.

## Original notebook results

These figures are from the stored outputs in `Google_apps.ipynb` (the original Colab run). They are not new measurements.

| Model | MAE | MSE | RMSE |
| --- | --- | --- | --- |
| Multiple Linear Regression | 1.148 | 2.426 | 1.557 |
| Neural Networks | 0.834 | 2.224 | 1.491 |
| Decision Tree Regression | 0.768 | 2.185 | 1.478 |
| Light Gradient Boosted Model | 0.623 | 1.065 | 1.032 |

LightGBM grid search selected `learning_rate=0.1` and `num_leaves=25`. After cleaning, the notebook used 9,659 unique apps across 33 categories (FAMILY was the largest).

Re-running the notebook on current library versions can produce slightly different numbers. Treat the table above as the original result.

## Setup

Python 3.10 or newer is recommended.

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

TensorFlow is only required for the neural-network cells. The linear regression, decision tree, and LightGBM sections can run without it.

## Dataset

`googleplaystore.csv` is **not** included here. It is the public Kaggle dataset [Google Play Store Apps (lava18)](https://www.kaggle.com/datasets/lava18/google-play-store-apps).

From the repository root:

```bash
python scripts/download_data.py
```

That writes `data/googleplaystore.csv`. You can also download the file from Kaggle and place it in the repository root or in `data/`. Details are in [`data/README.md`](data/README.md).

The notebook looks for:

1. `googleplaystore.csv` in the current working directory
2. `data/googleplaystore.csv`

## Run the notebook

```bash
jupyter notebook Google_apps.ipynb
```

Or open the same file in JupyterLab, VS Code, or [Colab](https://colab.research.google.com/github/antonypaulson/Google-Playstore-Rating-prediction/blob/master/Google_apps.ipynb).

The neural-network cell trains for 1,000 epochs (same as the original notebook) and can take several minutes.

## Project files

| File | Purpose |
| --- | --- |
| `Google_apps.ipynb` | Cleaning, visualization, and the four rating models |
| `Capstone_Antony_Paulson_Chazhoor.pdf` | Original capstone write-up |
| `requirements.txt` | Python dependencies |
| `scripts/download_data.py` | Fetches `googleplaystore.csv` |
| `data/README.md` | Dataset source and placement |

## Code updates

The analysis and model choices are unchanged. The notebook was updated so it runs on current libraries:

- Load the CSV from the repo root or `data/`
- Seaborn `countplot` / `histplot` instead of `sns.categorical.countplot` and `distplot`
- `DataFrame.corr(numeric_only=True)` and `pd.concat(..., axis=1)`
- TensorFlow 2 `Adam` optimizer and `mae` history keys
- LightGBM constructor / `train()` arguments that current versions accept
- Safer handling of the known malformed Play Store row (`Reviews` contains `3.0M`)
