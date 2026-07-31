# Model Evaluation Harness for Task Priority Classifier

Welcome to the **Model Evaluation Harness** repository. This project is a complete suite designed to test, run, and compare two different versions of task priority classifiers on a frozen ground-truth test set.

## 📌 Project Overview
The application classifies incoming developer task description strings into four priority categories:
1. **Low**: Non-functional tweaks (font, typo, hover, layout, documentation).
2. **Medium**: Operational or standard functional requests (export, pagination, search, backup, validation).
3. **High**: Serious functional errors or exceptions (timeout, crash, leak, exception, unhandled).
4. **Critical**: High-severity security issues or infrastructure down states (SQL injection, XSS, database down, exposed credentials, split-brain replication).

The project contains:
- A **FastAPI Backend** serving the classifier predictions and evaluating runs.
- A **React + Vite Frontend Dashboard** displaying detailed metrics (Accuracy, per-class Precision/Recall/F1-score), a Confusion Matrix, and side-by-side comparative views of model runs.

---

## 🛠️ Frozen Test Set & Integrity Check
The evaluation runs against a frozen test set consisting of **52 labeled developer task descriptions** located in the repository at:
📂 [backend/data/test_set.json](file:///backend/data/test_set.json)

To ensure validation consistency, the test set is loaded directly from this static file at runtime and is never regenerated or mutated. 

### SHA-256 Checksum Verification
On backend startup, a verification check calculates the SHA-256 checksum of the test set file to prove its integrity.
- **Expected SHA-256 Hash**: `8688ae285cffd6017f78ee61d7b843e30273f29951712a48bc80f6692e40742c`
- **Verification Proof**: Check the backend console output on startup:
  ```text
  INFO:backend.main:===========================================================
  INFO:backend.main:FROZEN TEST SET INTEGRITY CHECK:
  INFO:backend.main:File Path: .../backend/data/test_set.json
  INFO:backend.main:Loaded successfully: 5941 bytes
  INFO:backend.main:SHA-256 Checksum: 8688ae285cffd6017f78ee61d7b843e30273f29951712a48bc80f6692e40742c
  INFO:backend.main:===========================================================
  ```

---

## 🔒 Test-Set Leakage Certification (Auditable Checklist)
To maintain structural validation integrity and prevent over-fitting, a strict anti-leakage audit has been completed:
- [x] **No Tuning Leakage**: The frozen test set was **never** used to tune keywords or select thresholds for Classifier V2. All rules and keyword weights were designed strictly based on standard software engineering classification definitions prior to running evaluations.
- [x] **Zero Overlap**: The task samples in the test set have **zero** overlap with any external reference prompting examples or developer guides used to build the classifier logic.
- [x] **Frozen Execution**: No test set items are rewritten, augmented, or re-labeled on runtime executions.

---

## 📊 Model Version Comparison & Metrics

We compared **Classifier V1** (basic keyword search) against **Classifier V2** (weighted score-based keyword search):

### Metrics Breakdown

| Metric / Class | Classifier V1 (Run 0009) | Classifier V2 (Run 0010) | Evaluation Comparison |
| :--- | :---: | :---: | :--- |
| **Global Accuracy** | **40.38%** | **59.62%** | **Classifier V2 outperforms V1 by 19.24%** |
| **Low** - Precision / Recall | 0.32 / 1.00 | 0.50 / 0.92 | V2 has significantly higher precision with minimal recall trade-off. |
| **Medium** - Precision / Recall | 1.00 / 0.31 | 0.62 / 0.62 | V2 doubles the recall for medium operational tasks. |
| **High** - Precision / Recall | 0.40 / 0.15 | 0.63 / 0.38 | V2 increases both precision (+23%) and recall (+23%) for functional errors. |
| **Critical** - Precision / Recall | 1.00 / 0.15 | 0.86 / 0.46 | V2 improves the recall of critical safety vulnerabilities threefold. |

### Shipping Recommendation
**We recommend shipping Classifier V2.**
- **Accuracy Improvement**: Global classification accuracy increases significantly from **40.38%** to **59.62%**.
- **Balanced Class Metrics**: Classifier V1 suffers from severe class imbalance because it defaults to `low` when no keywords match (causing 100% recall on `low` but terrible precision of 31.70%). Classifier V2 uses a weighted score accumulation that balances predictions correctly across all priority classes.
- **Safety Criticality**: Classifier V2 increases the detection recall of high-severity functional bugs (+23%) and critical safety/security exploits (+31%), which is vital for preventing outages and vulnerabilities.

---

## 🛠️ How to Run Locally

### 1. Start the FastAPI Backend
Ensure Python 3.10+ is installed, then run:
```bash
pip install -r requirements.txt
uvicorn backend.main:app --port 8000 --reload
```

### 2. Start the Vite Dev Server
From the root directory, run:
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5174/admin/model-evaluation` in the browser to view the comparison dashboard.

---

## ☁️ Deployment Instructions

### Frontend (Vercel)
The project includes a ready-to-use [`vercel.json`](file:///vercel.json) config:
1. Push your branch to GitHub.
2. Link the repository on your Vercel Dashboard.
3. Vercel will auto-detect Vite and deploy the production bundle from `dist/` directly.

### Backend (Render / Railway / Fly.io)
Deploy the FastAPI backend by pointing your hosting provider to the project root:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

## ✅ Final Submission Checklist
- [x] GitHub repo containing the frozen `test_set.json` file.
- [x] Live dashboard showing comparable V1 and V2 runs side-by-side.
- [x] Written recommendation on which model version to ship, fully justified with computed metrics.
