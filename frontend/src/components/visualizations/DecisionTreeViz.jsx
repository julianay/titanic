import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { TREE_COLORS, TREE_EFFECTS, TREE_OPACITY, TREE_STROKE, TREE_SIZING } from '../../utils/visualizationStyles'

/**
 * DecisionTreeViz - Interactive D3.js decision tree visualization with donut chart nodes
 *
 * Ported from src/visualizations/decision_tree_viz.py
 *
 * @param {Object} treeData - Tree structure from API
 * @param {Object} passengerValues - Current passenger input {sex, pclass, age, fare}
 * @param {number} width - Container width (default: auto)
 * @param {number} height - Visualization height (default: 700)
 * @param {string|number} highlightMode - Controls path highlighting:
 *   - null/"full": highlight full path (default)
 *   - "first_split": highlight only first split
 *   - number (1, 2, 3...): highlight first N levels
 * @param {Object} comparisonData - Comparison data with cohortA and cohortB (optional)
 */
function DecisionTreeViz({ treeData, passengerValues, width, height = 700, highlightMode = null, comparisonData = null }) {
  const svgRef = useRef(null) // Store SVG d3 selection for scoped highlighting
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [treeVersion, setTreeVersion] = useState(0) // Increment when tree is rebuilt
  const d3TreeRef = useRef(null) // Store D3 tree layout
  const zoomRef = useRef(null) // Store zoom behavior
  const svgContainerRef = useRef(null) // Store SVG container for zoom control

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

  // Helper function: Limit path based on highlightMode
  const getLimitedPath = (fullPath) => {
    if (!highlightMode || highlightMode === 'full') {
      return fullPath // Return full path (default behavior)
    }

    if (highlightMode === 'first_split') {
      // Return only root and first child (first split only)
      return fullPath.slice(0, 2)
    }

    if (typeof highlightMode === 'number') {
      // Return first N+1 nodes (N levels means N+1 nodes including root)
      return fullPath.slice(0, highlightMode + 1)
    }

    return fullPath // Fallback to full path
  }

  // Helper function: Update tree highlighting based on path
  const updateTreeHighlight = (path, isTutorialMode = false) => {
    if (!path || path.length === 0) return
    if (!svgRef.current) return

    const svg = svgRef.current
    const finalNodeId = path[path.length - 1]
    const highlightClass = isTutorialMode ? 'tutorial-highlight' : 'active'
    const otherClass = isTutorialMode ? 'active' : 'tutorial-highlight'

    // Update pie chart highlighting
    svg.selectAll('.pie-chart')
      .classed(otherClass, false) // Clear other class
      .classed('path-a', false)    // Clear comparison classes
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

    svg.selectAll('.node text.feature-label')
      .classed(otherClass, false) // Clear other class
      .classed('path-a', false)    // Clear comparison classes
      .classed('path-b', false)
      .classed('path-shared', false)
      .classed(highlightClass, d => path.includes(d.data.id))

    svg.selectAll('.node text.prediction-label')
      .classed(otherClass, false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)
      .classed(highlightClass, d => path.includes(d.data.id))

    svg.selectAll('.link')
      .classed(otherClass, false) // Clear other class
      .classed('path-a', false)    // Clear comparison classes
      .classed('path-b', false)
      .classed('path-shared', false)
      .classed(highlightClass, d => path.includes(d.source.data.id) && path.includes(d.target.data.id))
      .classed('survived', d => {
        // RULE: Always apply survived/died colors based on leaf value, even in tutorial mode
        if (path.includes(d.source.data.id) && path.includes(d.target.data.id)) {
          const finalNode = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeId)
          return finalNode && finalNode.data.predicted_class === 1
        }
        return false
      })
      .classed('died', d => {
        // RULE: Always apply survived/died colors based on leaf value, even in tutorial mode
        if (path.includes(d.source.data.id) && path.includes(d.target.data.id)) {
          const finalNode = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeId)
          return finalNode && finalNode.data.predicted_class === 0
        }
        return false
      })

    // Update edge labels to match link highlighting
    svg.selectAll('.edge-label')
      .classed(otherClass, false) // Clear other class
      .classed('path-a', false)    // Clear comparison classes
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

    // Get final node IDs to determine leaf values
    const finalNodeIdA = pathA[pathA.length - 1]
    const finalNodeIdB = pathB[pathB.length - 1]
    const finalNodeA = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeIdA)
    const finalNodeB = d3TreeRef.current.descendants().find(n => n.data.id === finalNodeIdB)

    // Determine which class each path leads to (0 = died, 1 = survived)
    const pathAClass = finalNodeA ? finalNodeA.data.predicted_class : null
    const pathBClass = finalNodeB ? finalNodeB.data.predicted_class : null

    // Identify shared nodes (in both paths) and unique nodes
    const sharedNodes = pathA.filter(id => pathB.includes(id))
    const uniqueA = pathA.filter(id => !pathB.includes(id))
    const uniqueB = pathB.filter(id => !pathA.includes(id))

    // Clear all existing highlights first
    svg.selectAll('.pie-chart')
      .classed('active', false)
      .classed('tutorial-highlight', false)
      .classed('final', false)
      .classed('path-a', false)
      .classed('path-b', false)
      .classed('path-shared', false)

    svg.selectAll('.node text.feature-label, .node text.prediction-label')
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

    // Highlight shared nodes (white/purple) - nodes in both paths
    svg.selectAll('.pie-chart')
      .classed('path-shared', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return sharedNodes.includes(nodeData.data.id)
      })

    svg.selectAll('.node text.feature-label, .node text.prediction-label')
      .classed('path-shared', d => sharedNodes.includes(d.data.id))

    // Highlight shared links - both source AND target are shared
    svg.selectAll('.link')
      .classed('path-shared', d => sharedNodes.includes(d.source.data.id) && sharedNodes.includes(d.target.data.id))

    svg.selectAll('.edge-label')
      .classed('path-shared', d => sharedNodes.includes(d.source.data.id) && sharedNodes.includes(d.target.data.id))

    // Highlight path A unique nodes - only in path A
    svg.selectAll('.pie-chart')
      .classed('path-a', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return uniqueA.includes(nodeData.data.id)
      })

    svg.selectAll('.node text.feature-label, .node text.prediction-label')
      .classed('path-a', d => uniqueA.includes(d.data.id))

    // RULE: Path A links are colored based on the LEAF VALUE (survived/died), not cohort
    svg.selectAll('.link')
      .classed('path-a', d => {
        const sourceInPath = pathA.includes(d.source.data.id)
        const targetInPath = pathA.includes(d.target.data.id)
        const targetUnique = uniqueA.includes(d.target.data.id)
        return sourceInPath && targetInPath && targetUnique
      })
      .classed('survived', d => {
        const sourceInPath = pathA.includes(d.source.data.id)
        const targetInPath = pathA.includes(d.target.data.id)
        const targetUnique = uniqueA.includes(d.target.data.id)
        // Color path A links as 'survived' if path A leads to survived (class 1)
        return sourceInPath && targetInPath && targetUnique && pathAClass === 1
      })
      .classed('died', d => {
        const sourceInPath = pathA.includes(d.source.data.id)
        const targetInPath = pathA.includes(d.target.data.id)
        const targetUnique = uniqueA.includes(d.target.data.id)
        // Color path A links as 'died' if path A leads to died (class 0)
        return sourceInPath && targetInPath && targetUnique && pathAClass === 0
      })

    svg.selectAll('.edge-label')
      .classed('path-a', d => {
        const sourceInPath = pathA.includes(d.source.data.id)
        const targetInPath = pathA.includes(d.target.data.id)
        const targetUnique = uniqueA.includes(d.target.data.id)
        return sourceInPath && targetInPath && targetUnique
      })

    // Highlight path B unique nodes - only in path B
    svg.selectAll('.pie-chart')
      .classed('path-b', function() {
        const nodeData = d3.select(this.parentNode).datum()
        return uniqueB.includes(nodeData.data.id)
      })

    svg.selectAll('.node text.feature-label, .node text.prediction-label')
      .classed('path-b', d => uniqueB.includes(d.data.id))

    // RULE: Path B links are colored based on the LEAF VALUE (survived/died), not cohort
    svg.selectAll('.link')
      .classed('path-b', d => {
        const sourceInPath = pathB.includes(d.source.data.id)
        const targetInPath = pathB.includes(d.target.data.id)
        const targetUnique = uniqueB.includes(d.target.data.id)
        return sourceInPath && targetInPath && targetUnique
      })
      .classed('survived', d => {
        const sourceInPath = pathB.includes(d.source.data.id)
        const targetInPath = pathB.includes(d.target.data.id)
        const targetUnique = uniqueB.includes(d.target.data.id)
        // Color path B links as 'survived' if path B leads to survived (class 1)
        return sourceInPath && targetInPath && targetUnique && pathBClass === 1
      })
      .classed('died', d => {
        const sourceInPath = pathB.includes(d.source.data.id)
        const targetInPath = pathB.includes(d.target.data.id)
        const targetUnique = uniqueB.includes(d.target.data.id)
        // Color path B links as 'died' if path B leads to died (class 0)
        return sourceInPath && targetInPath && targetUnique && pathBClass === 0
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
    const margin = { top: 40, right: 20, bottom: 80, left: 20 }

    // Clear existing content
    d3.select(containerRef.current).selectAll("svg").remove()
    d3.selectAll(".tree-tooltip").remove()

    // Create SVG container
    const svgContainer = d3.select(containerRef.current)
      .append("svg")
      .attr("width", actualWidth)
      .attr("height", height)

    // Create zoom group (this is what gets transformed by zoom)
    const zoomGroup = svgContainer
      .append("g")
      .attr("class", "zoom-group")

    // Create main group with margins
    const svg = zoomGroup
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])  // Min zoom: 30%, Max zoom: 300%
      .on("zoom", (event) => {
        zoomGroup.attr("transform", event.transform)
      })

    // Apply zoom to SVG
    svgContainer.call(zoom)

    // Store references
    svgRef.current = svg
    zoomRef.current = zoom
    svgContainerRef.current = svgContainer
    setTreeVersion(v => v + 1) // Increment version to trigger highlighting

    const tree = d3.tree()
      .size([actualWidth - margin.left - margin.right, height - margin.top - margin.bottom])

    const root = d3.hierarchy(treeData, d => d.children)
    const treeLayout = tree(root)
    d3TreeRef.current = treeLayout

    // Add stroke width scale based on sample counts
    const maxSamples = d3.max(treeLayout.descendants(), d => d.data.samples)
    const strokeScale = d3.scaleSqrt()
      .domain([0, maxSamples])
      .range([TREE_STROKE.minWidth, TREE_STROKE.maxWidth])

    // Debug: Log stroke width range
    console.log('Tree stroke widths:', {
      maxSamples,
      minWidth: strokeScale(0),
      maxWidth: strokeScale(maxSamples),
      sampleRange: treeLayout.links().map(d => ({
        samples: d.target.data.samples,
        width: strokeScale(d.target.data.samples)
      }))
    })

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tree-tooltip tooltip")
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

    // Add links
    svg.selectAll(".link")
      .data(treeLayout.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .attr("stroke-width", d => strokeScale(d.target.data.samples))
      .attr("stroke-linecap", "round")
      .attr("stroke-opacity", 0.6)

    // Add edge labels
    svg.selectAll(".edge-label")
      .data(treeLayout.links())
      .enter()
      .append("text")
      .attr("class", "edge-label")
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2)
      .attr("text-anchor", "middle")
      .attr("dx", d => {
        const isLeftChild = d.target.x < d.source.x
        return isLeftChild ? -15 : 15
      })
      .attr("dy", -5)
      .text(d => {
        const isLeftChild = d.source.data.children && d.source.data.children[0] === d.target.data
        return isLeftChild ? (d.source.data.left_label || '') : (d.source.data.right_label || '')
      })

    const nodes = svg.selectAll(".node")
      .data(treeLayout.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)

    // PIE CHART NODES: Show class distribution as pie charts
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)

    // Add pie chart to each node
    nodes.each(function(d) {
      const nodeGroup = d3.select(this)
      const radius = Math.sqrt(d.data.samples) * TREE_SIZING.radiusMultiplier

      // Create arc generator for this node's radius (donut style)
      const arc = d3.arc()
        .innerRadius(radius * TREE_SIZING.innerRadiusFraction)
        .outerRadius(radius)

      // Prepare data for pie chart: [died, survived]
      const pieData = pie([
        { label: 'died', value: d.data.class_0, color: TREE_COLORS.died },
        { label: 'survived', value: d.data.class_1, color: TREE_COLORS.survived }
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
        .attr("stroke", TREE_COLORS.nodeStroke)
        .attr("stroke-width", TREE_STROKE.nodeStroke)

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

        d3.selectAll('.node text.feature-label')
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
        d3.selectAll('.node text.feature-label').classed('hover-active', false)
        d3.selectAll('.link').classed('hover-active', false)
        d3.selectAll('.edge-label').classed('hover-active', false)

        tooltip.transition()
          .duration(500)
          .style("opacity", 0)
      })
    })

    // Labels for internal nodes (feature names)
    nodes.append("text")
      .attr("class", "feature-label")
      .attr("dy", d => {
        const radius = Math.sqrt(d.data.samples) * TREE_SIZING.radiusMultiplier
        return -radius - TREE_SIZING.labelOffset.internal
      })
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text(d => d.data.is_leaf ? "" : (d.data.feature || ""))
      .style("fill", TREE_COLORS.textDefault)

    // Labels for leaf nodes (Survived/Died) - shown only when highlighted
    nodes.append("text")
      .attr("class", "prediction-label")
      .attr("dy", d => {
        const radius = Math.sqrt(d.data.samples) * TREE_SIZING.radiusMultiplier
        return radius + TREE_SIZING.labelOffset.leaf
      })
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text(d => {
        if (d.data.is_leaf) {
          return d.data.predicted_class === 1 ? "Survived" : "Died"
        }
        return ""
      })
      .style("fill", TREE_COLORS.textDefault)
      // Opacity controlled by CSS classes only

    // Cleanup function
    return () => {
      tooltip.remove()
      d3.selectAll(".tree-tooltip").remove()
    }
  }, [treeData, width, height])

  // Update path highlighting when passengerValues, highlightMode, comparisonData, or tree initialization changes
  useEffect(() => {
    if (!treeData || !d3TreeRef.current || !svgRef.current || treeVersion === 0) return

    // If comparison mode is active, highlight TWO paths
    if (comparisonData && comparisonData.cohortA && comparisonData.cohortB) {
      const pathA = tracePath(treeData, comparisonData.cohortA)
      const pathB = tracePath(treeData, comparisonData.cohortB)
      updateDualPathHighlight(pathA, pathB)
      return
    }

    // Exiting comparison mode - explicitly clear all comparison classes first
    if (!comparisonData && svgRef.current) {
      const svg = svgRef.current
      svg.selectAll('.pie-chart')
        .classed('path-a', false)
        .classed('path-b', false)
        .classed('path-shared', false)
      svg.selectAll('.node text.feature-label, .node text.prediction-label')
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

    // Otherwise, highlight single path (normal mode)
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
        /* ZOOM STYLES */
        .zoom-group {
          cursor: grab;
        }

        .zoom-group:active {
          cursor: grabbing;
        }

        /* PIE CHART STYLES */
        .pie-chart path {
          opacity: ${TREE_OPACITY.inactive};
          transition: all 0.3s ease;
        }

        .pie-chart.active path {
          opacity: ${TREE_OPACITY.active};
          filter: ${TREE_EFFECTS.active};
        }

        /* Hover highlighting - temporary highlight on hover */
        .pie-chart.hover-active path {
          opacity: ${TREE_OPACITY.hover};
          filter: ${TREE_EFFECTS.hover};
        }

        .pie-chart.final path {
          filter: ${TREE_EFFECTS.final};
        }

        .pie-chart.final {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .node text.feature-label {
          font-size: 12px;
          font-weight: 500;
          fill: ${TREE_COLORS.textDefault};
          opacity: ${TREE_OPACITY.inactive};
          transition: opacity 0.3s ease;
        }

        .node text.feature-label.active {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.textDefault};
        }

        /* Hover highlighting for text */
        .node text.feature-label.hover-active {
          opacity: ${TREE_OPACITY.hover};
          fill: ${TREE_COLORS.hover};
        }

        /* Prediction labels - hidden by default, shown when highlighted */
        .node text.prediction-label {
          font-size: 12px;
          font-weight: 500;
          fill: ${TREE_COLORS.textDefault};
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .node text.prediction-label.active,
        .node text.prediction-label.tutorial-highlight,
        .node text.prediction-label.path-a,
        .node text.prediction-label.path-b,
        .node text.prediction-label.path-shared {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
        }

        .node text.prediction-label.tutorial-highlight {
          fill: ${TREE_COLORS.tutorial};
        }

        .node text.prediction-label.path-a {
          fill: ${TREE_COLORS.comparisonA};
        }

        .node text.prediction-label.path-b {
          fill: ${TREE_COLORS.comparisonB};
        }

        .node text.prediction-label.path-shared {
          fill: ${TREE_COLORS.comparisonShared};
        }

        .link {
          fill: none;
          stroke: ${TREE_COLORS.defaultStroke};
          stroke-linecap: round;
          stroke-opacity: 0.6;
          transition: all 0.3s ease;
        }

        .link.active {
          opacity: ${TREE_OPACITY.active};
        }

        .link.active.survived {
          stroke: ${TREE_COLORS.survived};
        }

        .link.active.died {
          stroke: ${TREE_COLORS.died};
        }

        /* Hover highlighting for links */
        .link.hover-active {
          stroke: ${TREE_COLORS.hover};
          opacity: 0.8;
        }

        .edge-label {
          font-size: 11px;
          fill: ${TREE_COLORS.textDefault};
          font-weight: 600;
          opacity: ${TREE_OPACITY.inactive};
          transition: all 0.3s ease;
        }

        .edge-label.active {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
        }

        .edge-label.hover-active {
          opacity: ${TREE_OPACITY.hover};
          fill: ${TREE_COLORS.hover};
        }

        /* Tutorial/selective highlighting styles */
        .pie-chart.tutorial-highlight path {
          opacity: ${TREE_OPACITY.active};
          filter: ${TREE_EFFECTS.tutorial};
        }

        .link.tutorial-highlight {
          stroke: ${TREE_COLORS.tutorial};
          opacity: ${TREE_OPACITY.active};
          /* Note: stroke-width is not overridden - preserves variable width based on passenger count */
        }

        /* RULE: Leaf value colors override tutorial highlight color */
        .link.tutorial-highlight.survived {
          stroke: ${TREE_COLORS.survived} !important;
        }

        .link.tutorial-highlight.died {
          stroke: ${TREE_COLORS.died} !important;
        }

        .node text.tutorial-highlight {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.tutorial};
        }

        .edge-label.tutorial-highlight {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.tutorial};
        }

        /* Comparison mode - Path A */
        .pie-chart.path-a path {
          opacity: ${TREE_OPACITY.active};
          filter: ${TREE_EFFECTS.comparisonA};
        }

        .link.path-a {
          stroke: ${TREE_COLORS.comparisonA};
          opacity: ${TREE_OPACITY.active};
        }

        /* RULE: Leaf value colors override cohort colors */
        .link.path-a.survived {
          stroke: ${TREE_COLORS.survived} !important;
        }

        .link.path-a.died {
          stroke: ${TREE_COLORS.died} !important;
        }

        .node text.path-a {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.comparisonA};
        }

        .edge-label.path-a {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.comparisonA};
        }

        /* Comparison mode - Path B */
        .pie-chart.path-b path {
          opacity: ${TREE_OPACITY.active};
          filter: ${TREE_EFFECTS.comparisonB};
        }

        .link.path-b {
          stroke: ${TREE_COLORS.comparisonB};
          opacity: ${TREE_OPACITY.active};
        }

        /* RULE: Leaf value colors override cohort colors */
        .link.path-b.survived {
          stroke: ${TREE_COLORS.survived} !important;
        }

        .link.path-b.died {
          stroke: ${TREE_COLORS.died} !important;
        }

        .node text.path-b {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.comparisonB};
        }

        .edge-label.path-b {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.comparisonB};
        }

        /* Comparison mode - Shared path - nodes in both paths */
        .pie-chart.path-shared path {
          opacity: ${TREE_OPACITY.active};
          filter: ${TREE_EFFECTS.comparisonShared};
        }

        .link.path-shared {
          stroke: ${TREE_COLORS.comparisonShared} !important;
          opacity: ${TREE_OPACITY.active} !important;
        }

        .node text.path-shared {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.comparisonShared};
        }

        .edge-label.path-shared {
          opacity: ${TREE_OPACITY.active};
          font-weight: 700;
          fill: ${TREE_COLORS.comparisonShared};
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
        className="w-full rounded-lg overflow-visible"
        style={{ height: `${height}px`, backgroundColor: TREE_COLORS.background }}
      />
    </>
  )
}

export default DecisionTreeViz
