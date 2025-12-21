import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

/**
 * DecisionTreeVizHorizontal - Horizontal (left-to-right) decision tree visualization
 *
 * Same as DecisionTreeViz but with horizontal orientation
 *
 * @param {Object} treeData - Tree structure from API
 * @param {Object} passengerValues - Current passenger input {sex, pclass, age, fare}
 * @param {number} width - Container width (default: auto)
 * @param {number} height - Visualization height (default: 700)
 * @param {string|number} highlightMode - Controls path highlighting
 * @param {Object} comparisonData - Comparison data with cohortA and cohortB (optional)
 */
function DecisionTreeVizHorizontal({ treeData, passengerValues, width, height = 700, highlightMode = null, comparisonData = null }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [treeVersion, setTreeVersion] = useState(0)
  const d3TreeRef = useRef(null)
  const zoomRef = useRef(null)
  const svgContainerRef = useRef(null)

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

    while (current) {
      path.unshift(current.data.id)
      current = current.parent
    }

    return path
  }

  // Helper function: Limit path based on highlightMode
  const getLimitedPath = (fullPath) => {
    if (!highlightMode || highlightMode === 'full') {
      return fullPath
    }

    if (highlightMode === 'first_split') {
      return fullPath.slice(0, 2)
    }

    if (typeof highlightMode === 'number') {
      return fullPath.slice(0, highlightMode + 1)
    }

    return fullPath
  }

  // Helper function: Update tree highlighting based on path
  const updateTreeHighlight = (path, isTutorialMode = false) => {
    if (!path || path.length === 0) return
    if (!svgRef.current) return

    const svg = svgRef.current
    const finalNodeId = path[path.length - 1]
    const highlightClass = isTutorialMode ? 'tutorial-highlight' : 'active'
    const otherClass = isTutorialMode ? 'active' : 'tutorial-highlight'

    svg.selectAll('.pie-chart')
      .classed(otherClass, false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)
      .classed(highlightClass, function() {
        const nodeData = d3.select(this.parentNode).datum()
        return path.includes(nodeData.data.id)
      })
      .classed('final', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return !isTutorialMode && nodeData.data.id === finalNodeId
      })

    svg.selectAll('.node text')
      .classed(otherClass, false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)
      .classed(highlightClass, d => path.includes(d.data.id))

    svg.selectAll('.link')
      .classed(otherClass, false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)
      .classed(highlightClass, d => path.includes(d.source.data.id) && path.includes(d.target.data.id))
      .classed('survived', d => {
        if (!isTutorialMode && path.includes(d.source.data.id) && path.includes(d.target.data.id)) {
          const finalNode = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeId)
          return finalNode && finalNode.data.predicted_class === 1
        }
        return false
      })
      .classed('died', d => {
        if (!isTutorialMode && path.includes(d.source.data.id) && path.includes(d.target.data.id)) {
          const finalNode = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeId)
          return finalNode && finalNode.data.predicted_class === 0
        }
        return false
      })

    svg.selectAll('.edge-label')
      .classed(otherClass, false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)
      .classed(highlightClass, d => path.includes(d.source.data.id) && path.includes(d.target.data.id))
  }

  // Zoom control functions
  const handleZoomIn = () => {
    if (!svgContainerRef.current || !zoomRef.current) return
    svgContainerRef.current.transition().duration(300).call(zoomRef.current.scaleBy, 1.3)
  }

  const handleZoomOut = () => {
    if (!svgContainerRef.current || !zoomRef.current) return
    svgContainerRef.current.transition().duration(300).call(zoomRef.current.scaleBy, 0.77)
  }

  const handleZoomReset = () => {
    if (!svgContainerRef.current || !zoomRef.current) return
    svgContainerRef.current.transition().duration(300).call(zoomRef.current.transform, d3.zoomIdentity)
  }

  // Helper function: Update tree highlighting for TWO paths (comparison mode)
  const updateDualPathHighlight = (pathA, pathB) => {
    if (!pathA || pathA.length === 0 || !pathB || pathB.length === 0) return
    if (!svgRef.current) return

    const svg = svgRef.current

    const sharedNodes = pathA.filter(id => pathB.includes(id))
    const uniqueA = pathA.filter(id => !pathB.includes(id))
    const uniqueB = pathB.filter(id => !pathA.includes(id))

    svg.selectAll('.pie-chart')
      .classed('active', false)
      .classed('tutorial-highlight', false)
      .classed('final', false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)

    svg.selectAll('.node text')
      .classed('active', false)
      .classed('tutorial-highlight', false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)

    svg.selectAll('.link')
      .classed('active', false)
      .classed('tutorial-highlight', false)
      .classed('survived', false)
      .classed('died', false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)

    svg.selectAll('.edge-label')
      .classed('active', false)
      .classed('tutorial-highlight', false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)

    svg.selectAll('.pie-chart')
      .classed('path-shared', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return sharedNodes.includes(nodeData.data.id)
      })

    svg.selectAll('.node text')
      .classed('path-shared', d => sharedNodes.includes(d.data.id))

    svg.selectAll('.link')
      .classed('path-shared', d => sharedNodes.includes(d.source.data.id) && sharedNodes.includes(d.target.data.id))

    svg.selectAll('.edge-label')
      .classed('path-shared', d => sharedNodes.includes(d.source.data.id) && sharedNodes.includes(d.target.data.id))

    svg.selectAll('.pie-chart')
      .classed('path-a', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return uniqueA.includes(nodeData.data.id)
      })

    svg.selectAll('.node text')
      .classed('path-a', d => uniqueA.includes(d.data.id))

    svg.selectAll('.link')
      .classed('path-a', d => {
        const sourceInPath = pathA.includes(d.source.data.id)
        const targetInPath = pathA.includes(d.target.data.id)
        const targetUnique = uniqueA.includes(d.target.data.id)
        return sourceInPath && targetInPath && targetUnique
      })

    svg.selectAll('.edge-label')
      .classed('path-a', d => {
        const sourceInPath = pathA.includes(d.source.data.id)
        const targetInPath = pathA.includes(d.target.data.id)
        const targetUnique = uniqueA.includes(d.target.data.id)
        return sourceInPath && targetInPath && targetUnique
      })

    svg.selectAll('.pie-chart')
      .classed('path-b', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return uniqueB.includes(nodeData.data.id)
      })

    svg.selectAll('.node text')
      .classed('path-b', d => uniqueB.includes(d.data.id))

    svg.selectAll('.link')
      .classed('path-b', d => {
        const sourceInPath = pathB.includes(d.source.data.id)
        const targetInPath = pathB.includes(d.target.data.id)
        const targetUnique = uniqueB.includes(d.target.data.id)
        return sourceInPath && targetInPath && targetUnique
      })

    svg.selectAll('.edge-label')
      .classed('path-b', d => {
        const sourceInPath = pathB.includes(d.source.data.id)
        const targetInPath = pathB.includes(d.target.data.id)
        const targetUnique = uniqueB.includes(d.target.data.id)
        return sourceInPath && targetInPath && targetUnique
      })
  }

  // Initialize tree (runs once when treeData loads)
  useEffect(() => {
    if (!treeData || !containerRef.current) return

    const container = containerRef.current
    const actualWidth = width || container.offsetWidth
    const margin = { top: 20, right: 120, bottom: 20, left: 80 }

    // Clear existing content
    d3.select(containerRef.current).selectAll("svg").remove()
    d3.selectAll(".tree-tooltip").remove()

    // Create SVG container
    const svgContainer = d3.select(containerRef.current)
      .append("svg")
      .attr("width", actualWidth)
      .attr("height", height)

    // Create zoom group
    const zoomGroup = svgContainer
      .append("g")
      .attr("class", "zoom-group")

    // Create main group with margins
    const svg = zoomGroup
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Setup zoom behavior - disable scroll wheel zoom
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .filter(function(event) {
        // Disable zoom on scroll wheel, but allow pan (drag) and programmatic zoom (buttons)
        return !event.type.startsWith('wheel')
      })
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform)
      })

    // Apply zoom to SVG
    svgContainer.call(zoom)

    // Store references
    svgRef.current = svg
    zoomRef.current = zoom
    svgContainerRef.current = svgContainer
    setTreeVersion(v => v + 1)

    // HORIZONTAL LAYOUT: Swap width and height in size
    const tree = d3.tree()
      .size([height - margin.top - margin.bottom, actualWidth - margin.left - margin.right])

    const root = d3.hierarchy(treeData, d => d.children)
    const treeLayout = tree(root)
    d3TreeRef.current = treeLayout

    // Add stroke width scale based on sample counts
    const maxSamples = d3.max(treeLayout.descendants(), d => d.data.samples)
    const strokeScale = d3.scaleSqrt()
      .domain([0, maxSamples])
      .range([2, 20])

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

    // Add links - HORIZONTAL: Use linkHorizontal and swap x/y
    svg.selectAll(".link")
      .data(treeLayout.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)  // Swapped: x uses y coordinate
        .y(d => d.x)) // Swapped: y uses x coordinate
      .attr("stroke-width", d => strokeScale(d.target.data.samples))
      .attr("stroke-linecap", "round")
      .attr("stroke-opacity", 0.6)

    // Add edge labels - HORIZONTAL: Swap x/y positioning
    svg.selectAll(".edge-label")
      .data(treeLayout.links())
      .enter()
      .append("text")
      .attr("class", "edge-label")
      .attr("x", d => (d.source.y + d.target.y) / 2)  // Swapped
      .attr("y", d => (d.source.x + d.target.x) / 2)  // Swapped
      .attr("text-anchor", "middle")
      .attr("dy", d => {
        const isLeftChild = d.target.x < d.source.x  // Check vertical position
        return isLeftChild ? -8 : 15
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
      .attr("transform", d => `translate(${d.y},${d.x})`)  // Swapped: x uses y, y uses x

    // PIE CHART NODES
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)

    nodes.each(function(d) {
      const nodeGroup = d3.select(this)
      const radius = Math.sqrt(d.data.samples) * 2

      const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius)

      const pieData = pie([
        { label: 'died', value: d.data.class_0, color: '#5b8db8' },
        { label: 'survived', value: d.data.class_1, color: '#52b788' }
      ])

      const pieGroup = nodeGroup.append("g")
        .attr("class", "pie-chart")

      pieGroup.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "#888")
        .attr("stroke-width", 1)

      const hoverCircle = nodeGroup.append("circle")
        .attr("r", radius)
        .attr("fill", "transparent")
        .attr("pointer-events", "all")

      hoverCircle.on("mouseover", function(event) {
        pieGroup.transition()
          .duration(200)
          .attr("transform", "scale(1.25)")

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
        pieGroup.transition()
          .duration(200)
          .attr("transform", "scale(1)")

        d3.selectAll('.pie-chart').classed('hover-active', false)
        d3.selectAll('.node text').classed('hover-active', false)
        d3.selectAll('.link').classed('hover-active', false)
        d3.selectAll('.edge-label').classed('hover-active', false)

        tooltip.transition()
          .duration(500)
          .style("opacity", 0)
      })
    })

    // Labels: HORIZONTAL layout - position to the right for leaf nodes, above for internal
    nodes.append("text")
      .attr("dy", d => d.data.is_leaf ? 0 : -Math.sqrt(d.data.samples) * 2 - 8)
      .attr("dx", d => d.data.is_leaf ? Math.sqrt(d.data.samples) * 2 + 10 : 0)
      .attr("text-anchor", d => d.data.is_leaf ? "start" : "middle")
      .text(d => {
        if (d.data.is_leaf) {
          return d.data.predicted_class === 1 ? "✓ Survived" : "✗ Died"
        } else {
          return d.data.feature || ""
        }
      })
      .style("fill", "#fafafa")

    // Cleanup function
    return () => {
      tooltip.remove()
      d3.selectAll(".tree-tooltip").remove()
    }
  }, [treeData, width, height])

  // Update path highlighting
  useEffect(() => {
    if (!treeData || !d3TreeRef.current || !svgRef.current || treeVersion === 0) return

    if (comparisonData && comparisonData.cohortA && comparisonData.cohortB) {
      const pathA = tracePath(treeData, comparisonData.cohortA)
      const pathB = tracePath(treeData, comparisonData.cohortB)
      updateDualPathHighlight(pathA, pathB)
      return
    }

    if (!comparisonData && svgRef.current) {
      const svg = svgRef.current
      svg.selectAll('.pie-chart')
        .classed('path-a', false)
        .classed('path-b', false)
        .classed('path-shared', false)
      svg.selectAll('.node text')
        .classed('path-a', false)
        .classed('path-b', false)
        .classed('path-shared', false)
      svg.selectAll('.link')
        .classed('path-a', false)
        .classed('path-b', false)
        .classed('path-shared', false)
      svg.selectAll('.edge-label')
        .classed('path-a', false)
        .classed('path-b', false)
        .classed('path-shared', false)
    }

    if (!passengerValues) return

    const fullPath = tracePath(treeData, passengerValues)
    const limitedPath = getLimitedPath(fullPath)
    const isTutorialMode = highlightMode && highlightMode !== 'full'

    updateTreeHighlight(limitedPath, isTutorialMode)
  }, [passengerValues, treeData, highlightMode, comparisonData, treeVersion])

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
        .zoom-group {
          cursor: grab;
        }

        .zoom-group:active {
          cursor: grabbing;
        }

        .pie-chart path {
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .pie-chart.active path {
          opacity: 1;
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.3));
        }

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

        .pie-chart.tutorial-highlight path {
          opacity: 1;
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
        }

        .link.tutorial-highlight {
          stroke: #ffd700 !important;
          opacity: 1 !important;
        }

        .node text.tutorial-highlight {
          opacity: 1;
          font-weight: 700;
          fill: #ffd700;
        }

        .edge-label.tutorial-highlight {
          opacity: 1;
          font-weight: 700;
          fill: #ffd700;
        }

        .pie-chart.path-a path {
          opacity: 1;
          filter: drop-shadow(0 0 8px rgba(33, 143, 206, 0.8));
        }

        .link.path-a {
          stroke: #218FCE !important;
          opacity: 1 !important;
        }

        .node text.path-a {
          opacity: 1;
          font-weight: 700;
          fill: #218FCE;
        }

        .edge-label.path-a {
          opacity: 1;
          font-weight: 700;
          fill: #218FCE;
        }

        .pie-chart.path-b path {
          opacity: 1;
          filter: drop-shadow(0 0 8px rgba(255, 127, 80, 0.8));
        }

        .link.path-b {
          stroke: #FF7F50 !important;
          opacity: 1 !important;
        }

        .node text.path-b {
          opacity: 1;
          font-weight: 700;
          fill: #FF7F50;
        }

        .edge-label.path-b {
          opacity: 1;
          font-weight: 700;
          fill: #FF7F50;
        }

        .pie-chart.path-shared path {
          opacity: 1;
          filter: drop-shadow(0 0 8px rgba(200, 200, 255, 0.9));
        }

        .link.path-shared {
          stroke: #c8c8ff !important;
          opacity: 1 !important;
        }

        .node text.path-shared {
          opacity: 1;
          font-weight: 700;
          fill: #c8c8ff;
        }

        .edge-label.path-shared {
          opacity: 1;
          font-weight: 700;
          fill: #c8c8ff;
        }
      `}</style>

      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          <strong>Edge thickness</strong> represents the number of passengers following that path
        </div>

        {/* Zoom controls */}
        <div className="flex gap-2">
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full bg-[#0e1117] rounded-lg overflow-visible"
        style={{ height: `${height}px` }}
      />
    </>
  )
}

export default DecisionTreeVizHorizontal
