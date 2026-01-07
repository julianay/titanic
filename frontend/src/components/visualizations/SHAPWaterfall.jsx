import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { SHAP_COLORS, TREE_COLORS } from '../../utils/visualizationStyles'
import { UI_COLORS } from '../../utils/uiStyles'

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
function SHAPWaterfall({ waterfallData, baseValue, finalPrediction, highlightFeatures = null, passengerData = null, height = 250 }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(650)
  const tooltipIdRef = useRef(`shap-tooltip-${Math.random().toString(36).substr(2, 9)}`)

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

    // Clear existing content and this component's tooltip
    d3.select(containerRef.current).selectAll("*").remove()
    d3.select(`#${tooltipIdRef.current}`).remove()

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

    const margin = { top: 35, right: 110, bottom: 80, left: 60 }
    const chartWidth = containerWidth - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", height)

    // Define arrow markers for positive (up) and negative (down) changes
    const defs = svg.append("defs")

    // Up arrow for positive changes
    defs.append("marker")
      .attr("id", "arrow-up")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 2 7 L 5 2 L 8 7 Z")
      .attr("fill", SHAP_COLORS.positive)

    // Down arrow for negative changes
    defs.append("marker")
      .attr("id", "arrow-down")
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 2 3 L 5 8 L 8 3 Z")
      .attr("fill", SHAP_COLORS.negative)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Use 'g' instead of 'svg' for all subsequent elements
    const chart = g

    // Create tooltip (matching decision tree styles)
    const tooltip = d3.select("body")
      .append("div")
      .attr("id", tooltipIdRef.current)
      .attr("class", "shap-tooltip tooltip")
      .style("position", "absolute")
      .style("padding", "12px")
      .style("background", TREE_COLORS.tooltipBg)
      .style("color", TREE_COLORS.tooltipText)
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("font-size", "13px")
      .style("line-height", "1.5")
      .style("max-width", "250px")
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.3)")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s")
      .style("z-index", "1000")

    // Calculate survival percentages for labels
    const finalPercent = logOddsToPercent(finalPrediction)

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
    chart.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(5))

    // Add Y axis label
    chart.append("text")
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

      chart.append("line")
        .attr("class", "connector-line")
        .attr("x1", x(i) + x.bandwidth())  // Right edge of current bar
        .attr("y1", y(current.end))        // Vertical position of current bar's end value
        .attr("x2", x(i + 1))              // Left edge of next bar
        .attr("y2", y(next.start))         // Vertical position of next bar's start value
    }

    // Draw floating bars (vertical)
    chart.selectAll(".bar")
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
      .on("mouseover", function(event, d) {
        // Show tooltip
        tooltip.style("opacity", 1)
        // Highlight bar slightly
        d3.select(this).style("opacity", 1)
      })
      .on("mousemove", function(event, d) {
        // Calculate survival rate at this cumulative value
        const survivalRate = logOddsToPercent(d.end)
        const impactDirection = d.value >= 0 ? "survival" : "death"
        const impactColor = d.value >= 0 ? SHAP_COLORS.positive : SHAP_COLORS.negative

        // Format tooltip content
        let tooltipContent = `<strong>${d.feature}</strong><br/>`

        // Skip detailed info for base value
        if (d.feature !== "Base") {
          tooltipContent += `Contribution: <span style="color: ${impactColor}; font-weight: bold;">${d.value >= 0 ? '+' : ''}${d.value.toFixed(3)}</span><br/>`
          tooltipContent += `Direction: Pushes toward <strong>${impactDirection}</strong><br/>`
          tooltipContent += `Cumulative SHAP: ${d.end.toFixed(3)}<br/>`
        } else {
          tooltipContent += `Value: ${d.start.toFixed(3)}<br/>`
        }

        tooltipContent += `<strong>Survival Rate: ${survivalRate}%</strong>`

        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 15) + "px")
      })
      .on("mouseout", function() {
        // Hide tooltip
        tooltip.style("opacity", 0)
        // Reset bar opacity
        d3.select(this).style("opacity", null)
      })

    // Add vertical lines to bars (skip base bar)
    // Lines extend the full height of each bar
    chart.selectAll(".bar-line")
      .data(dataToRender.filter((d, i) => i > 0))
      .enter()
      .append("line")
      .attr("class", "bar-line")
      .attr("x1", (d, i) => x(i + 1) + x.bandwidth() / 2)
      .attr("x2", (d, i) => x(i + 1) + x.bandwidth() / 2)
      .attr("y1", d => y(d.start))
      .attr("y2", d => y(d.end))
      .attr("stroke", d => d.value >= 0 ? SHAP_COLORS.positiveStroke : SHAP_COLORS.negativeStroke)
      .attr("stroke-width", 2)
      .attr("opacity", 0.5)
      .style("pointer-events", "none")

    // Add arrows to bars (skip base bar)
    // Up arrow for positive values, down arrow for negative values
    const arrowSize = 8
    chart.selectAll(".bar-arrow")
      .data(dataToRender.filter((d, i) => i > 0))
      .enter()
      .append("path")
      .attr("class", "bar-arrow")
      .attr("d", d => {
        // Create triangle path: up for positive, down for negative
        if (d.value >= 0) {
          // Up arrow (pointing up)
          return `M 0 ${arrowSize} L ${arrowSize/2} 0 L ${arrowSize} ${arrowSize} Z`
        } else {
          // Down arrow (pointing down)
          return `M 0 0 L ${arrowSize/2} ${arrowSize} L ${arrowSize} 0 Z`
        }
      })
      .attr("transform", (d, i) => {
        const barX = x(i + 1) + x.bandwidth() / 2 - arrowSize / 2
        let arrowY

        if (d.value >= 0) {
          // Position inside the bar at the top
          arrowY = y(d.end) + 5
        } else {
          // Position inside the bar at the bottom
          arrowY = y(d.end) - arrowSize - 5
        }

        return `translate(${barX}, ${arrowY})`
      })
      .attr("fill", d => d.value >= 0 ? SHAP_COLORS.positiveStroke : SHAP_COLORS.negativeStroke)
      .attr("opacity", 0.5)
      .style("pointer-events", "none")

    // Add value labels on bars (skip base value, smaller font)
    // Position labels inside bars when they fit, otherwise outside
    const minHeightForLabel = 18 // Minimum bar height needed to fit label inside

    chart.selectAll(".value-label")
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
      .style("pointer-events", "none")

    // Add final prediction line and label on the right side
    const finalLineX = x(dataToRender.length - 1) + x.bandwidth() + 10
    const finalLineEndX = finalLineX + 40
    const finalLineY = y(finalPrediction)

    // Draw the final prediction line
    chart.append("line")
      .attr("class", "final-prediction-line")
      .attr("x1", x(dataToRender.length - 1) + x.bandwidth())
      .attr("y1", finalLineY)
      .attr("x2", finalLineEndX)
      .attr("y2", finalLineY)
      .attr("stroke", SHAP_COLORS.text)
      .attr("stroke-width", 2)

    // Add label for SHAP value
    chart.append("text")
      .attr("class", "final-prediction-label")
      .attr("x", finalLineEndX + 5)
      .attr("y", finalLineY - 5)
      .attr("text-anchor", "start")
      .attr("fill", SHAP_COLORS.text)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(`${finalPrediction.toFixed(3)}`)

    // Add label for survival rate
    chart.append("text")
      .attr("class", "final-prediction-percent")
      .attr("x", finalLineEndX + 5)
      .attr("y", finalLineY + 10)
      .attr("text-anchor", "start")
      .attr("fill", SHAP_COLORS.text)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(`${finalPercent}%`)

    // Add label for survived/died status
    const outcomeLabel = finalPercent >= 50 ? "Survived" : "Died"
    chart.append("text")
      .attr("class", "final-prediction-outcome")
      .attr("x", finalLineEndX + 5)
      .attr("y", finalLineY + 22)
      .attr("text-anchor", "start")
      .attr("fill", SHAP_COLORS.text)
      .attr("font-size", "9px")
      .text(outcomeLabel)

    // Add X axis with feature labels (feature names only, no values)
    chart.append("g")
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

    // Cleanup function to remove this component's tooltip on unmount
    return () => {
      d3.select(`#${tooltipIdRef.current}`).remove()
    }
  }, [waterfallData, baseValue, finalPrediction, highlightFeatures, containerWidth, height])

  if (!waterfallData || waterfallData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: UI_COLORS.chartNoData }}>
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
        <h3 className="text-sm mb-0" style={{ color: UI_COLORS.chartTitle }}>
          {passengerData && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block mr-2" style={{ color: UI_COLORS.chartTitle }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          )}
          {formatPassengerDescription(passengerData)}
          {' — '}
          {logOddsToPercent(finalPrediction) >= 50 ? 'Survived' : 'Died'}{' '}
          (<span style={{ fontWeight: 'bold' }}>{logOddsToPercent(finalPrediction)}%</span>)
        </h3>
        <div ref={containerRef} className="w-full" />
      </div>
    </>
  )
}

export default SHAPWaterfall
