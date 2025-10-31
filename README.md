# Interactive Sociogram Visualization

A feature-rich, interactive sociogram web application built with React and react-force-graph-2d that visualizes social network connections with multiple layout modes, fluid zoom/pan controls, and rich interactions.

## Features

### 🎨 Multiple Layout Modes
- **Force-Directed Layout**: Physics-based organic layout where nodes naturally position themselves
- **Circular Layout**: Arranges all nodes in a circular pattern for equal spacing
- **Hierarchical Layout**: Organizes nodes by community groups in vertical columns

### 🔍 Interactive Features
- **Click to Select**: Click any node to see detailed connection information
- **Hover Preview**: Hover over nodes to preview their connections
- **Search & Filter**: Real-time search to find specific people
- **Zoom & Pan**: Fluid mouse wheel zoom and drag-to-pan controls
- **Node Dragging**: Reposition nodes manually in force-directed mode
- **Dynamic Data Input**: Update the graph with new data via a modal interface

### 🎯 Visual Enhancements
- **Community Detection**: Automatically groups and color-codes related nodes
- **Node Sizing**: Node size reflects connection popularity
- **Mutual Connections**: Highlighted in orange to distinguish from directed connections
- **Directed Arrows**: Shows directional relationships with arrow indicators
- **Smart Highlighting**: Selected and connected nodes are emphasized while others dim

### 📊 Data Visualization
- Shows both incoming and outgoing connections
- Displays mutual relationships differently from one-way connections
- Color-coded communities based on network analysis
- Real-time connection count for each person

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

**Option 1: Deploy via Vercel CLI**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

**Option 2: Deploy via Vercel Dashboard**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Vite and use the settings from `vercel.json`
5. Click "Deploy"

**Build Settings** (auto-configured via `vercel.json`):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Usage Guide

### Navigation
- **Zoom**: Use mouse wheel or trackpad pinch gesture
- **Pan**: Click and drag the background
- **Move Nodes**: Click and drag individual nodes (force-directed mode)

### Layout Switching
Click the tabs at the top to switch between:
- Force-Directed (organic, physics-based)
- Circular (equal spacing around a circle)
- Hierarchical (grouped by communities)

### Exploring Connections
1. **Hover** over any node to preview their connections
2. **Click** a node to see detailed information in the side panel
3. Use the **search box** to filter people by name
4. Click the **✕** button to clear selection or search

### Updating Data
1. Click the **"Update Data"** button in the header
2. Paste your sociogram data in the format:
   ```
   Name: Friend1, Friend2, Friend3
   OtherName: Friend4, Friend5
   ```
3. Click **"Update Graph"** to apply the new data
4. The graph will automatically re-render with the new connections

### Understanding the Visualization
- **Blue/Purple/Green/Orange Nodes**: Different communities (automatically detected)
- **Larger Nodes**: More connections (more popular individuals)
- **Orange Lines**: Mutual connections (both people chose each other)
- **White Lines with Arrows**: Directed connections (one-way choices)

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **react-force-graph-2d**: Graph visualization library with built-in zoom/pan
- **D3.js**: Data manipulation and force simulation
- **HTML5 Canvas**: High-performance rendering

## Project Structure

```
sociogram/
├── src/
│   ├── components/
│   │   └── Sociogram.jsx    # Main graph component
│   ├── App.jsx               # Root application component
│   ├── App.css               # Application styles
│   ├── data.js               # Social network data
│   ├── utils.js              # Graph algorithms and utilities
│   └── main.jsx              # React entry point
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
└── vite.config.js            # Vite configuration
```

## Customization

### Adding New Data
Edit `src/data.js` to add or modify relationships:

```javascript
export const relationshipsData = {
  "PersonName": ["Friend1", "Friend2", "Friend3"],
  // ...
};
```

### Changing Colors
Modify the color palette in `src/utils.js`:

```javascript
const colors = [
  '#3b82f6', // Blue
  '#ec4899', // Pink
  // Add more colors...
];
```

### Adjusting Layout Parameters
Fine-tune layout algorithms in `src/utils.js`:
- Circular radius
- Hierarchical spacing
- Force simulation strength

## Algorithm Details

### Community Detection
Uses a combination of:
1. Connected components analysis (BFS)
2. Degree-based clustering as fallback
3. Groups nodes with similar connection patterns

### Node Sizing
Scales logarithmically based on total connections:
- Minimum size: 4px
- Maximum size: 12px
- Range: 1-10+ connections

### Layout Algorithms
- **Force-Directed**: D3 force simulation with charge and link forces
- **Circular**: Evenly distributed around a circle with angle-based positioning
- **Hierarchical**: Community-based column layout with vertical spacing

## Performance

- Optimized canvas rendering for 50+ nodes
- Efficient link/node highlighting
- Smooth 60fps animations
- Minimal re-renders with React memoization

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

## License

MIT

## Credits

Created with React, react-force-graph-2d, and D3.js
