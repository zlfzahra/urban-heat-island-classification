# Comparative Study of Machine Learning Models for District-Level Urban Heat Island Classification in Taiwan

**Conference Paper**

**2026 International Conference on Earth Observations and Society (ICEO&SI 2026)**

Zalfa Afifah Zahra  
Department of Civil Engineering and Environmental Informatics  
Minghsin University of Science and Technology, Taiwan

---

# Abstract

Urban Heat Island (UHI) is one of the most significant environmental consequences of rapid urbanization, contributing to increased energy consumption, heat-related health risks, and environmental degradation. Conventional UHI studies often rely solely on satellite observations or focus on individual cities, limiting their ability to represent nationwide thermal variability.

This study develops a district-level Urban Heat Island classification framework for Taiwan by integrating Landsat 8/9-derived land surface temperature (LST) with daily meteorological observations collected from Taiwan Environmental Protection Administration (EPA) monitoring stations. A total of **1,949 matched observations** collected between **May 2025 and May 2026** were used to evaluate four supervised machine learning algorithms: Random Forest (RF), Support Vector Machine (SVM), k-Nearest Neighbors (kNN), and Extreme Gradient Boosting (XGBoost).

Predictor variables included land surface characteristics (Albedo, NDVI, EVI, SAVI, NDBI, NDWI, MNDWI, and BSI) together with atmospheric variables (air temperature, relative humidity, and wind speed). Urban Heat Island intensity was categorized into five classes using standard deviation-based thresholds.

Experimental results demonstrated that ensemble learning models outperformed conventional classifiers, with **XGBoost achieving the highest cross-validation Macro F1-score (0.9142)**, followed closely by **Random Forest (0.9016)**. Feature importance analysis identified **Albedo** as the most influential predictor, followed by vegetation-related indices and built-up indicators. Spatial prediction further revealed the progressive expansion of UHI intensity across Taipei between 2020 and 2025.

The proposed framework demonstrates the effectiveness of integrating satellite remote sensing and in-situ meteorological observations for nationwide Urban Heat Island monitoring and provides practical support for climate adaptation and sustainable urban planning.

**Keywords:** Urban Heat Island, Remote Sensing, Landsat, Machine Learning, Taiwan, Urban Climate

---

# Research Motivation

Urban Heat Island has become a major environmental issue accompanying rapid urbanization. Increasing impervious surfaces, declining vegetation cover, and changing land use intensify heat accumulation within cities, resulting in elevated temperatures that negatively affect public health, energy demand, and environmental sustainability.

Although satellite remote sensing enables large-scale thermal monitoring, many previous studies rely solely on remotely sensed variables or focus on individual cities. Few studies integrate both satellite-derived environmental indicators and daily meteorological observations for district-level UHI classification across the entire island of Taiwan. This study addresses that research gap by combining Earth Observation data with machine learning techniques to improve nationwide UHI assessment.

---

# Research Objectives

This study aims to

1. Develop a district-level Urban Heat Island classification framework for Taiwan.
2. Integrate Landsat-derived environmental variables with daily meteorological observations.
3. Compare multiple supervised machine learning algorithms for multiclass UHI classification.
4. Identify the most influential environmental variables controlling Urban Heat Island intensity.
5. Produce spatial prediction maps for monitoring long-term UHI evolution.

---

# Study Area

- Country: Taiwan
- Monitoring stations: **78 Taiwan EPA stations**
- Districts analyzed: **80**
- Observation period: **May 2025 – May 2026**
- Matched observations: **1,949**

---

# Dataset

## Satellite Data

- Landsat 8 Collection 2 Level-2
- Landsat 9 Collection 2 Level-2

## Meteorological Data

Taiwan Environmental Protection Administration (EPA)

Variables:

- Air Temperature
- Relative Humidity
- Wind Speed

---

# Predictor Variables

## Remote Sensing Variables

- Land Surface Temperature (LST)
- Albedo
- NDVI
- EVI
- SAVI
- NDWI
- MNDWI
- NDBI
- BSI

## Meteorological Variables

- Air Temperature
- Relative Humidity
- Wind Speed

---

# Urban Heat Island Classification

Urban Heat Island intensity was calculated relative to the national mean Land Surface Temperature.

Five thermal classes were defined using standard deviation thresholds.

| Class | Description |
|--------|-------------|
| SUCI | Strong Urban Cool Island |
| MUCI | Moderate Urban Cool Island |
| TEZ | Thermal Equilibrium Zone |
| MUHI | Moderate Urban Heat Island |
| SUHI | Strong Urban Heat Island |

---

# Methodology

```
EPA Monitoring Stations
        │
        ▼
Landsat 8/9 Collection 2
        │
        ▼
Google Earth Engine
        │
        ├── Cloud masking
        ├── Radiometric correction
        ├── LST retrieval
        ├── Spectral indices
        └── Temporal matching (±8 days)
        │
        ▼
Feature Extraction
        │
        ▼
Dataset Construction
        │
        ├── Stratified Train/Test Split
        ├── SMOTE
        └── Hyperparameter Tuning
        │
        ▼
Machine Learning
        │
        ├── Random Forest
        ├── SVM
        ├── kNN
        └── XGBoost
        │
        ▼
Evaluation
        │
        ├── Accuracy
        ├── Precision
        ├── Recall
        ├── Macro F1
        ├── ROC-AUC
        └── Feature Importance
```

---

# Machine Learning Models

- Random Forest
- Support Vector Machine
- k-Nearest Neighbors
- XGBoost

Hyperparameter optimization was performed using **GridSearchCV** with **5-fold cross-validation**.

---

# Results

## Cross-validation Performance

| Model | Original | SMOTE |
|------|---------:|-------:|
| Random Forest | 0.9016 | 0.8561 |
| SVM | 0.5468 | 0.7530 |
| kNN | 0.6661 | 0.7744 |
| **XGBoost** | **0.9095** | **0.9142** |

XGBoost achieved the highest Macro F1-score (0.9142), while Random Forest obtained a comparable performance (0.9016). Ensemble learning methods substantially outperformed SVM and kNN for multiclass Urban Heat Island classification.

---

## Feature Importance

Random Forest feature importance ranked the environmental variables as follows:

| Rank | Variable |
|------|----------|
| 1 | Albedo |
| 2 | EVI |
| 3 | SAVI |
| 4 | NDWI |
| 5 | MNDWI |
| 6 | BSI |
| 7 | NDBI |
| 8 | NDVI |
| 9 | Air Temperature |
| 10 | Relative Humidity |
| 11 | Wind Speed |

Surface reflectance (Albedo) emerged as the dominant factor influencing Urban Heat Island intensity, followed by vegetation indices and built-up indicators.

---

## Spatial Prediction

The trained Random Forest model was used to generate district-level Urban Heat Island maps across Taipei between **2020 and 2025**.

The results reveal

- Expansion of urban heat from the city center
- Reduction of cooler zones in urban districts
- Persistent cooling effects in mountainous and coastal regions
- Increasing thermal stress associated with urban growth

---

# Repository Structure

```
urban-heat-island-classification/
│
├── data/
│   ├── ground_truth_combined.csv
│   ├── ground_truth_pivot.csv
│   ├── ground_truth_pivot_with_coordinates.csv
│   ├── ground_truth_uhi_landsat.csv
│   └── ground_truth_uhi_landsat_5class.csv
│
├── gee/
│   ├── 01_landsat_feature_extraction.js
│   └── 02_taipei_spatial_prediction_export.js
│
├── notebooks/
│   ├── 01_dataset_preparation.ipynb
│   ├── 02_machine_learning_models.ipynb
│   └── 03_results_visualization.ipynb
│
├── model/
│   └── Random_Forest_Original_best.pkl
│
└── README.md
```

---

# Future Work

Potential future extensions include

- Sentinel-2 integration
- Physics-informed machine learning
- Foundation Models for Earth Observation
- Real-time Urban Heat Island monitoring
- Urban Digital Twin applications
- Climate adaptation decision-support systems

---

# Citation

```bibtex
@inproceedings{zahra2026uhi,
  author = {Zahra, Zalfa Afifah and Chang, Kuan-Tsung},
  title = {Comparative Study of Machine Learning Models for District-Level Urban Heat Island Classification in Taiwan},
  booktitle = {International Conference on Earth Observations and Society (ICEO\&SI)},
  year = {2026}
}
```

---

# License

MIT License
