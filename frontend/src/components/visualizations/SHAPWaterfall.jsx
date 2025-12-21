import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { SHAP_COLORS } from '../../utils/visualizationStyles'

/**
 * SHAPWaterfall - Alternative waterfall chart with floating bars and connector lines
 *
 * Ported from src/visualizations/shap_viz.py (get_alternative_waterfall_html)
 *
 * Shows how each feature contribution adds to the base value to reach the final prediction.
 * Features are displayed as floating bars positioned at their cumulative value.
 *
 * @param {Array} waterfallData - Array of waterfall data objects
 * @param {number} baseValue - Baseline prediction value
 * @param {number} finalPrediction - Final prediction after all contributions
 * @param {Array<string>} highlightFeatures - Tutorial: features to highlight (e.g., ['sex', 'pclass'])
 * @param {number} height - Chart height (default: 300)
 */
function SHAPWaterfall({ waterfallData, baseValue, finalPrediction, highlightFeatures = null, height = 300 }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(650)

  // Observe container size changes
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        if (width > 0) {
          setContainerWidth(width)
        }
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!waterfallData || waterfallData.length === 0 || !containerRef.current) return

    // Clear existing content
    d3.select(containerRef.current).selectAll("*").remove()

    const margin = { top: 20, right: 60, bottom: 50, left: 100 }
    const chartWidth = containerWidth - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Title with base value and final prediction
    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("fill", SHAP_COLORS.text)
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .text(`Base Value: ${baseValue.toFixed(3)} → Final Prediction: ${finalPrediction.toFixed(3)}`)

    // Create scales - HORIZONTAL orientation
    const y = d3.scaleBand()
      .domain(waterfallData.map((d, i) => i))
      .range([0, chartHeight])
      .padding(0.3)

    const allValues = waterfallData.flatMap(d => [d.start, d.end])
    const xExtent = d3.extent(allValues)
    const x = d3.scaleLinear()
      .domain(xExtent)
      .range([0, chartWidth])
      .nice()

    // Add X axis
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5))

    // Add X axis label
    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 38)
      .attr("fill", SHAP_COLORS.text)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text("Cumulative SHAP")

    // Draw connector lines between bars (horizontal)
    for (let i = 0; i < waterfallData.length - 1; i++) {
      const current = waterfallData[i]
      const next = waterfallData[i + 1]

      svg.append("line")
        .attr("class", "connector-line")
        .attr("x1", x(current.end))
        .attr("y1", y(i) + y.bandwidth())
        .attr("x2", x(next.start))
        .attr("y2", y(i + 1))
    }

    // Draw floating bars (horizontal)
    svg.selectAll(".bar")
      .data(waterfallData)
      .enter()
      .append("rect")
      .attr("class", (d, i) => {
        let className = ""
        if (i === 0) {
          className = "bar-base"
        } else {
          className = d.value >= 0 ? "bar-positive" : "bar-negative"
        }

        // Add tutorial-highlight class if feature is in highlightFeatures
        if (highlightFeatures && highlightFeatures.includes(d.feature)) {
          className += " bar-tutorial-highlight"
        }

        return className
      })
      .attr("y", (d, i) => y(i))
      .attr("x", d => x(Math.min(d.start, d.end)))
      .attr("height", y.bandwidth())
      .attr("width", d => Math.abs(x(d.start) - x(d.end)) || 3)
      .attr("rx", 2)

    // Add value labels on bars (skip base value, smaller font)
    svg.selectAll(".value-label")
      .data(waterfallData.filter((d, i) => i > 0))
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("y", (d, i) => y(i + 1) + y.bandwidth() / 2)
      .attr("x", d => x(d.end) + (d.value >= 0 ? 5 : -5))
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.value >= 0 ? "start" : "end")
      .attr("fill", d => d.value >= 0 ? SHAP_COLORS.positive : SHAP_COLORS.negative)
      .text(d => (d.value >= 0 ? "+" : "") + d.value.toFixed(2))

    // Add Y axis with feature labels
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).tickFormat((d, i) => {
        const item = waterfallData[i]
        if (i === 0) return "Base"
        return item.feature_value !== "" ? `${item.feature}=${item.feature_value}` : item.feature
      }))

  }, [waterfallData, baseValue, finalPrediction, highlightFeatures, containerWidth, height])

  if (!waterfallData || waterfallData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Loading SHAP explanation...
      </div>
    )
  }

  return (
    <>
      <style>{`
        .bar-positive {
          fill: ${SHAP_COLORS.positive};
          stroke: ${SHAP_COLORS.positiveStroke};
          stroke-width: 1.5;
          opacity: 0.8;
          transition: all 0.3s ease;
        }
        .bar-negative {
          fill: ${SHAP_COLORS.negative};
          stroke: ${SHAP_COLORS.negativeStroke};
          stroke-width: 1.5;
          opacity: 0.8;
          transition: all 0.3s ease;
        }
        .bar-base {
          fill: #666;
          stroke: #888;
          stroke-width: 1.5;
        }
        /* Tutorial highlight for SHAP bars */
        .bar-tutorial-highlight {
          stroke: ${SHAP_COLORS.highlight} !important;
          stroke-width: 3 !important;
          opacity: 1 !important;
          filter: drop-shadow(0 0 8px ${SHAP_COLORS.highlightGlow});
        }
        .connector-line {
          stroke: #888;
          stroke-width: 1.5;
          stroke-dasharray: 3,3;
        }
        .axis text {
          fill: ${SHAP_COLORS.text};
          font-size: 10px;
        }
        .axis line, .axis path {
          stroke: #666;
        }
        .value-label {
          fill: ${SHAP_COLORS.text};
          font-size: 9px;
          font-weight: bold;
        }
      `}</style>

      <div className="w-full">
        <h3 className="text-sm font-semibold mb-3 text-gray-200">SHAP Waterfall</h3>
        <div ref={containerRef} className="w-full" />
      </div>
    </>
  )
}

export default SHAPWaterfall
