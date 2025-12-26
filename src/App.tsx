/* ============================================
   OIC Flow Visualizer - Main Application
   ============================================ */

import { useAppStore } from './store';
import { Dashboard } from './components/Dashboard';
import { FlowViewer } from './components/FlowViewer';
import './styles/App.css';

export default function App() {
  const { currentView } = useAppStore();

  return (
    <div className="app">
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'flow' && <FlowViewer />}
    </div>
  );
}
