# Titanic Survival – Explainable AI Demo 🚢

Interactive web applications showcasing **explainable AI techniques** for Titanic passenger survival prediction. This project features two complementary interfaces: a production Streamlit app and a modern React frontend.

---

## 🚀 Quick Start

### Option 1: React Frontend (Modern UI)
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

### Option 2: Streamlit App (Production)
```bash
source venv/bin/activate
streamlit run app.py

# Open http://localhost:8501
```

---

## 📁 Project Structure

```
titanic/
├── frontend/           # React frontend (NEW!)
│   ├── src/
│   │   ├── components/ # Layout, ControlPanel, LoadingSpinner
│   │   ├── hooks/      # usePredict (API integration)
│   │   └── App.jsx
│   └── package.json
├── backend/            # FastAPI backend
│   ├── models/         # Decision Tree & XGBoost
│   ├── routes/         # API endpoints
│   └── main.py
├── app.py              # Streamlit production app
├── src/                # Streamlit modules
└── docs/               # Documentation
    ├── FRONTEND.md     # React frontend guide
    ├── BACKEND.md      # FastAPI backend guide
    └── API.md          # API reference
```

---

## 🎯 Features

### React Frontend (NEW)
- **Real-time predictions** with 500ms debouncing
- **Color-coded results** (green/yellow/red based on survival probability)
- **Smart fare suggestions** that auto-adjust by passenger class
- **Quick presets** for instant testing (4 passenger profiles)
- **Responsive design** (two-column desktop, stacked mobile)
- **In-memory caching** for instant repeat queries
- **Dark theme** matching Streamlit app

### Streamlit App (Production)
- **Interactive tutorial** with tab-aware guidance
- **Decision Tree visualization** with D3.js donut charts
- **XGBoost SHAP** waterfall charts
- **Conversational chat** for exploring cohorts
- **What-If controls** for scenario testing
- **Tab-based model comparison**

### FastAPI Backend
- **Decision Tree** model (simple, interpretable)
- **XGBoost** model (higher accuracy)
- **SHAP explanations** for predictions
- **RESTful API** with interactive docs
- **CORS enabled** for frontend access

---

## 📚 Documentation

- **[Frontend Guide](docs/FRONTEND.md)** - React app setup, components, hooks
- **[Backend Guide](docs/BACKEND.md)** - FastAPI server, models, development
- **[API Reference](docs/API.md)** - Endpoint docs with examples
- **[AI Context](AI_CONTEXT.md)** - Project architecture overview
- **[Progress Log](PROGRESS.md)** - Development history

---

## 🌐 Live Demo

**Streamlit Production App**: https://huggingface.co/spaces/bigpixel/titanic

---

## 🛠️ Tech Stack

### React Frontend
- React 18 + Vite
- Tailwind CSS 3
- Custom hooks (debouncing, caching, retry logic)

### FastAPI Backend
- FastAPI + Uvicorn
- scikit-learn (Decision Tree)
- XGBoost
- SHAP for explainability
- Pydantic for validation

### Streamlit App
- Streamlit
- D3.js visualizations
- Custom CSS styling
- Session state management

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

### Streamlit
```bash
source venv/bin/activate
streamlit run app.py

# App runs at http://localhost:8501
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
- Explainable AI techniques
- Full-stack development
- Modern React patterns
- RESTful API design
- Interactive data visualization

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 🔗 Links

- **Live Streamlit Demo**: https://huggingface.co/spaces/bigpixel/titanic
- **Frontend Docs**: [docs/FRONTEND.md](docs/FRONTEND.md)
- **Backend Docs**: [docs/BACKEND.md](docs/BACKEND.md)
- **API Docs**: [docs/API.md](docs/API.md)

---

**Built with ❤️ to showcase XAI, UX design, and full-stack development skills**
