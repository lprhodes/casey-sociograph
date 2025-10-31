import { useEffect, useRef, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  processGraphData,
  detectCommunities,
  generateColorPalette,
  calculateCircularLayout,
  calculateHierarchicalLayout,
  calculateNodeSize
} from '../utils';

export default function Sociogram({ data }) {
  const graphRef = useRef();
  const [layoutMode, setLayoutMode] = useState('force');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // Process graph data and detect communities
  const processedData = useMemo(() => {
    const { nodes, links } = processGraphData(data);
    const communities = detectCommunities(nodes, links);
    const numCommunities = new Set(communities.values()).size;
    const colors = generateColorPalette(numCommunities);

    // Assign colors to nodes
    const nodesWithColors = nodes.map(node => ({
      ...node,
      community: communities.get(node.id) || 0,
      color: colors[communities.get(node.id) || 0]
    }));

    return { nodes: nodesWithColors, links, colors };
  }, [data]);

  // Filter nodes based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return processedData;

    const searchLower = searchTerm.toLowerCase();
    const filteredNodes = processedData.nodes.filter(node =>
      node.name.toLowerCase().includes(searchLower)
    );
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = processedData.links.filter(
      link => filteredNodeIds.has(link.source.id || link.source) && filteredNodeIds.has(link.target.id || link.target)
    );

    return { ...processedData, nodes: filteredNodes, links: filteredLinks };
  }, [processedData, searchTerm]);

  // Apply layout when mode changes
  useEffect(() => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    const nodes = filteredData.nodes;

    if (layoutMode === 'circular') {
      const positions = calculateCircularLayout(nodes, 800, 800);
      positions.forEach(pos => {
        const node = nodes.find(n => n.id === pos.id);
        if (node) {
          node.fx = pos.x;
          node.fy = pos.y;
        }
      });
      graph.d3ReheatSimulation();
      // Zoom to fit after layout is applied
      setTimeout(() => {
        graph.zoomToFit(400, 50);
      }, 100);
    } else if (layoutMode === 'hierarchical') {
      const communities = new Map(nodes.map(n => [n.id, n.community]));
      const positions = calculateHierarchicalLayout(nodes, filteredData.links, communities, 800, 800);
      positions.forEach(pos => {
        const node = nodes.find(n => n.id === pos.id);
        if (node) {
          node.fx = pos.x;
          node.fy = pos.y;
        }
      });
      graph.d3ReheatSimulation();
      // Zoom to fit after layout is applied
      setTimeout(() => {
        graph.zoomToFit(400, 50);
      }, 100);
    } else {
      // Force layout - unfix nodes
      nodes.forEach(node => {
        node.fx = undefined;
        node.fy = undefined;
      });
      graph.d3ReheatSimulation();
      // Zoom to fit after layout is applied
      setTimeout(() => {
        graph.zoomToFit(400, 50);
      }, 100);
    }
  }, [layoutMode, filteredData]);

  // Set graph data
  useEffect(() => {
    setGraphData(filteredData);
  }, [filteredData]);

  // Handle node click
  const handleNodeClick = (node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
  };

  // Get connected nodes
  const getConnectedNodes = (nodeId) => {
    const connected = new Set();
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      if (sourceId === nodeId) connected.add(targetId);
      if (targetId === nodeId) connected.add(sourceId);
    });
    return connected;
  };

  // Custom node rendering
  const nodeCanvasObject = (node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    const nodeSize = calculateNodeSize(node.connections);

    // Determine node appearance
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    const isConnected = selectedNode && getConnectedNodes(selectedNode).has(node.id);
    const isHighlighted = isSelected || isHovered || isConnected;
    const isDimmed = (selectedNode || hoveredNode) && !isHighlighted;

    // Draw node
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = isDimmed ? `${node.color}40` : node.color;
    ctx.fill();

    // Draw border
    if (isHighlighted) {
      ctx.strokeStyle = isSelected ? '#fff' : node.color;
      ctx.lineWidth = (isSelected ? 3 : 2) / globalScale;
      ctx.stroke();
    }

    // Draw label
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isDimmed ? '#ffffff80' : '#ffffff';
    ctx.fillText(label, node.x, node.y + nodeSize + fontSize);
  };

  // Custom link rendering
  const linkCanvasObjectMode = () => 'after';
  const linkCanvasObject = (link, ctx, globalScale) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    const isConnectedToSelected =
      selectedNode && (sourceId === selectedNode || targetId === selectedNode);
    const isConnectedToHovered =
      hoveredNode && (sourceId === hoveredNode || targetId === hoveredNode);
    const isHighlighted = isConnectedToSelected || isConnectedToHovered;
    const isDimmed = (selectedNode || hoveredNode) && !isHighlighted;

    // Get positions
    const source = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
    const target = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);

    if (!source || !target) return;

    // Draw link
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);

    if (link.isMutual) {
      // Mutual connection - thicker, different color
      ctx.strokeStyle = isDimmed ? '#f5901040' : '#f59010';
      ctx.lineWidth = (isHighlighted ? 3 : 2) / globalScale;
    } else {
      // Regular directed connection
      ctx.strokeStyle = isDimmed ? '#ffffff20' : '#ffffff60';
      ctx.lineWidth = (isHighlighted ? 2.5 : 1.5) / globalScale;
    }

    ctx.stroke();

    // Draw arrow
    if (!link.isMutual) {
      const arrowLength = 8 / globalScale;
      const arrowWidth = 4 / globalScale;
      const angle = Math.atan2(target.y - source.y, target.x - source.x);
      const nodeSize = calculateNodeSize(target.connections);

      const arrowX = target.x - Math.cos(angle) * nodeSize;
      const arrowY = target.y - Math.sin(angle) * nodeSize;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle),
        arrowY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle)
      );
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle),
        arrowY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle)
      );
      ctx.closePath();
      ctx.fillStyle = isDimmed ? '#ffffff20' : '#ffffff60';
      ctx.fill();
    }
  };

  return (
    <div className="sociogram-container">
      {/* Controls */}
      <div className="controls">
        <div className="layout-tabs">
          <button
            className={layoutMode === 'force' ? 'active' : ''}
            onClick={() => setLayoutMode('force')}
          >
            Force-Directed
          </button>
          <button
            className={layoutMode === 'circular' ? 'active' : ''}
            onClick={() => setLayoutMode('circular')}
          >
            Circular
          </button>
          <button
            className={layoutMode === 'hierarchical' ? 'active' : ''}
            onClick={() => setLayoutMode('hierarchical')}
          >
            Hierarchical
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Graph */}
      <div className="graph-wrapper">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={node => `${node.name} (${node.connections} connections)`}
          nodeCanvasObject={nodeCanvasObject}
          nodeCanvasObjectMode={() => 'replace'}
          linkCanvasObject={linkCanvasObject}
          linkCanvasObjectMode={linkCanvasObjectMode}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredNode}
          linkDirectionalParticles={0}
          linkDirectionalArrowLength={0}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current?.zoomToFit(400, 50)}
          backgroundColor="#1a1a2e"
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color-box" style={{ background: processedData.colors[0] }}></div>
          <span>Community</span>
        </div>
        <div className="legend-item">
          <div className="legend-line mutual"></div>
          <span>Mutual Connection</span>
        </div>
        <div className="legend-item">
          <div className="legend-line directed"></div>
          <span>Directed Connection</span>
        </div>
        <div className="legend-item">
          <span className="legend-hint">💡 Click: Select • Hover: Preview • Drag: Move • Scroll: Zoom</span>
        </div>
      </div>

      {/* Info Panel */}
      {selectedNode && (
        <div className="info-panel">
          <div className="info-header">
            <h3>{selectedNode}</h3>
            <button onClick={() => setSelectedNode(null)}>✕</button>
          </div>
          <div className="info-content">
            <p><strong>Total Connections:</strong> {graphData.nodes.find(n => n.id === selectedNode)?.connections}</p>
            <p><strong>Connected to:</strong></p>
            <ul>
              {Array.from(getConnectedNodes(selectedNode)).map(id => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
