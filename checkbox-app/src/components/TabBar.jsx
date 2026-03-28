import { useState } from 'react';
import useStore from '../store/store';
import { Clock3, Plus, Target, X } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function TabBar({ activeView, onChangeView }) {
  const { tabs, activeTabId, setActiveTab, addTab, removeTab, renameTab } =
    useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [editingTabId, setEditingTabId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteTabId, setDeleteTabId] = useState(null);

  const handleAddTab = () => {
    if (newTabName.trim()) {
      addTab(newTabName.trim());
      onChangeView('workspace');
      setNewTabName('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTab();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTabName('');
    }
  };

  const startRename = (tab) => {
    setEditingTabId(tab.id);
    setEditName(tab.name);
  };

  const finishRename = () => {
    if (editName.trim() && editingTabId) {
      renameTab(editingTabId, editName.trim());
    }
    setEditingTabId(null);
    setEditName('');
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') finishRename();
    if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditName('');
    }
  };

  const tabToDelete = tabs.find((t) => t.id === deleteTabId);

  return (
    <>
      <div className="tab-bar">
        <div className="tab-bar-inner">
          <div className="tab-list">
            {tabs.map((tab) => (
              <div key={tab.id} className="tab-wrapper">
                {editingTabId === tab.id ? (
                  <input
                    type="text"
                    className="tab-rename-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={finishRename}
                    autoFocus
                  />
                ) : (
                  <button
                    className={`tab ${tab.id === activeTabId && activeView === 'workspace' ? 'tab-active' : ''}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      onChangeView('workspace');
                    }}
                    onDoubleClick={() => startRename(tab)}
                    title="Double-click to rename"
                  >
                    <span className="tab-name">{tab.name}</span>
                    <span
                      className="tab-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTabId(tab.id);
                      }}
                    >
                      <X size={12} />
                    </span>
                  </button>
                )}
              </div>
            ))}

            {isAdding ? (
              <div className="tab-input-wrapper">
                <input
                  type="text"
                  className="tab-input"
                  placeholder="Tab name..."
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!newTabName.trim()) {
                      setIsAdding(false);
                      setNewTabName('');
                    }
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <button
                className="tab tab-add"
                onClick={() => setIsAdding(true)}
                title="Add new tab"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="tab-view-actions">
            <button
              className={`tab tab-view-btn ${activeView === 'timer' ? 'tab-active' : ''}`}
              onClick={() => onChangeView('timer')}
              title="Open timer"
            >
              <Clock3 size={16} />
              <span>Timer</span>
            </button>
            <button
              className={`tab tab-view-btn ${activeView === 'goals' ? 'tab-active' : ''}`}
              onClick={() => onChangeView('goals')}
              title="Open goals"
            >
              <Target size={16} />
              <span>Goals</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTabId !== null}
        title="Delete Workspace"
        message={`This will permanently delete "${tabToDelete?.name || ''}" and all its tables. This action cannot be undone.`}
        onConfirm={() => {
          removeTab(deleteTabId);
          setDeleteTabId(null);
        }}
        onCancel={() => setDeleteTabId(null)}
      />
    </>
  );
}
