/* ============================================
   Header Component
   Top navigation bar with breadcrumbs and controls
   ============================================ */

import { useCallback } from 'react';
import { useCanvasStore, useUIStore } from '../../store';
import './Header.css';

export function Header() {
  const { flow, viewport, resetViewport, zoom } = useCanvasStore();
  const {
    breadcrumbs,
    isMiniMapVisible,
    toggleMiniMap,
    setFileDialogOpen,
  } = useUIStore();

  const handleZoomIn = useCallback(() => {
    zoom(1.2);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    zoom(0.8);
  }, [zoom]);

  const handleZoomReset = useCallback(() => {
    resetViewport();
  }, [resetViewport]);

  const handleOpenFile = useCallback(() => {
    setFileDialogOpen(true);
  }, [setFileDialogOpen]);

  return (
    <header className="header">
      {/* Logo and app name */}
      <div className="header__brand">
        <div className="header__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 12h16M12 4v16" strokeLinecap="round" />
            <circle cx="4" cy="12" r="2" fill="currentColor" />
            <circle cx="20" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="4" r="2" fill="currentColor" />
            <circle cx="12" cy="20" r="2" fill="currentColor" />
          </svg>
        </div>
        <span className="header__title">OIC Flow Visualizer</span>
      </div>

      {/* Breadcrumb navigation */}
      <nav className="header__breadcrumbs" aria-label="Breadcrumb">
        {flow && (
          <>
            <span className="header__breadcrumb header__breadcrumb--root">
              {flow.displayName || flow.name}
            </span>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.id} className="header__breadcrumb">
                <span className="header__breadcrumb-separator">/</span>
                <span className="header__breadcrumb-label">{crumb.label}</span>
              </span>
            ))}
          </>
        )}
      </nav>

      {/* Actions */}
      <div className="header__actions">
        {/* Open file */}
        <button
          className="header__button"
          onClick={handleOpenFile}
          aria-label="Open IAR file"
          title="Open IAR file"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="header__separator" />

        {/* Zoom controls */}
        <div className="header__zoom-controls">
          <button
            className="header__button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35M8 11h6" strokeLinecap="round" />
            </svg>
          </button>
          <span className="header__zoom-level">{Math.round(viewport.zoom * 100)}%</span>
          <button
            className="header__button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="header__button header__button--text"
            onClick={handleZoomReset}
            aria-label="Reset zoom"
            title="Reset zoom to 100%"
          >
            Reset
          </button>
        </div>

        <div className="header__separator" />

        {/* Toggle minimap */}
        <button
          className={`header__button ${isMiniMapVisible ? 'header__button--active' : ''}`}
          onClick={toggleMiniMap}
          aria-label="Toggle minimap"
          title="Toggle minimap"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <rect x="13" y="13" width="6" height="6" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}
