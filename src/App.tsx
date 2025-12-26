/* ============================================
   OIC Flow Visualizer - Main Application
   ============================================ */

import { useEffect } from 'react';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { SidePanel } from './components/SidePanel';
import { MiniMap } from './components/MiniMap';
import { FileDropZone } from './components/FileDropZone';
import { useCanvasStore, useUIStore } from './store';
import { sampleIntegration } from './data/sample-integration';
import './styles/App.css';

export default function App() {
  const { flow, setFlow, selectedNodeId } = useCanvasStore();
  const { isSidePanelOpen, isMiniMapVisible, openSidePanel, closeSidePanel } = useUIStore();

  // Load sample data on mount
  useEffect(() => {
    setFlow(sampleIntegration);
  }, [setFlow]);

  // Open side panel when a node is selected
  useEffect(() => {
    if (selectedNodeId) {
      openSidePanel();
    }
  }, [selectedNodeId, openSidePanel]);

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        {flow ? (
          <>
            <Canvas />
            {isMiniMapVisible && <MiniMap />}
          </>
        ) : (
          <FileDropZone />
        )}
      </main>

      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={closeSidePanel}
      />
    </div>
  );
}
