---
title: Titanic XAI - Explainable AI Explorer
emoji: 🚢
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# Titanic Survival – Explainable AI Demo 🚢

Interactive web application showcasing **explainable AI techniques** for Titanic passenger survival prediction. Built with **React** frontend and **FastAPI** backend, featuring D3.js visualizations, real-time predictions, SHAP explanations, and natural language chat interface.

---

## 🚀 Quick Start

### Production Deployment (Hugging Face)
Visit the live demo: https://huggingface.co/spaces/bigpixel/titanic

### Local Development

**Option 1: Production Mode (React + FastAPI together)**
```bash
# Build React frontend
cd frontend
npm install && npm run build

# Start FastAPI (serves both API and React)
cd ../backend
source ../venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 7860

# Open http://localhost:7860
```

**Option 2: Development Mode (React + FastAPI separately)**
```bash
# Terminal 1: Start backend
cd backend
./start_server.sh

# Terminal 2: Start React app
cd frontend
npm install
npm run dev

# Open http://localhost:5173
```

---

## 📁 Project Structure

```
titanic/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── utils/      # Utilities (cohort patterns)
│   │   └── App.jsx
│   └── package.json
├── backend/            # FastAPI backend
│   ├── models/         # Decision Tree & XGBoost
│   ├── routes/         # API endpoints
│   └── main.py
└── docs/               # Documentation
    ├── FRONTEND.md     # React frontend guide
    ├── BACKEND.md      # FastAPI backend guide
    └── API.md          # API reference
```

---

## 🎯 Features

### React Frontend
- **D3.js Visualizations** - Decision tree with donut charts, SHAP waterfall charts
- **Real-time predictions** with 500ms debouncing
- **Model Comparison** - Side-by-side Decision Tree vs XGBoost
- **Color-coded results** (green/yellow/red based on survival probability)
- **Smart fare suggestions** that auto-adjust by passenger class
- **Chat interface** for natural language exploration
- **Quick presets** for instant testing (4 passenger profiles)
- **Responsive design** (two-column desktop, stacked mobile)
- **Loading skeletons** and error boundaries
- **Dark theme** with modern UI

### FastAPI Backend
- **Decision Tree** model (simple, interpretable)
- **XGBoost** model (higher accuracy)
- **SHAP explanations** for predictions
- **RESTful API** with interactive docs
- **CORS enabled** for frontend access
- **Static file serving** for React SPA

---

## 📚 Documentation

- **[Frontend Guide](docs/FRONTEND.md)** - React app setup, components, hooks
- **[Backend Guide](docs/BACKEND.md)** - FastAPI server, models, development
- **[API Reference](docs/API.md)** - Endpoint docs with examples
- **[AI Context](AI_CONTEXT.md)** - Comprehensive project documentation for AI assistants

---

## 🌐 Live Demo

**Production App**: https://huggingface.co/spaces/bigpixel/titanic

---

## 🛠️ Tech Stack

### React Frontend
- React 18 + Vite 7.3.0
- Tailwind CSS 3.4.0
- D3.js 7.9.0 for interactive visualizations
- Custom hooks (debouncing, caching, retry logic)

### FastAPI Backend
- FastAPI 0.104.1 + Uvicorn
- Python 3.12 (pandas incompatible with 3.13!)
- scikit-learn (Decision Tree)
- XGBoost
- SHAP for explainability
- Pydantic for validation

### Deployment
- Docker multi-stage build (Node.js → Python)
- Hugging Face Spaces

---

## 🔧 Development

### Backend
```bash
cd backend
../venv/bin/pip install -r requirements.txt
./start_server.sh

# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### React Frontend
```bash
cd frontend
npm install
npm run dev

# App runs at http://localhost:5173
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest test_api.py -v
```

### Frontend (Manual)
1. Start backend
2. Start frontend
3. Click preset buttons
4. Adjust sliders
5. Watch predictions update
6. Test chat interface

---

## 📊 Example Predictions

| Passenger Profile | Survival Rate |
|-------------------|--------------|
| 🎭 30yo woman, 2nd class, £20 | ~92% |
| 👨 30yo man, 3rd class, £13 | ~14% |
| 👶 5yo girl, 1st class, £84 | ~98% |
| ⚓ 40yo man, 3rd class, £8 | ~7% |

---

## 💡 Key Insights

The models reveal:
- **Gender is the strongest predictor** (women had 74% survival vs men at 19%)
- **Passenger class matters** (1st class: 63%, 2nd: 47%, 3rd: 24%)
- **Age impacts survival** (children had higher survival rates)
- **Fare correlates with class** (higher fares → better survival)

---

## 🤝 Contributing

This is a portfolio project demonstrating:
- Explainable AI techniques (SHAP, decision trees)
- Full-stack development (React + FastAPI)
- Modern React patterns (custom hooks, error boundaries)
- RESTful API design
- Interactive data visualization (D3.js)
- Natural language interfaces

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 🔗 Links

- **Live Demo**: https://huggingface.co/spaces/bigpixel/titanic
- **Frontend Docs**: [docs/FRONTEND.md](docs/FRONTEND.md)
- **Backend Docs**: [docs/BACKEND.md](docs/BACKEND.md)
- **API Docs**: [docs/API.md](docs/API.md)

---

**Built with ❤️ to showcase XAI, UX design, and full-stack development skills**
