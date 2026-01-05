# sklearn Version Compatibility Issue - tree_.value Format

## Overview

This document describes a **recurring critical bug** related to sklearn version differences in how `DecisionTreeClassifier.tree_.value` returns data. This issue has caused production bugs **twice** (Jan 2 and Jan 4, 2026) and requires ongoing awareness.

---

## The Problem

sklearn's `tree_.value` attribute behaves differently across versions:

- **Some versions** (e.g., local development): Returns **proportions** (values that sum to 1.0)
  - Example: `[0.59, 0.41]` for a node with 59% class 0, 41% class 1

- **Other versions** (e.g., HuggingFace deployment): Returns **counts** (actual sample counts)
  - Example: `[339, 232]` for a node with 339 samples of class 0, 232 of class 1

This inconsistency causes critical display bugs when code assumes one format but encounters the other.

---

## History of Bugs

### Bug #1: January 2, 2026 - Donut Charts Disappeared

**Environment**: Local development (sklearn returning proportions)

**Code at the time**:
```python
# Assumed values were counts
class_0_count = int(value[0])  # int(0.59) → 0 ❌
class_1_count = int(value[1])  # int(0.41) → 0 ❌
```

**Result**:
- All nodes showed `class_0: 0, class_1: 0`
- D3.js pie charts couldn't render with zero values
- All donut charts disappeared from visualization

**Fix**:
```python
# Multiply proportions by samples to get counts
class_0_count = int(value[0] * samples)  # int(0.59 * 571) → 337 ✓
class_1_count = int(value[1] * samples)  # int(0.41 * 571) → 234 ✓
```

**Reference**: `docs/archive/CHANGELOG_JAN02_2026.md`

---

### Bug #2: January 4, 2026 - Survival Rates Showing 5500%

**Environment**: HuggingFace deployment (sklearn returning counts)

**Code at the time** (from Bug #1 fix):
```python
# Assumed values were proportions, multiplied by samples
class_0_count = int(value[0] * samples)  # int(339 * 571) → 193,569 ❌
class_1_count = int(value[1] * samples)  # int(232 * 571) → 132,472 ❌
```

**Result**:
- Node with 100% survival: `probability = 571 / 571 = 1.0` ❌ (should be `232 / 571 = 0.40`)
- Node with 55% survival: `probability = 314.05 / 571 = 55.0` ❌ (should be `0.55`)
- Frontend multiplied by 100 for display: `55.0 * 100 = 5500%`
- Leaf nodes showing absurd percentages like 5500% instead of 55%

**Fix**:
```python
# Auto-detect format by checking if values sum to ~1.0
value_sum = value[0] + value[1]

if abs(value_sum - 1.0) < 0.01:
    # Proportions - multiply by samples
    class_0_count = int(value[0] * samples)
    class_1_count = int(value[1] * samples)
else:
    # Already counts - use directly
    class_0_count = int(value[0])
    class_1_count = int(value[1])
```

**Reference**: CHANGELOG.md, commit `7af0bd7`

---

## Current Solution

### Detection Logic

**File**: `backend/models/decision_tree.py:117-131`

```python
# Get class distribution
value = tree_.value[node_id][0]
samples = int(tree_.n_node_samples[node_id])

# Determine majority class and probability
# Note: sklearn behavior varies by version - value may contain counts or proportions
# Check if values are already counts (sum equals samples) or proportions (sum ~= 1)
value_sum = value[0] + value[1]

if abs(value_sum - 1.0) < 0.01:
    # Values are proportions - multiply by samples to get counts
    class_0_count = int(value[0] * samples)
    class_1_count = int(value[1] * samples)
else:
    # Values are already counts
    class_0_count = int(value[0])
    class_1_count = int(value[1])

predicted_class = 1 if class_1_count > class_0_count else 0
probability = class_1_count / samples if samples > 0 else 0
```

### Why This Works

**For proportions** (sum ≈ 1.0):
- `0.59 + 0.41 = 1.0` → detected as proportions
- Multiply by samples: `int(0.59 * 571)` → `337`
- Probability: `337 / 571 = 0.59` ✓

**For counts** (sum = samples):
- `339 + 232 = 571` → NOT ≈ 1.0, detected as counts
- Use directly: `class_0_count = 339`
- Probability: `232 / 571 = 0.40` ✓

### Edge Cases Handled

1. **Rounding errors in proportions**: Uses `abs(value_sum - 1.0) < 0.01` instead of exact equality
2. **Imbalanced nodes**: Works regardless of class distribution (50/50, 90/10, 100/0)
3. **Small sample sizes**: Detection works even for leaf nodes with few samples

---

## Testing Across Environments

### Local Development
```bash
# Run backend locally
cd backend
uvicorn main:app --reload

# Test tree endpoint
curl -s http://localhost:8000/api/tree | python3 -c "
import sys, json
data = json.load(sys.stdin)
tree = data['tree']
print(f\"Root: class_0={tree['class_0']}, class_1={tree['class_1']}, probability={tree['probability']}\")
# Expected: class_0=339, class_1=232, probability=0.406
"
```

### HuggingFace Deployment
```bash
# After pushing to huggingface remote
git push huggingface main

# Wait for rebuild, then test
curl -s https://bigpixel-titanic.hf.space/api/tree | python3 -c "
import sys, json
data = json.load(sys.stdin)
tree = data['tree']
print(f\"Root: class_0={tree['class_0']}, class_1={tree['class_1']}, probability={tree['probability']}\")
# Expected: Same values as local
"
```

### Visual Verification

1. **Check donut charts render**: All nodes should show pie charts
2. **Check survival rates are reasonable**: Should be between 0-100%, not 500% or 5500%
3. **Check leaf node labels**: Should show percentages like "(73%)", not "(7300%)"

---

## sklearn Version Information

### Local Environment
```bash
python3 -c "import sklearn; print(sklearn.__version__)"
# Example: 1.3.2
```

### HuggingFace Environment
Check `requirements.txt` or HuggingFace build logs for sklearn version.

**Note**: The issue is not tied to specific version numbers but rather to how different distributions/builds of sklearn implement `tree_.value`.

---

## Prevention Checklist

When modifying `backend/models/decision_tree.py`:

- [ ] ✅ Do NOT assume `tree_.value` format
- [ ] ✅ Keep detection logic that handles both proportions and counts
- [ ] ✅ Test locally AND on HuggingFace after changes
- [ ] ✅ Verify donut charts render correctly
- [ ] ✅ Verify survival percentages are 0-100%
- [ ] ✅ Check both high (95%+) and low (5%-) survival nodes

---

## Related Files

### Backend
- `backend/models/decision_tree.py` - Tree structure generation
  - Line 117-131: Detection and conversion logic
  - Line 121: Probability calculation (must use correct counts)

### Frontend
- `frontend/src/components/visualizations/DecisionTreeViz.jsx`
  - Line 527-535: Displays survival rate in tooltips
  - Line 575-595: Displays survival rate in leaf labels
- `frontend/src/components/visualizations/DecisionTreeVizHorizontal.jsx`
  - Line 497-505: Displays survival rate in tooltips
  - Line 540-560: Displays survival rate in leaf labels

**Frontend Impact**: Frontend multiplies probability by 100 for display. If backend probability is wrong (e.g., 55.0 instead of 0.55), frontend shows 5500% instead of 55%.

---

## Future Considerations

### Potential Improvements

1. **Explicit sklearn version pinning**:
   - Pin exact sklearn version in `requirements.txt`
   - Trade-off: Loses security updates, may not work across platforms

2. **Unit tests for both formats**:
   - Mock tree_.value with proportions → verify correct counts
   - Mock tree_.value with counts → verify correct counts
   - Automated detection of regression

3. **Backend validation**:
   - Add assertion that probability is between 0 and 1
   - Log warning if unexpected format detected
   - Return error to frontend if probability > 1

4. **Documentation in code**:
   - Add comments explaining why detection is needed
   - Reference this document in the code

---

## References

- **sklearn DecisionTreeClassifier documentation**: https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html
- **sklearn tree structure**: https://scikit-learn.org/stable/auto_examples/tree/plot_unveil_tree_structure.html
- **CHANGELOG.md**: Full project changelog
- **docs/archive/CHANGELOG_JAN02_2026.md**: Detailed documentation of Bug #1

---

## Conclusion

This is a **critical cross-environment compatibility issue** that has caused production bugs twice. The current solution (auto-detection) is robust and future-proof, but developers must be aware of this issue when modifying tree-related code.

**Key Takeaway**: Never assume the format of `tree_.value` - always use the detection logic to handle both proportions and counts.
