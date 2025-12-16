# API Reference

**Titanic XAI FastAPI Endpoints**

Base URL: `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

---

## Endpoints

### Health Check

Check if the API is running.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Titanic XAI API is running"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

### Predict Survival

Get survival prediction for a passenger.

```http
POST /api/predict
```

**Request Body:**
```json
{
  "sex": 0,       // 0 = Female, 1 = Male
  "pclass": 2,    // 1, 2, or 3 (passenger class)
  "age": 30,      // 0-80 years
  "fare": 20      // 0-100 (fare in pounds)
}
```

**Response:**
```json
{
  "prediction": 1,              // 0 = died, 1 = survived
  "probability": 0.92,          // 0.0 to 1.0
  "survival_rate": 91.67        // percentage (0-100)
}
```

**Status Codes:**
- `200 OK` - Prediction successful
- `422 Unprocessable Entity` - Invalid request body

**Example:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "sex": 0,
    "pclass": 1,
    "age": 30,
    "fare": 84
  }'
```

**Response:**
```json
{
  "prediction": 1,
  "probability": 0.98,
  "survival_rate": 98.33
}
```

---

### Get Decision Tree Structure

Get the decision tree structure for visualization.

```http
GET /api/tree
```

**Response:**
```json
{
  "tree_structure": {
    "feature": "sex",
    "threshold": 0.5,
    "left": {...},
    "right": {...},
    "samples": 891,
    "value": [549, 342],
    "class": 0
  }
}
```

**Tree Node Fields:**
- `feature` (string|null) - Feature name for split (null for leaf nodes)
- `threshold` (number|null) - Split threshold (null for leaf nodes)
- `left` (object|null) - Left child node
- `right` (object|null) - Right child node
- `samples` (number) - Number of training samples at this node
- `value` (array) - [died_count, survived_count]
- `class` (number) - Majority class (0 or 1)

**Status Codes:**
- `200 OK` - Tree structure returned successfully

**Example:**
```bash
curl http://localhost:8000/api/tree
```

---

## Data Models

### PassengerInput

```typescript
{
  sex: number      // 0 = Female, 1 = Male (required)
  pclass: number   // 1, 2, or 3 (required)
  age: number      // 0-80 (required)
  fare: number     // 0-100 (required)
}
```

**Validation:**
- All fields are required
- `sex`: Must be 0 or 1
- `pclass`: Must be 1, 2, or 3
- `age`: Must be between 0 and 80
- `fare`: Must be between 0 and 100

### PredictionResponse

```typescript
{
  prediction: number       // 0 or 1
  probability: number      // 0.0 to 1.0
  survival_rate: number    // 0 to 100
}
```

---

## Error Responses

### 422 Unprocessable Entity

Invalid request body or validation error.

**Example:**
```json
{
  "detail": [
    {
      "loc": ["body", "sex"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error

Server error (rare, usually means model loading failed).

**Example:**
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting. Frontend implements client-side debouncing (500ms).

---

## CORS

CORS is enabled for all origins:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: *`
- `Access-Control-Allow-Headers: *`

---

## Testing with cURL

### Health Check
```bash
curl http://localhost:8000/health
```

### Predict - Female, 1st class
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"sex": 0, "pclass": 1, "age": 30, "fare": 84}'
```

### Predict - Male, 3rd class
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"sex": 1, "pclass": 3, "age": 30, "fare": 13}'
```

### Get Tree Structure
```bash
curl http://localhost:8000/api/tree
```

---

## Testing with JavaScript

```javascript
// Predict survival
async function predict(passengerData) {
  const response = await fetch('http://localhost:8000/api/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passengerData)
  })

  const result = await response.json()
  return result
}

// Usage
const result = await predict({
  sex: 0,
  pclass: 1,
  age: 30,
  fare: 84
})

console.log(`Survival rate: ${result.survival_rate}%`)
```

---

## Expected Survival Rates

Based on passenger profiles:

| Profile | Sex | Class | Age | Fare | ~Survival Rate |
|---------|-----|-------|-----|------|---------------|
| 🎭 Women's path | Female | 2nd | 30 | £20 | ~92% |
| 👨 Men's path | Male | 3rd | 30 | £13 | ~14% |
| 👶 1st class child | Female | 1st | 5 | £84 | ~98% |
| ⚓ 3rd class male | Male | 3rd | 40 | £8 | ~7% |

---

## Interactive Documentation

Visit `http://localhost:8000/docs` for:
- Swagger UI with interactive testing
- Request/response examples
- Schema definitions
- Try out endpoints directly in browser

---

## Further Reading

- [Backend Documentation](./BACKEND.md)
- [Frontend Documentation](./FRONTEND.md)
- [Main README](../README.md)
