import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * DecisionTreeViz - Interactive D3.js decision tree visualization with donut chart nodes
 *
 * Ported from src/visualizations/decision_tree_viz.py
 *
 * @param {Object} treeData - Tree structure from API
 * @param {Object} passengerValues - Current passenger input {sex, pclass, age, fare}
 * @param {number} width - Container width (default: auto)
 * @param {number} height - Visualization height (default: 700)
 */
function DecisionTreeViz({ treeData, passengerValues, width, height = 700 }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const d3TreeRef = useRef(null) // Store D3 tree layout

  // Helper function: Trace path through tree based on input values
  const tracePath = (node, inputValues) => {
    const path = []
    let current = node

    while (current) {
      path.push(current.id)

      if (current.is_leaf) {
        break
      }

      const feature = current.feature
      const threshold = current.threshold

      if (inputValues[feature] <= threshold) {
        current = current.children ? current.children[0] : null
      } else {
        current = current.children ? current.children[1] : null
      }
    }

    return path
  }

  // Helper function: Get path from root to a specific node (for hover highlighting)
  const getPathToNode = (targetNode) => {
    const path = []
    let current = targetNode

    // Walk up the tree from target to root
    while (current) {
      path.unshift(current.data.id) // Add to beginning of array
      current = current.parent
    }

    return path
  }

  // Helper function: Update tree highlighting based on path
  const updateTreeHighlight = (path) => {
    if (!path || path.length === 0) return

    const finalNodeId = path[path.length - 1]

    // Update pie chart highlighting
    d3.selectAll('.pie-chart')
      .classed('active', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return path.includes(nodeData.data.id)
      })
      .classed('final', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return nodeData.data.id === finalNodeId
      })

    d3.selectAll('.node text')
      .classed('active', d => path.includes(d.data.id))

    d3.selectAll('.link')
      .classed('active', d => path.includes(d.source.data.id) && path.includes(d.target.data.id))
      .classed('survived', d => {
        if (path.includes(d.source.data.id) && path.includes(d.target.data.id)) {
          const finalNode = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeId)
          return finalNode && finalNode.data.predicted_class === 1
        }
        return false
      })
      .classed('died', d => {
        if (path.includes(d.source.data.id) && path.includes(d.target.data.id)) {
          const finalNode = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeId)
          return finalNode && finalNode.data.predicted_class === 0
        }
        return false
      })

    // Update edge labels to match link highlighting
    d3.selectAll('.edge-label')
      .classed('active', d => path.includes(d.source.data.id) && path.includes(d.target.data.id))
  }

  // Initialize tree (runs once when treeData loads)
  useEffect(() => {
    if (!treeData || !containerRef.current) return

    const container = containerRef.current
    const actualWidth = width || container.offsetWidth
    const margin = { top: 20, right: 150, bottom: 20, left: 80 }

    // Clear existing content
    d3.select(containerRef.current).selectAll("svg").remove()
    d3.selectAll(".tree-tooltip").remove()

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", actualWidth)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const tree = d3.tree()
      .size([height - margin.top - margin.bottom, actualWidth - margin.left - margin.right])

    const root = d3.hierarchy(treeData, d => d.children)
    const treeLayout = tree(root)
    d3TreeRef.current = treeLayout

    // Add stroke width scale based on sample counts
    const maxSamples = d3.max(treeLayout.descendants(), d => d.samples)
    const strokeScale = d3.scaleSqrt()
      .domain([0, maxSamples])
      .range([1, 32])

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tree-tooltip tooltip")
      .style("position", "absolute")
      .style("padding", "12px")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("font-size", "13px")
      .style("line-height", "1.5")
      .style("max-width", "250px")
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.3)")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s")

    // Add links
    svg.selectAll(".link")
      .data(treeLayout.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .attr("stroke-width", d => strokeScale(d.target.data.samples))
      .attr("stroke-linecap", "round")
      .attr("stroke-opacity", 0.6)

    // Add edge labels
    svg.selectAll(".edge-label")
      .data(treeLayout.links())
      .enter()
      .append("text")
      .attr("class", "edge-label")
      .attr("x", d => (d.source.y + d.target.y) / 2 + 15)
      .attr("y", d => (d.source.x + d.target.x) / 2)
      .attr("text-anchor", "middle")
      .attr("dy", d => {
        const isLeftChild = d.target.x < d.source.x
        return isLeftChild ? -5 : 12
      })
      .text(d => {
        const isLeftChild = d.source.data.children && d.source.data.children[0] === d.target.data
        return isLeftChild ? (d.source.data.left_label || '') : (d.source.data.right_label || '')
      })

    const nodes = svg.selectAll(".node")
      .data(treeLayout.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)

    // PIE CHART NODES: Show class distribution as pie charts
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)

    // Add pie chart to each node
    nodes.each(function(d) {
      const nodeGroup = d3.select(this)
      const radius = Math.sqrt(d.data.samples) * 2

      // Create arc generator for this node's radius (donut style)
      const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius)

      // Prepare data for pie chart: [died, survived]
      const pieData = pie([
        { label: 'died', value: d.data.class_0, color: '#5b8db8' },  // Blue for died
        { label: 'survived', value: d.data.class_1, color: '#52b788' }  // Green for survived
      ])

      // Create a group for the pie chart
      const pieGroup = nodeGroup.append("g")
        .attr("class", "pie-chart")

      // Append pie slices
      pieGroup.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#888")
        .attr("stroke-width", 1)

      // Add invisible circle for hover target (easier to hover)
      const hoverCircle = nodeGroup.append("circle")
        .attr("r", radius)
        .attr("fill", "transparent")
        .attr("pointer-events", "all")

      // Hover effects on the entire node
      hoverCircle.on("mouseover", function(event) {
        // Scale up the pie chart
        pieGroup.transition()
          .duration(200)
          .attr("transform", "scale(1.25)")

        // Highlight the path from root to this node
        const hoverPath = getPathToNode(d)
        d3.selectAll('.pie-chart')
          .classed('hover-active', function() {
            const nodeData = d3.select(this.parentNode).datum()
            return hoverPath.includes(nodeData.data.id)
          })

        d3.selectAll('.node text')
          .classed('hover-active', function() {
            const nodeData = d3.select(this.parentNode).datum()
            return hoverPath.includes(nodeData.data.id)
          })

        d3.selectAll('.link')
          .classed('hover-active', function() {
            const linkData = d3.select(this).datum()
            return hoverPath.includes(linkData.source.data.id) &&
                   hoverPath.includes(linkData.target.data.id)
          })

        d3.selectAll('.edge-label')
          .classed('hover-active', function() {
            const linkData = d3.select(this).datum()
            return hoverPath.includes(linkData.source.data.id) &&
                   hoverPath.includes(linkData.target.data.id)
          })

        const survivalRate = (d.data.probability * 100).toFixed(1)
        tooltip.transition()
          .duration(200)
          .style("opacity", 1)
        tooltip.html(`
          <strong>${d.data.split_rule}</strong><br/>
          Samples: ${d.data.samples}<br/>
          Died: ${d.data.class_0} | Survived: ${d.data.class_1}<br/>
          Survival Rate: ${survivalRate}%
        `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 28) + "px")
      })
      .on("mouseout", function() {
        // Scale back to normal
        pieGroup.transition()
          .duration(200)
          .attr("transform", "scale(1)")

        // Remove hover highlighting
        d3.selectAll('.pie-chart').classed('hover-active', false)
        d3.selectAll('.node text').classed('hover-active', false)
        d3.selectAll('.link').classed('hover-active', false)
        d3.selectAll('.edge-label').classed('hover-active', false)

        tooltip.transition()
          .duration(500)
          .style("opacity", 0)
      })
    })

    // Labels: leaf nodes on right, internal nodes below
    nodes.append("text")
      .attr("dy", d => {
        const radius = Math.sqrt(d.data.samples) * 2
        // Leaf nodes: center vertically, Internal nodes: below circle
        return d.data.is_leaf ? 5 : radius + 15
      })
      .attr("x", d => {
        const radius = Math.sqrt(d.data.samples) * 2
        // Leaf nodes: to the right, Internal nodes: centered
        return d.data.is_leaf ? radius + 10 : 0
      })
      .attr("text-anchor", d => d.data.is_leaf ? "start" : "middle")
      .text(d => {
        if (d.data.is_leaf) {
          return d.data.predicted_class === 1 ? "✓ Survived" : "✗ Died"
        } else {
          return d.data.feature || ""
        }
      })
      .style("fill", "#fafafa") // White text for all labels

    // Cleanup function
    return () => {
      tooltip.remove()
      d3.selectAll(".tree-tooltip").remove()
    }
  }, [treeData, width, height])

  // Update path highlighting when passengerValues change
  useEffect(() => {
    if (!passengerValues || !treeData || !d3TreeRef.current) return

    const path = tracePath(treeData, passengerValues)
    updateTreeHighlight(path)
  }, [passengerValues, treeData])

  // Handle window resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setContainerWidth(width)
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <>
      <style>{`
        /* PIE CHART STYLES */
        .pie-chart path {
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .pie-chart.active path {
          opacity: 1;
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.3));
        }

        /* Hover highlighting - temporary highlight on hover */
        .pie-chart.hover-active path {
          opacity: 0.85;
          filter: drop-shadow(0 0 4px rgba(255,215,0,0.4));
        }

        .pie-chart.final path {
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
        }

        .pie-chart.final {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .node text {
          font-size: 12px;
          font-weight: 500;
          fill: #fafafa;
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }

        .node text.active {
          opacity: 1;
          font-weight: 700;
          fill: #fafafa;
        }

        /* Hover highlighting for text */
        .node text.hover-active {
          opacity: 0.85;
          fill: #ffd700;
        }

        .link {
          fill: none;
          stroke: #666;
          stroke-linecap: round;
          stroke-opacity: 0.6;
          transition: all 0.3s ease;
        }

        .link.active {
          opacity: 1;
        }

        .link.active.survived {
          stroke: #52b788;
        }

        .link.active.died {
          stroke: #e76f51;
        }

        /* Hover highlighting for links */
        .link.hover-active {
          stroke: #ffd700;
          opacity: 0.8;
        }

        .edge-label {
          font-size: 11px;
          fill: #fafafa;
          font-weight: 600;
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .edge-label.active {
          opacity: 1;
          font-weight: 700;
        }

        .edge-label.hover-active {
          opacity: 0.85;
          fill: #ffd700;
        }
      `}</style>

      <div className="mb-2 text-xs text-gray-400">
        <strong>Edge thickness</strong> represents the number of passengers following that path
      </div>

      <div
        ref={containerRef}
        className="w-full bg-[#0e1117] rounded-lg overflow-visible"
        style={{ height: `${height}px` }}
      />
    </>
  )
}

export default DecisionTreeViz
