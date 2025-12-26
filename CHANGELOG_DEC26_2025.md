# Changelog - December 26, 2025

## SHAP Waterfall Enhancements - Survival Rate Display

### Overview
Enhanced the SHAP Waterfall chart to show survival rate percentages alongside log-odds values, making the predictions more interpretable for users while maintaining technical accuracy.

### Problem
Users seeing the SHAP waterfall chart would see values like "Base Value: -0.386 → Final Prediction: 4.477" without understanding what these log-odds values meant in terms of actual survival probability. This created a gap between the technical explanation (SHAP in log-odds space) and user understanding (survival rates).

### Solution
Added survival rate percentages in parentheses next to log-odds values and explanatory text at the bottom of the chart.

---

## Changes

### 1. Added Sigmoid Conversion Function

**File**: `frontend/src/components/visualizations/SHAPWaterfall.jsx`

**Lines Added**: 24-28

```javascript
// Convert log-odds to survival rate percentage
const logOddsToPercent = (logOdds) => {
  const probability = 1 / (1 + Math.exp(-logOdds))
  return Math.round(probability * 100)
}
```

**Purpose**: Converts log-odds values to survival rate percentages using the sigmoid function.

**Formula**: `probability = 1 / (1 + e^(-log_odds))`

---

### 2. Updated Chart Title with Survival Rates

**File**: `frontend/src/components/visualizations/SHAPWaterfall.jsx`

**Lines Modified**: 100-110

**Before**:
```javascript
.text(`Base Value: ${baseValue.toFixed(3)} → Final Prediction: ${finalPrediction.toFixed(3)}`)
```

**After**:
```javascript
// Title with base value and final prediction (with survival rates)
const basePercent = logOddsToPercent(baseValue)
const finalPercent = logOddsToPercent(finalPrediction)
svg.append("text")
  .attr("x", chartWidth / 2)
  .attr("y", -15)
  .attr("text-anchor", "middle")
  .attr("fill", SHAP_COLORS.text)
  .attr("font-size", "11px")
  .attr("font-weight", "bold")
  .text(`Base Value: ${baseValue.toFixed(3)} (${basePercent}%) → Final Prediction: ${finalPrediction.toFixed(3)} (${finalPercent}%)`)
```

**Example Display**:
- Before: "Base Value: -0.386 → Final Prediction: 4.477"
- After: "Base Value: -0.386 (40%) → Final Prediction: 4.477 (99%)"

**Impact**: Users can immediately see the prediction journey in both technical (log-odds) and practical (survival rate) terms.

---

### 3. Added Explanatory Text

**File**: `frontend/src/components/visualizations/SHAPWaterfall.jsx`

**Line Added**: 309

**Change**:
```javascript
<div className="w-full">
  <h3 className="text-sm font-semibold mb-3 text-gray-200">{formatPassengerDescription(passengerData)}</h3>
  <div ref={containerRef} className="w-full" />
  <p className="text-xs text-gray-400 mt-2 text-center">Values shown in log-odds; survival rates in parentheses</p>
</div>
```

**Purpose**: Provides educational context about what the values mean, helping users understand the relationship between log-odds and survival rates.

---

## Technical Details

### Why SHAP Uses Log-Odds

SHAP values must be **additive**:
```
Final Prediction = Base Value + Sum of SHAP Values
```

This property only holds in log-odds space:
- ✅ Log-odds: -0.386 + 4.863 = 4.477 (mathematically correct)
- ❌ Probability: 0.405 + ??? ≠ 0.989 (can't just add probabilities)

### Conversion Examples

| Log-Odds | Survival Rate |
|----------|---------------|
| -0.386 | 40% |
| 0.000 | 50% |
| 1.000 | 73% |
| 4.477 | 99% |

### Mathematical Relationship

The sigmoid function converts log-odds to probabilities:
- **Log-odds = 0**: Equal chance (50%)
- **Log-odds > 0**: More likely to survive
- **Log-odds < 0**: More likely to die
- **Larger magnitude**: Stronger prediction confidence

---

## Related Documentation

### New Documentation Created

**File**: `docs/PREDICTIONS.md`

**Purpose**: Comprehensive documentation explaining:
- How Decision Tree predictions work (direct probabilities)
- How XGBoost predictions work (log-odds → sigmoid → probabilities)
- How SHAP values relate to predictions (additive in log-odds space)
- Mathematical conversions between log-odds and survival rates
- Display formats across different components
- Complete worked examples

**Sections**:
1. Decision Tree Predictions
2. XGBoost Predictions
3. SHAP Values and Explanations
4. Mathematical Conversions
5. Display Formats
6. Complete Example

**Key Content**:
- Code references with file paths and line numbers
- Conversion tables and formulas
- Visual representation of waterfall logic
- Comparison of both models' prediction mechanisms

---

## User Impact

### Before
- Users saw technical log-odds values (-0.386, 4.477) without context
- Required understanding of sigmoid functions to interpret
- Gap between technical accuracy and user understanding

### After
- Users see both log-odds and survival rates: "-0.386 (40%)"
- Immediate understanding: "Started at 40% average, ended at 99%"
- Educational text explains the relationship
- Technical accuracy maintained while improving accessibility

### Example User Journey

**Viewing SHAP explanation for a passenger**:

1. **Chart Title Shows**:
   ```
   Base Value: -0.386 (40%) → Final Prediction: 4.477 (99%)
   ```

2. **User Understands**:
   - Population average: 40% survival
   - This specific passenger: 99% survival
   - SHAP contributions: +59 percentage points

3. **Bottom Text Explains**:
   ```
   Values shown in log-odds; survival rates in parentheses
   ```

4. **Result**: User learns both the technical mechanism (log-odds) and the practical outcome (survival rate)

---

## Testing

### Verification Steps

1. **Visual Check**:
   - Navigate to app and make a prediction
   - Verify SHAP waterfall shows percentages in title
   - Verify bottom text appears correctly

2. **Mathematical Verification**:
   - Check that percentages match sigmoid transformation
   - Example: log-odds -0.386 → sigmoid → 0.405 → 40% ✓

3. **Edge Cases**:
   - Very high log-odds (e.g., 5.0 → 99%)
   - Very low log-odds (e.g., -5.0 → 1%)
   - Zero log-odds (0.0 → 50%)

### Browser Testing
- Chrome: ✓
- Firefox: ✓
- Safari: ✓
- Mobile responsive: ✓

---

## Design Decisions

### Why Option 1 (Inline Percentages)

**Considered Options**:
1. **Inline**: "Base Value: -0.386 (40%) → Final Prediction: 4.477 (99%)"
2. **Two-line**: Show log-odds on one line, percentages on separate line
3. **With labels**: "Base: -0.386 (40% survival) → Final: 4.477 (99% survival)"

**Chose Option 1 Because**:
- Most concise while remaining clear
- Keeps related information together
- Doesn't add vertical space to already dense visualization
- Parentheses clearly indicate supplementary information

### Why Simple Explanation Text

**Considered Options**:
- Simple: "Values shown in log-odds; survival rates in parentheses"
- Educational: "XGBoost outputs predictions in log-odds space, which are converted to survival probabilities for interpretability"
- Detailed: "SHAP values are additive in log-odds space. Final values are converted to survival rates using sigmoid transformation"

**Chose Simple Because**:
- Not overwhelming for casual users
- Sufficient for those who want to learn more (can read PREDICTIONS.md)
- Keeps focus on the chart itself
- Users who understand log-odds don't need extensive explanation
- Users who don't understand can see the percentages directly

---

## Files Modified

### Frontend
- `frontend/src/components/visualizations/SHAPWaterfall.jsx`
  - Added `logOddsToPercent()` function (lines 24-28)
  - Updated chart title with survival rates (lines 100-110)
  - Added explanatory text (line 309)

### Documentation
- `docs/PREDICTIONS.md` (new file)
  - Complete explanation of prediction mechanisms
  - Mathematical formulas and conversions
  - Code references and examples

---

## Future Considerations

### Potential Enhancements

1. **Interactive Tooltip**:
   - Hover over log-odds value to see detailed conversion
   - Show formula: "1/(1 + e^(-x))"

2. **Toggle View**:
   - Button to switch between log-odds and probability scales
   - Especially useful for technical vs non-technical audiences

3. **Color Coding**:
   - Different colors for different survival rate ranges
   - Green (>70%), Yellow (40-70%), Red (<40%)

4. **Animation**:
   - Animate the conversion from base to final
   - Show percentages updating as SHAP values are added

### Educational Features

1. **Tutorial Mode**:
   - Highlight the sigmoid conversion
   - Explain additivity in log-odds space

2. **Comparison View**:
   - Show same prediction in both spaces side-by-side
   - Help users build intuition

---

## Conclusion

This enhancement bridges the gap between technical accuracy and user understanding. By showing both log-odds (for SHAP additivity) and survival rates (for intuitive interpretation), users can learn about the underlying mechanics while immediately understanding the practical implications of the prediction.

The change maintains all technical correctness while significantly improving accessibility and educational value.
