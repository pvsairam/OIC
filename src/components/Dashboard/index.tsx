/* ============================================
   Dashboard Component
   Main homepage with upload and integration list
   ============================================ */

import { useCallback, useRef, useState } from 'react';
import { useAppStore, StoredIntegration } from '../../store';
import { parseIARFile } from '../../utils/iar-parser';
import { applyAutoLayout } from '../../utils/auto-layout';
import './Dashboard.css';

export function Dashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { integrations, addIntegration, removeIntegration, openIntegration } = useAppStore();

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      try {
        const flow = await parseIARFile(file);
        // Apply auto-layout to calculate positions
        const layoutedFlow = applyAutoLayout(flow);
        addIntegration(layoutedFlow);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import file');
      } finally {
        setIsLoading(false);
      }
    },
    [addIntegration]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
      e.target.value = '';
    },
    [handleFileUpload]
  );

  const handleUploadClick = () => fileInputRef.current?.click();

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard__header">
        <div className="dashboard__brand">
          <div className="dashboard__logo">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0066CC" />
              <path d="M8 16h16M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="8" cy="16" r="2.5" fill="#fff" />
              <circle cx="24" cy="16" r="2.5" fill="#fff" />
              <circle cx="16" cy="10" r="2.5" fill="#fff" />
              <circle cx="16" cy="22" r="2.5" fill="#fff" />
            </svg>
          </div>
          <div className="dashboard__brand-text">
            <h1 className="dashboard__title">OIC Flow Visualizer</h1>
            <span className="dashboard__subtitle">Oracle Integration Cloud</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard__content">
        {/* Stats Section */}
        <section className="dashboard__stats">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
              </svg>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{integrations.length}</span>
              <span className="stat-card__label">Integrations</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">
                {integrations.reduce((sum, i) => sum + i.nodeCount, 0)}
              </span>
              <span className="stat-card__label">Total Activities</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">
                {integrations.length > 0
                  ? new Date(integrations[0].importedAt).toLocaleDateString()
                  : '—'}
              </span>
              <span className="stat-card__label">Last Import</span>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section
          className={`dashboard__upload ${isDragging ? 'dashboard__upload--dragging' : ''} ${isLoading ? 'dashboard__upload--loading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".iar,.zip,.json"
            onChange={handleFileChange}
            className="dashboard__upload-input"
          />

          {isLoading ? (
            <div className="dashboard__upload-loading">
              <div className="spinner" />
              <span>Importing integration...</span>
            </div>
          ) : (
            <>
              <div className="dashboard__upload-icon">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M24 32V14M24 14l-8 8M24 14l8 8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 32v6a4 4 0 004 4h24a4 4 0 004-4v-6" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="dashboard__upload-title">
                {isDragging ? 'Drop to upload' : 'Import Integration'}
              </h3>
              <p className="dashboard__upload-text">
                Drag & drop an IAR file, or click to browse
              </p>
              <span className="dashboard__upload-hint">
                Supports .iar, .zip, and .json files
              </span>
            </>
          )}

          {error && (
            <div className="dashboard__upload-error">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Integrations List */}
        <section className="dashboard__integrations">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">Imported Integrations</h2>
            <span className="dashboard__section-count">{integrations.length}</span>
          </div>

          {integrations.length === 0 ? (
            <div className="dashboard__empty">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="6" y="6" width="36" height="36" rx="4" />
                <path d="M6 18h36M18 6v36" />
              </svg>
              <p>No integrations imported yet</p>
              <span>Upload an IAR file to get started</span>
            </div>
          ) : (
            <div className="dashboard__list">
              {integrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onOpen={() => openIntegration(integration.id)}
                  onDelete={() => removeIntegration(integration.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Integration Card Component
function IntegrationCard({
  integration,
  onOpen,
  onDelete,
}: {
  integration: StoredIntegration;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="integration-card">
      <div className="integration-card__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 12h16M12 4v16" strokeLinecap="round" />
          <circle cx="4" cy="12" r="2" fill="currentColor" />
          <circle cx="20" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
        </svg>
      </div>

      <div className="integration-card__content">
        <h3 className="integration-card__name">{integration.displayName}</h3>
        <p className="integration-card__meta">
          {integration.nodeCount} activities
          {integration.version && ` • v${integration.version}`}
        </p>
        {integration.description && (
          <p className="integration-card__description">{integration.description}</p>
        )}
      </div>

      <div className="integration-card__actions">
        <button className="integration-card__btn integration-card__btn--primary" onClick={onOpen}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          View Flow
        </button>
        <button className="integration-card__btn integration-card__btn--danger" onClick={onDelete}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="integration-card__date">
        {new Date(integration.importedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}
