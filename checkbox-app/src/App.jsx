import { useEffect } from 'react';
import useStore from './store/store';
import TabBar from './components/TabBar';
import TableCard from './components/TableCard';
import AddTableForm from './components/AddTableForm';
import EmptyState from './components/EmptyState';
import { Plus } from 'lucide-react';
import './App.css';

function App() {
  const { tabs, activeTabId, initialized, init, addTab } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  // Keyboard shortcut: Cmd+N to add workspace
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        const name = prompt('New workspace name:');
        if (name && name.trim()) {
          addTab(name.trim());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, addTab]);

  if (!initialized) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  // No tabs — show empty/welcome state
  if (tabs.length === 0) {
    return <EmptyState />;
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div className="app">
      <TabBar />

      <main className="workspace">
        <div className="workspace-header">
          <div>
            <h1 className="workspace-title">{activeTab.name}</h1>
            <p className="workspace-desc">
              Track your progress across digital playlists and courses.
            </p>
          </div>
          <button
            className="add-table-cta"
            onClick={() => {
              const title = prompt('Table title:');
              if (title && title.trim()) {
                const count = prompt('Number of checkboxes:');
                const num = parseInt(count, 10);
                if (num > 0 && num <= 200) {
                  useStore.getState().addTable(activeTab.id, title.trim(), num);
                }
              }
            }}
          >
            <Plus size={18} />
            Add Table
          </button>
        </div>

        <div className="table-list">
          {activeTab.tables.map((table) => (
            <TableCard key={table.id} tabId={activeTab.id} table={table} />
          ))}
        </div>

        <AddTableForm tabId={activeTab.id} />
      </main>
    </div>
  );
}

export default App;
