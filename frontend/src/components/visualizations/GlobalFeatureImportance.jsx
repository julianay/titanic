import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { SHAP_COLORS } from '../../utils/visualizationStyles'
import { UI_COLORS } from '../../utils/uiStyles'

/**
 * GlobalFeatureImportance - Horizontal bar chart showing mean absolute SHAP values
 *
 * Ported from src/visualizations/shap_viz.py (get_feature_importance_html)
 *
 * @param {Array} data - Array of {feature, value} objects sorted by importance
 * @param {number} height - Chart height (default: 300)
 */
function GlobalFeatureImportance({ data, height = 300 }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Measure container width on mount and window resize
  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    if (!data || data.length === 0 || !containerRef.current || containerWidth === 0) return

    // Clear existing content
    d3.select(containerRef.current).selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = containerWidth
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const y = d3.scaleBand()
      .domain(data.map(d => d.feature))
      .range([0, chartHeight])
      .padding(0.2)

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, chartWidth - 50])  // Reserve 50px on right for labels

    // Add bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => y(d.feature))
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.value))

    // Add value labels
    svg.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("y", d => y(d.feature) + y.bandwidth() / 2)
      .attr("x", d => x(d.value) + 5)
      .attr("dy", "0.35em")
      .attr("fill", SHAP_COLORS.text)
      .attr("font-size", "11px")
      .text(d => d.value.toFixed(3))

    // Add Y axis
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y))

    // Add X axis with responsive tick count based on width
    const tickCount = chartWidth < 400 ? 3 : chartWidth < 600 ? 4 : 5
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(tickCount))

    // Add X axis label
    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 40)
      .attr("fill", SHAP_COLORS.text)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text("Mean |SHAP value|")

  }, [data, containerWidth, height])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: UI_COLORS.chartNoData }}>
        Loading global importance...
      </div>
    )
  }

  return (
    <>
      <style>{`
        .bar {
          fill: ${SHAP_COLORS.barDefault};
          opacity: 0.8;
        }
        .bar:hover {
          opacity: 1;
        }
        .axis text {
          fill: ${SHAP_COLORS.text};
          font-size: 12px;
        }
        .axis line, .axis path {
          stroke: #666;
        }
      `}</style>

      <div className="w-full">
        <h3 className="text-sm font-semibold mb-3" style={{ color: UI_COLORS.chartTitle }}>Global Feature Importance</h3>
        <div ref={containerRef} className="w-full" />
      </div>
    </>
  )
}

export default GlobalFeatureImportance
