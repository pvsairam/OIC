# OIC Flow Visualizer

Enterprise-grade visual canvas for Oracle Integration Cloud (OIC Gen 3) integration flows.

## Overview

A professional-quality frontend application that renders OIC integration flows from imported `.iar` files. Built with a focus on clarity, precision, and enterprise usability.

## Features

- **Canvas Visualization**: Horizontal execution flow with smooth pan and zoom
- **Activity Nodes**: Map, Invoke, Stage File, Assign, Lookup, Notification, and more
- **Control Flow Containers**: Switch, ForEach, Scope with expand/collapse
- **Connection Routing**: Clean bezier curves with smart edge routing
- **Metadata Panel**: Detailed property inspection for selected nodes
- **MiniMap Navigator**: Overview navigation for large flows
- **IAR File Support**: Import OIC archive files directly

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

```
src/
├── components/       # UI components
│   ├── ActivityCard/ # Activity node rendering
│   ├── Canvas/       # Main visualization surface
│   ├── Container/    # Control flow containers
│   ├── ConnectionLine/ # Edge rendering
│   ├── Header/       # Top navigation
│   ├── Icons/        # Activity and container icons
│   ├── MiniMap/      # Navigation overview
│   ├── SidePanel/    # Metadata display
│   └── FileDropZone/ # File upload interface
├── data/             # Sample integration data
├── store/            # Zustand state management
├── styles/           # Design system and global styles
├── types/            # TypeScript type definitions
└── utils/            # IAR file parser
```

## Design Philosophy

- Calm, neutral palette inspired by professional IDE canvases
- No flashy colors or unnecessary animations
- Every pixel serves a purpose
- Built for hours of focused work without fatigue

## Tech Stack

- React 18 with TypeScript
- Vite for development and building
- Zustand for state management
- JSZip for IAR file parsing

## License

Proprietary - Internal Use Only
