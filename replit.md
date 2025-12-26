# OIC Flow Visualizer

## Overview
Enterprise-grade visual canvas for Oracle Integration Cloud (OIC) integration flows. This React + TypeScript application provides an interactive visualization of OIC integration workflows.

## Tech Stack
- React 18
- TypeScript
- Vite (build tool)
- Zustand (state management)
- JSZip (for IAR file parsing)

## Project Structure
```
src/
├── components/     # React components
│   ├── ActivityCard/    # Activity node cards
│   ├── Canvas/          # Main canvas component
│   ├── ConnectionLine/  # Connection lines between nodes
│   ├── Container/       # Container components
│   ├── FileDropZone/    # File upload component
│   ├── Header/          # Application header
│   ├── Icons/           # Icon components
│   ├── MiniMap/         # Canvas minimap
│   └── SidePanel/       # Side panel component
├── data/           # Sample data
├── store/          # Zustand state store
├── styles/         # Global CSS styles
├── types/          # TypeScript type definitions
└── utils/          # Utility functions (IAR parser)
```

## Development
- Dev server: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Preview: `npm run preview`

## Deployment
Configured for static deployment. Build output goes to `dist/` directory.
