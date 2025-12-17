# Titanic XAI Demo - React Frontend

This is the React frontend for the Titanic XAI (Explainable AI) demonstration application. It connects to the FastAPI backend to provide an interactive user interface for exploring Titanic survival predictions with explainability features.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript** - Programming language (not TypeScript for simplicity)

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   ├── index.css         # Global styles with Tailwind directives
│   └── components/       # React components (add your components here)
├── public/               # Static assets
├── .env                  # Environment variables
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)
- **Backend server running** on http://localhost:8000

## Installation

Install all dependencies:

```bash
npm install
```

## Configuration

The `.env` file contains the API endpoint configuration:

```
VITE_API_URL=http://localhost:8000
```

You can access this in your code using `import.meta.env.VITE_API_URL`.

## Development

Start the development server:

```bash
npm run dev
```

**What to expect:**

- The dev server will start on **http://localhost:5173**
- Open this URL in your browser
- **Hot Module Replacement (HMR)** is enabled - changes to your code will automatically reflect in the browser without a full page reload
- The terminal will display any compilation errors or warnings

## API Proxy

The Vite dev server is configured to proxy API requests to the backend:

- Requests to `/api/*` will be forwarded to `http://localhost:8000/api/*`
- This avoids CORS issues during development
- CORS is also enabled in the Vite config for direct API calls

## Dark Theme

The app uses a dark theme matching the backend Streamlit interface:

- **Background**: `#0e1117`
- **Text**: `#fafafa`
- **Base font size**: `14px`
- **H1 font size**: `24px`
- **H3 font size**: `20px`

These styles are defined in `src/index.css`.

## Build for Production

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist/` folder.

Preview the production build locally:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

## Next Steps

1. Ensure your FastAPI backend is running on port 8000
2. Start building your React components in `src/components/`
3. Connect to the backend API using `fetch` or a library like `axios`
4. Implement the UI for passenger data input and survival predictions
5. Display SHAP explanations and visualizations

## Troubleshooting

**Port 5173 already in use:**
- Change the port in `vite.config.js` under `server.port`

**Cannot connect to backend:**
- Verify the backend is running on http://localhost:8000
- Check the `.env` file has the correct `VITE_API_URL`
- Ensure CORS is properly configured in the backend

**Tailwind styles not applying:**
- Make sure `index.css` has the Tailwind directives (`@tailwind base`, etc.)
- Verify `tailwind.config.js` content paths include your source files

## Learn More

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
