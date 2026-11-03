# Quickstart Guide

This guide provides step-by-step instructions to get the Titan AI Defense Lab running locally.

## Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or higher - note: use Python 3.12 or below if strict dependency versioning in `requirements.txt` is required, otherwise use the unpinned `requirements.txt` for Python 3.13 compatibility)

## 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the project root directory.
2. Create a Python virtual environment:
   ```powershell
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will be available at [http://localhost:8000](http://localhost:8000).  
   Interactive API documentation (Swagger UI) is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## 2. Frontend Setup (React + Vite)

1. Open a new terminal instance and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at [http://localhost:5173](http://localhost:5173).

## Troubleshooting

- **Python 3.13 NumPy Installation Errors**: If you encounter C++ compiler errors (like `GCC >= 8.4 required`) while installing `numpy` or `shap`, it means binary wheels for Python 3.13 are not available for the pinned versions. Unpin the exact versions in `requirements.txt` (remove `==x.x.x`) to let pip fetch the latest compatible releases.
- **PowerShell Execution Policies**: If you cannot run the activation script `Activate.ps1`, you may need to bypass the execution policy temporarily:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
  ```
