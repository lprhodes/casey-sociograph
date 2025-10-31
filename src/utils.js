// Process raw relationship data into nodes and links
export function processGraphData(relationshipsData) {
  const nodes = new Map();
  const links = [];
  const mutualConnections = new Set();

  // Create all nodes
  const allNames = new Set([
    ...Object.keys(relationshipsData),
    ...Object.values(relationshipsData).flat()
  ]);

  allNames.forEach(name => {
    nodes.set(name, {
      id: name,
      name: name,
      connections: 0,
      incomingConnections: 0,
      outgoingConnections: 0
    });
  });

  // Create links and track connections
  Object.entries(relationshipsData).forEach(([source, targets]) => {
    targets.forEach(target => {
      links.push({ source, target });

      // Track connections for node sizing
      if (nodes.has(source)) {
        nodes.get(source).outgoingConnections++;
        nodes.get(source).connections++;
      }
      if (nodes.has(target)) {
        nodes.get(target).incomingConnections++;
        nodes.get(target).connections++;
      }

      // Check if this is a mutual connection
      if (relationshipsData[target] && relationshipsData[target].includes(source)) {
        const key1 = `${source}-${target}`;
        const key2 = `${target}-${source}`;
        mutualConnections.add(key1);
        mutualConnections.add(key2);
      }
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    links: links.map(link => ({
      ...link,
      isMutual: mutualConnections.has(`${link.source}-${link.target}`)
    }))
  };
}

// Simple community detection using connected components and modularity
export function detectCommunities(nodes, links) {
  const adjacencyList = new Map();

  // Build adjacency list (undirected)
  nodes.forEach(node => adjacencyList.set(node.id, new Set()));
  links.forEach(link => {
    adjacencyList.get(link.source).add(link.target);
    adjacencyList.get(link.target).add(link.source);
  });

  const communities = new Map();
  const visited = new Set();
  let communityId = 0;

  // BFS to find connected components
  function bfs(startNode) {
    const queue = [startNode];
    const component = [];
    visited.add(startNode);

    while (queue.length > 0) {
      const node = queue.shift();
      component.push(node);

      adjacencyList.get(node).forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }

    return component;
  }

  // Find all communities
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = bfs(node.id);
      component.forEach(nodeId => {
        communities.set(nodeId, communityId);
      });
      communityId++;
    }
  });

  // If we only have one big component, use degree-based clustering
  if (communityId === 1) {
    return clusterByDegree(nodes, links);
  }

  return communities;
}

// Cluster nodes by their connection degree (as a fallback)
function clusterByDegree(nodes, links) {
  const communities = new Map();

  nodes.forEach(node => {
    // Group by connection range
    const connections = node.connections;
    let communityId;

    if (connections >= 8) communityId = 0; // Highly connected
    else if (connections >= 5) communityId = 1; // Well connected
    else if (connections >= 3) communityId = 2; // Moderately connected
    else communityId = 3; // Less connected

    communities.set(node.id, communityId);
  });

  return communities;
}

// Generate color palette for communities
export function generateColorPalette(numCommunities) {
  const colors = [
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];

  return Array.from({ length: numCommunities }, (_, i) => colors[i % colors.length]);
}

// Calculate circular layout positions
export function calculateCircularLayout(nodes, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
}

// Calculate hierarchical layout positions
export function calculateHierarchicalLayout(nodes, links, communities, width, height) {
  // Group nodes by community
  const communityGroups = new Map();
  nodes.forEach(node => {
    const community = communities.get(node.id) || 0;
    if (!communityGroups.has(community)) {
      communityGroups.set(community, []);
    }
    communityGroups.get(community).push(node);
  });

  const numCommunities = communityGroups.size;
  const positions = [];
  const communityWidth = width / (numCommunities + 1);

  let communityIndex = 0;
  communityGroups.forEach((communityNodes, communityId) => {
    const x = communityWidth * (communityIndex + 1);
    const nodeHeight = height / (communityNodes.length + 1);

    communityNodes.forEach((node, index) => {
      positions.push({
        ...node,
        x: x,
        y: nodeHeight * (index + 1)
      });
    });

    communityIndex++;
  });

  return positions;
}

// Calculate node size based on connections
export function calculateNodeSize(connections) {
  const minSize = 4;
  const maxSize = 12;
  const minConnections = 1;
  const maxConnections = 10;

  const normalizedConnections = Math.min(connections, maxConnections);
  return minSize + ((normalizedConnections - minConnections) / (maxConnections - minConnections)) * (maxSize - minSize);
}
