import { useState } from 'react';
import useStore from '../store/store';
import ProgressBar from './ProgressBar';
import CheckboxGrid from './CheckboxGrid';
import ConfirmDialog from './ConfirmDialog';
import { RotateCcw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

// Compute smart preview window centered around the progress frontier
function getPreviewRange(checked, total) {
  const COLS = 5;
  const PREVIEW_ROWS = 2;
  const PREVIEW_COUNT = COLS * PREVIEW_ROWS; // 10

  // If total fits in preview, show all
  if (total <= PREVIEW_COUNT) {
    return { start: 0, end: total };
  }

  // Count consecutive checked from start (linear ticking = contiguous)
  let checkedCount = 0;
  for (let i = 0; i < total; i++) {
    if (checked[i]) checkedCount++;
    else break;
  }

  // All done — show the last 10
  if (checkedCount >= total) {
    return { start: total - PREVIEW_COUNT, end: total };
  }

  // None done — show the first 10
  if (checkedCount === 0) {
    return { start: 0, end: PREVIEW_COUNT };
  }

  // Show boundary: row 1 ends with the last checked items, row 2 starts unchecked
  // Align to the row boundary so row 1 = last checked row, row 2 = first unchecked row
  const lastCheckedRow = Math.floor((checkedCount - 1) / COLS);
  const startRow = lastCheckedRow;
  let start = startRow * COLS;
  let end = start + PREVIEW_COUNT;

  // Clamp to bounds
  if (end > total) {
    end = total;
    start = Math.max(0, end - PREVIEW_COUNT);
  }

  return { start, end };
}

export default function TableCard({ tabId, table }) {
  const { deleteTable, resetTable, renameTable } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  const COLS = 5;
  const PREVIEW_COUNT = COLS * 2;
  const showPreview = !expanded && table.total > PREVIEW_COUNT;

  const preview = getPreviewRange(table.checked, table.total);
  const visibleChecks = showPreview
    ? table.checked.slice(preview.start, preview.end)
    : table.checked;
  const startIndex = showPreview ? preview.start : 0;
  const hiddenCount = table.total - (preview.end - preview.start);

  const startRename = () => {
    setIsRenaming(true);
    setEditTitle(table.title);
  };

  const finishRename = () => {
    if (editTitle.trim()) {
      renameTable(tabId, table.id, editTitle.trim());
    }
    setIsRenaming(false);
    setEditTitle('');
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') finishRename();
    if (e.key === 'Escape') {
      setIsRenaming(false);
      setEditTitle('');
    }
  };

  return (
    <>
      <div className="table-card">
        <div className="table-header">
          <div className="table-title-section">
            <div className="table-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              {isRenaming ? (
                <input
                  type="text"
                  className="table-rename-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  onBlur={finishRename}
                  autoFocus
                />
              ) : (
                <h3
                  className="table-title"
                  onDoubleClick={startRename}
                  title="Double-click to rename"
                >
                  {table.title}
                </h3>
              )}
            </div>
          </div>
          <ProgressBar checked={table.checked} total={table.total} />
        </div>

        <CheckboxGrid
          tabId={tabId}
          tableId={table.id}
          checked={visibleChecks}
          startIndex={startIndex}
          allChecked={table.checked}
        />

        {table.total > PREVIEW_COUNT && (
          <button
            className="show-more-btn"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                SHOW LESS <ChevronUp size={14} />
              </>
            ) : (
              <>
                SHOW MORE ({hiddenCount}) <ChevronDown size={14} />
              </>
            )}
          </button>
        )}

        <div className="table-actions">
          <button
            className="action-btn reset-btn"
            onClick={() => resetTable(tabId, table.id)}
            title="Reset progress"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete table"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Table"
        message={`This will permanently delete "${table.title}" and all its progress. This action cannot be undone.`}
        onConfirm={() => {
          deleteTable(tabId, table.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
