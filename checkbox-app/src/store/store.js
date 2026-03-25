import { create } from 'zustand';

const generateId = () => Math.random().toString(36).substring(2, 10);

// Check if running in Electron
const isElectron = () => typeof window !== 'undefined' && window.electronStore;

// Persistence helpers
const loadFromStorage = async () => {
  if (isElectron()) {
    return await window.electronStore.get('appData');
  }
  const data = localStorage.getItem('checkbox-app-data');
  return data ? JSON.parse(data) : null;
};

const saveToStorage = (data) => {
  if (isElectron()) {
    window.electronStore.set('appData', data);
  } else {
    localStorage.setItem('checkbox-app-data', JSON.stringify(data));
  }
};

const useStore = create((set, get) => ({
  tabs: [],
  activeTabId: null,
  initialized: false,

  // Initialize store from persisted data
  init: async () => {
    const data = await loadFromStorage();
    if (data && data.tabs && data.tabs.length > 0) {
      set({
        tabs: data.tabs,
        activeTabId: data.activeTabId || data.tabs[0].id,
        initialized: true,
      });
    } else {
      set({ initialized: true });
    }
  },

  // Persist current state
  persist: () => {
    const { tabs, activeTabId } = get();
    saveToStorage({ tabs, activeTabId });
  },

  // Tab actions
  addTab: (name) => {
    const id = generateId();
    set((state) => {
      const newTabs = [...state.tabs, { id, name, tables: [] }];
      return { tabs: newTabs, activeTabId: id };
    });
    get().persist();
    return id;
  },

  removeTab: (tabId) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      const newActiveId =
        state.activeTabId === tabId
          ? newTabs.length > 0
            ? newTabs[0].id
            : null
          : state.activeTabId;
      return { tabs: newTabs, activeTabId: newActiveId };
    });
    get().persist();
  },

  renameTab: (tabId, newName) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, name: newName } : t
      ),
    }));
    get().persist();
  },

  setActiveTab: (tabId) => {
    set({ activeTabId: tabId });
    get().persist();
  },

  // Table actions
  addTable: (tabId, title, total) => {
    const tableId = generateId();
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              tables: [
                ...tab.tables,
                {
                  id: tableId,
                  title,
                  total,
                  checked: new Array(total).fill(false),
                },
              ],
            }
          : tab
      ),
    }));
    get().persist();
  },

  renameTable: (tabId, tableId, newTitle) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              tables: tab.tables.map((t) =>
                t.id === tableId ? { ...t, title: newTitle } : t
              ),
            }
          : tab
      ),
    }));
    get().persist();
  },

  deleteTable: (tabId, tableId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, tables: tab.tables.filter((t) => t.id !== tableId) }
          : tab
      ),
    }));
    get().persist();
  },

  resetTable: (tabId, tableId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              tables: tab.tables.map((t) =>
                t.id === tableId
                  ? { ...t, checked: new Array(t.total).fill(false) }
                  : t
              ),
            }
          : tab
      ),
    }));
    get().persist();
  },

  toggleCheckbox: (tabId, tableId, index) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              tables: tab.tables.map((t) =>
                t.id === tableId
                  ? {
                      ...t,
                      checked: t.checked.map((c, i) =>
                        i === index ? !c : c
                      ),
                    }
                  : t
              ),
            }
          : tab
      ),
    }));
    get().persist();
  },
}));

export default useStore;
