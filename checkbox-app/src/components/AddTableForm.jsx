import { useState } from 'react';
import useStore from '../store/store';
import { ListPlus } from 'lucide-react';

export default function AddTableForm({ tabId }) {
  const addTable = useStore((s) => s.addTable);
  const [title, setTitle] = useState('');
  const [count, setCount] = useState('');

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    const num = parseInt(count, 10);
    if (trimmedTitle && num > 0 && num <= 200) {
      addTable(tabId, trimmedTitle, num);
      setTitle('');
      setCount('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="add-table-form">
      <div className="add-table-icon">
        <ListPlus size={28} strokeWidth={1.5} />
      </div>
      <h4 className="add-table-heading">Create a new tracker</h4>
      <p className="add-table-desc">
        Start a fresh auto-numbered list for your next learning sprint.
      </p>
      <div className="add-table-inputs">
        <input
          type="text"
          className="add-input"
          placeholder="Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="number"
          className="add-input add-input-number"
          placeholder="Count"
          min="1"
          max="200"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="add-btn"
          onClick={handleAdd}
          disabled={!title.trim() || !count || parseInt(count, 10) < 1}
        >
          Add
        </button>
      </div>
    </div>
  );
}
