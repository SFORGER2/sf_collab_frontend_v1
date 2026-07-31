# Model Evaluation Harness API Documentation

This API supports testing, running, and storing performance comparisons of classifier models on developer task severity datasets.

## Base URL
* **Local Development**: `http://127.0.0.1:8000`
* **Production / Deployed API**: `https://sf-collab-frontend-v1-api.vercel.app` (or your Render URL)

## Authentication
None required (public access).

---

## Endpoints

### 1. Evaluate a Classifier Version
Runs the selected classifier model against the frozen ground-truth test set (`test_set.json`), computes performance metrics (global accuracy, per-class precision, recall, and F1-score), calculates a confusion matrix, and appends the run to persistent storage.

* **Path**: `/api/evaluate`
* **Method**: `POST`
* **Request Header**: `Content-Type: application/json`
* **Request Body Schema**:
  * `model_version` (string, required): The version of the model to run. Must be either `"v1"` or `"v2"`.
* **Request Body Example**:
  ```json
  {
    "model_version": "v2"
  }
  ```
* **Success Response (HTTP 201 Created)**:
  ```json
  {
    "run_id": "run_0010",
    "model_version": "v2",
    "timestamp": "2026-07-31T15:55:34Z",
    "total_samples": 52,
    "accuracy": 0.5961538461538461,
    "per_class_metrics": {
      "low": {
        "precision": 0.5,
        "recall": 0.9230769230769231,
        "f1_score": 0.6486486486486487
      },
      "medium": {
        "precision": 0.6153846153846154,
        "recall": 0.6153846153846154,
        "f1_score": 0.6153846153846154
      },
      "high": {
        "precision": 0.625,
        "recall": 0.38461538461538464,
        "f1_score": 0.4761904761904762
      },
      "critical": {
        "precision": 0.8571428571428571,
        "recall": 0.4615384615384616,
        "f1_score": 0.6
      }
    },
    "confusion_matrix": {
      "labels": ["low", "medium", "high", "critical"],
      "matrix": [
        [12, 1, 0, 0],
        [5, 8, 0, 0],
        [4, 3, 5, 1],
        [3, 1, 3, 6]
      ]
    }
  }
  ```
* **Error Responses**:
  * **HTTP 400 Bad Request**: Unsupported model version.
    ```json
    {
      "detail": "Unsupported classifier version 'v3'. Must be 'v1' or 'v2'."
    }
    ```
  * **HTTP 422 Unprocessable Entity**: Invalid request payload shape.
  * **HTTP 500 Internal Server Error**: Test set missing or corrupt.

---

### 2. Get Evaluation History
Retrieves all historical evaluation runs stored in the persistent runs registry.

* **Path**: `/api/evaluations`
* **Method**: `GET`
* **Success Response (HTTP 200 OK)**:
  * Returns a list of evaluation run records.
  ```json
  [
    {
      "run_id": "run_0009",
      "model_version": "v1",
      "timestamp": "2026-07-31T15:55:34Z",
      "total_samples": 52,
      "accuracy": 0.40384615384615385,
      "per_class_metrics": {
        "low": { "precision": 0.317, "recall": 1.0, "f1_score": 0.481 },
        "medium": { "precision": 1.0, "recall": 0.307, "f1_score": 0.47 },
        "high": { "precision": 0.4, "recall": 0.153, "f1_score": 0.222 },
        "critical": { "precision": 1.0, "recall": 0.153, "f1_score": 0.266 }
      },
      "confusion_matrix": {
        "labels": ["low", "medium", "high", "critical"],
        "matrix": [
          [13, 0, 0, 0],
          [9, 4, 0, 0],
          [11, 0, 2, 0],
          [8, 0, 3, 2]
        ]
      }
    },
    {
      "run_id": "run_0010",
      "model_version": "v2",
      "timestamp": "2026-07-31T15:55:34Z",
      "total_samples": 52,
      "accuracy": 0.5961538461538461,
      "per_class_metrics": {
        "low": { "precision": 0.5, "recall": 0.923, "f1_score": 0.648 },
        "medium": { "precision": 0.615, "recall": 0.615, "f1_score": 0.615 },
        "high": { "precision": 0.625, "recall": 0.384, "f1_score": 0.476 },
        "critical": { "precision": 0.857, "recall": 0.461, "f1_score": 0.6 }
      },
      "confusion_matrix": {
        "labels": ["low", "medium", "high", "critical"],
        "matrix": [
          [12, 1, 0, 0],
          [5, 8, 0, 0],
          [4, 3, 5, 1],
          [3, 1, 3, 6]
        ]
      }
    }
  ]
  ```

---

### 3. Get Latest Evaluation Run
Retrieves the detail schema for the most recently completed evaluation run.

* **Path**: `/api/evaluations/latest`
* **Method**: `GET`
* **Success Response (HTTP 200 OK)**:
  * Returns the latest run object.
  ```json
  {
    "run_id": "run_0010",
    "model_version": "v2",
    "timestamp": "2026-07-31T15:55:34Z",
    "total_samples": 52,
    "accuracy": 0.5961538461538461,
    "per_class_metrics": { ... },
    "confusion_matrix": { ... }
  }
  ```
