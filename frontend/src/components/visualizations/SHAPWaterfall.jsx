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
 * @param {Object} passengerData - Passenger data for description (sex, pclass, age, fare)
 * @param {number} height - Chart height (default: 300)
 */
function SHAPWaterfall({ waterfallData, baseValue, finalPrediction, highlightFeatures = null, passengerData = null, height = 300 }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(650)

  // Convert log-odds to survival rate percentage
  const logOddsToPercent = (logOdds) => {
    const probability = 1 / (1 + Math.exp(-logOdds))
    return Math.round(probability * 100)
  }

  // Format passenger description for title
  const formatPassengerDescription = (data) => {
    if (!data) return "SHAP Waterfall"

    const { sex, pclass, age, fare } = data
    const gender = sex === 0 ? "female" : "male"
    const classMap = { 1: "1st", 2: "2nd", 3: "3rd" }
    const passengerClass = classMap[pclass] || pclass

    return `${age}-year-old ${gender} in ${passengerClass} class, £${fare} fare`
  }

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

    // Normalize waterfall data to ensure proper continuity
    // Each bar should start exactly where the previous bar ended
    const normalizedData = []
    for (let i = 0; i < waterfallData.length; i++) {
      if (i === 0) {
        // First bar (Base) - keep as is
        normalizedData.push({ ...waterfallData[i] })
      } else {
        // Subsequent bars - ensure start equals previous normalized end
        const prevEnd = normalizedData[i - 1].end
        normalizedData.push({
          ...waterfallData[i],
          start: prevEnd,
          end: prevEnd + waterfallData[i].value
        })
      }
    }

    // Use normalized data for rendering
    const dataToRender = normalizedData

    const margin = { top: 35, right: 60, bottom: 80, left: 60 }
    const chartWidth = containerWidth - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

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

    // Create scales - VERTICAL orientation (swapped axes)
    const x = d3.scaleBand()
      .domain(dataToRender.map((d, i) => i))
      .range([0, chartWidth])
      .padding(0.3)

    const allValues = dataToRender.flatMap(d => [d.start, d.end])
    const yExtent = d3.extent(allValues)
    const y = d3.scaleLinear()
      .domain(yExtent)
      .range([chartHeight, 0])
      .nice()

    // Add Y axis
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(5))

    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -45)
      .attr("fill", SHAP_COLORS.text)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text("Cumulative SHAP")

    // Draw connector lines between bars (vertical)
    // These connect the end of one bar to the start of the next
    for (let i = 0; i < dataToRender.length - 1; i++) {
      const current = dataToRender[i]
      const next = dataToRender[i + 1]

      svg.append("line")
        .attr("class", "connector-line")
        .attr("x1", x(i) + x.bandwidth())  // Right edge of current bar
        .attr("y1", y(current.end))        // Vertical position of current bar's end value
        .attr("x2", x(i + 1))              // Left edge of next bar
        .attr("y2", y(next.start))         // Vertical position of next bar's start value
    }

    // Draw floating bars (vertical)
    svg.selectAll(".bar")
      .data(dataToRender)
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
      .attr("x", (d, i) => x(i))
      .attr("y", d => {
        // For vertical waterfall: bar spans from d.start to d.end
        // With inverted y-scale, higher values have lower y-coordinates
        // The rect's y attr is the top, so use the smaller y-coordinate
        return Math.min(y(d.start), y(d.end))
      })
      .attr("width", x.bandwidth())
      .attr("height", d => {
        // Height is the absolute difference in y-coordinates
        const height = Math.abs(y(d.start) - y(d.end))
        // Minimum height for visibility (especially for base bar)
        return Math.max(height, 3)
      })
      .attr("rx", 2)

    // Add value labels on bars (skip base value, smaller font)
    // Position labels inside bars when they fit, otherwise outside
    const minHeightForLabel = 18 // Minimum bar height needed to fit label inside

    svg.selectAll(".value-label")
      .data(dataToRender.filter((d, i) => i > 0))
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d, i) => x(i + 1) + x.bandwidth() / 2)
      .attr("y", d => {
        const barHeight = Math.abs(y(d.start) - y(d.end))

        if (barHeight >= minHeightForLabel) {
          // Bar is tall enough - center label inside
          return (y(d.start) + y(d.end)) / 2
        } else {
          // Bar too small - place label outside
          // For positive contributions, place above the bar
          // For negative contributions, place below the bar
          if (d.value >= 0) {
            return y(d.end) - 5
          } else {
            return y(d.end) + 12
          }
        }
      })
      .attr("dy", d => {
        const barHeight = Math.abs(y(d.start) - y(d.end))
        // Only apply vertical centering offset when inside the bar
        return barHeight >= minHeightForLabel ? "0.35em" : "0"
      })
      .attr("text-anchor", "middle")
      .attr("fill", d => {
        const barHeight = Math.abs(y(d.start) - y(d.end))
        // Use black for labels inside bars, colored for labels outside
        if (barHeight >= minHeightForLabel) {
          return "#000000"
        } else {
          return d.value >= 0 ? SHAP_COLORS.positive : SHAP_COLORS.negative
        }
      })
      .text(d => (d.value >= 0 ? "+" : "") + d.value.toFixed(2))

    // Add X axis with feature labels (feature names only, no values)
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat((d, i) => {
        const item = dataToRender[i]
        if (i === 0) return "Base"
        return item.feature
      }))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.5em")

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
          font-size: 9px;
          font-weight: bold;
        }
      `}</style>

      <div className="w-full">
        <h3 className="text-sm font-semibold mb-3 text-gray-200">{formatPassengerDescription(passengerData)}</h3>
        <div ref={containerRef} className="w-full" />
        <p className="text-xs text-gray-400 mt-2 text-center">Values shown in log-odds; survival rates in parentheses</p>
      </div>
    </>
  )
}

export default SHAPWaterfall
