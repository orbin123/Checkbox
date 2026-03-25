import { useState } from 'react';
import useStore from '../store/store';
import { ClipboardCheck } from 'lucide-react';

export default function EmptyState() {
  const addTab = useStore((s) => s.addTab);
  const [name, setName] = useState('');

  const handleCreate = () => {
    const trimmed = name.trim();
    if (trimmed) {
      addTab(trimmed);
      setName('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate();
  };

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <ClipboardCheck size={48} strokeWidth={1.2} />
      </div>
      <h1 className="empty-title">Welcome to Checkbox</h1>
      <p className="empty-desc">
        Keep your tasks simple and focused. Create your first workspace to get
        started.
      </p>
      <div className="empty-create-row">
        <input
          type="text"
          className="empty-input"
          placeholder="Workspace name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          className="empty-cta"
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          + Create Workspace
        </button>
      </div>
      <p className="empty-hint">
        <span className="hint-icon">💡</span> Press{' '}
        <kbd>⌘</kbd> + <kbd>N</kbd> to quick-start
      </p>
    </div>
  );
}
