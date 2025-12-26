/* ============================================
   File Drop Zone Component
   Drag and drop interface for loading IAR files
   ============================================ */

import { useState, useCallback, useRef } from 'react';
import { useCanvasStore } from '../../store';
import { parseIARFile } from '../../utils/iar-parser';
import './FileDropZone.css';

export function FileDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setFlow } = useCanvasStore();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const flow = await parseIARFile(file);
        setFlow(flow);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
      } finally {
        setIsLoading(false);
      }
    },
    [setFlow]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={`file-drop-zone ${isDragging ? 'file-drop-zone--dragging' : ''} ${isLoading ? 'file-drop-zone--loading' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".iar,.zip,.json"
        onChange={handleFileSelect}
        className="file-drop-zone__input"
      />

      <div className="file-drop-zone__content">
        {isLoading ? (
          <>
            <div className="file-drop-zone__spinner" />
            <p className="file-drop-zone__text">Loading integration...</p>
          </>
        ) : (
          <>
            <div className="file-drop-zone__icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M24 32V16M24 16l-8 8M24 16l8 8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 32v8a4 4 0 004 4h24a4 4 0 004-4v-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="file-drop-zone__title">
              {isDragging ? 'Drop file here' : 'Load Integration Flow'}
            </h2>
            <p className="file-drop-zone__text">
              Drag and drop an .iar file, or click to browse
            </p>
            <p className="file-drop-zone__hint">
              Supports Oracle Integration Cloud archive files
            </p>
          </>
        )}

        {error && (
          <div className="file-drop-zone__error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
