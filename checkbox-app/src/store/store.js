import { create } from 'zustand';

const generateId = () => Math.random().toString(36).substring(2, 10);
const TIMER_DURATION_MS = 2 * 60 * 60 * 1000;

// Check if running in Electron
const isElectron = () => typeof window !== 'undefined' && window.electronStore;

const createStoppedTimer = (remainingMs = TIMER_DURATION_MS) => ({
  durationMs: TIMER_DURATION_MS,
  remainingMs,
  startedAt: null,
  endsAt: null,
  isRunning: false,
});

const normalizeTimer = (timer, now = Date.now()) => {
  if (!timer || typeof timer !== 'object') {
    return createStoppedTimer();
  }

  // Migrate the previous always-running timer shape.
  if (
    typeof timer.startedAt === 'number' &&
    typeof timer.endsAt === 'number' &&
    typeof timer.isRunning !== 'boolean'
  ) {
    if (now >= timer.endsAt) {
      return createStoppedTimer();
    }

    return {
      durationMs: TIMER_DURATION_MS,
      remainingMs: Math.max(0, timer.endsAt - now),
      startedAt: timer.startedAt,
      endsAt: timer.endsAt,
      isRunning: true,
    };
  }

  const durationMs =
    typeof timer.durationMs === 'number' && timer.durationMs > 0
      ? timer.durationMs
      : TIMER_DURATION_MS;

  const remainingMs =
    typeof timer.remainingMs === 'number' && timer.remainingMs >= 0
      ? Math.min(timer.remainingMs, durationMs)
      : durationMs;

  if (!timer.isRunning) {
    return {
      durationMs,
      remainingMs,
      startedAt: null,
      endsAt: null,
      isRunning: false,
    };
  }

  if (
    typeof timer.startedAt !== 'number' ||
    typeof timer.endsAt !== 'number' ||
    timer.endsAt <= timer.startedAt
  ) {
    return createStoppedTimer(durationMs);
  }

  if (now >= timer.endsAt) {
    return createStoppedTimer(durationMs);
  }

  return {
    durationMs,
    remainingMs,
    startedAt: timer.startedAt,
    endsAt: timer.endsAt,
    isRunning: true,
  };
};

const createGoalsState = () => ({
  career: [],
  personal: [],
});

const normalizeGoalList = (items) =>
  Array.isArray(items)
    ? items
        .filter(
          (goal) =>
            goal &&
            typeof goal.id === 'string' &&
            typeof goal.title === 'string' &&
            typeof goal.targetDate === 'string'
        )
        .map((goal) => ({
          id: goal.id,
          title: goal.title,
          targetDate: goal.targetDate,
        }))
    : [];

const normalizeGoals = (goals) => ({
  career: normalizeGoalList(goals?.career),
  personal: normalizeGoalList(goals?.personal),
});

const getGoalDeadline = (targetDate) =>
  new Date(`${targetDate}T23:59:59.999`).getTime();

const isGoalOverdue = (targetDate, now = Date.now()) =>
  Number.isFinite(getGoalDeadline(targetDate)) && now > getGoalDeadline(targetDate);

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
  timer: createStoppedTimer(),
  goals: createGoalsState(),
  initialized: false,

  // Initialize store from persisted data
  init: async () => {
    const data = await loadFromStorage();
    const tabs = Array.isArray(data?.tabs) ? data.tabs : [];

    set({
      tabs,
      activeTabId: tabs.length > 0 ? data?.activeTabId || tabs[0].id : null,
      timer: normalizeTimer(data?.timer),
      goals: normalizeGoals(data?.goals),
      initialized: true,
    });

    get().persist();
  },

  // Persist current state
  persist: () => {
    const { tabs, activeTabId, timer, goals } = get();
    saveToStorage({
      tabs,
      activeTabId,
      timer,
      goals,
    });
  },

  startTimer: (startTime = Date.now()) => {
    const { timer } = get();
    const nextTimer = normalizeTimer(timer, startTime);

    if (nextTimer.isRunning) return;

    set({
      timer: {
        durationMs: nextTimer.durationMs,
        remainingMs: nextTimer.remainingMs,
        startedAt: startTime,
        endsAt: startTime + nextTimer.remainingMs,
        isRunning: true,
      },
    });
    get().persist();
  },

  resetTimer: () => {
    set({ timer: createStoppedTimer() });
    get().persist();
  },

  syncTimer: (now = Date.now()) => {
    const nextTimer = normalizeTimer(get().timer, now);
    const { timer } = get();

    if (
      nextTimer.startedAt !== timer.startedAt ||
      nextTimer.endsAt !== timer.endsAt
    ) {
      set({ timer: nextTimer });
      get().persist();
    }
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

  incrementTableCheckboxes: (tabId, tableId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              tables: tab.tables.map((t) => {
                if (t.id !== tableId || t.total >= 200) return t;
                return {
                  ...t,
                  total: t.total + 1,
                  checked: [...t.checked, false],
                };
              }),
            }
          : tab
      ),
    }));
    get().persist();
  },

  decrementTableCheckboxes: (tabId, tableId) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              tables: tab.tables.map((t) => {
                if (t.id !== tableId || t.total <= 1) return t;
                return {
                  ...t,
                  total: t.total - 1,
                  checked: t.checked.slice(0, -1),
                };
              }),
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

  addGoal: (category, title, targetDate) => {
    if (!['career', 'personal'].includes(category)) return;
    if (!title.trim() || !targetDate) return;

    set((state) => ({
      goals: {
        ...state.goals,
        [category]: [
          ...state.goals[category],
          {
            id: generateId(),
            title: title.trim(),
            targetDate,
          },
        ],
      },
    }));
    get().persist();
  },

  renameGoal: (category, goalId, newTitle) => {
    if (!['career', 'personal'].includes(category)) return;
    if (!newTitle.trim()) return;

    set((state) => ({
      goals: {
        ...state.goals,
        [category]: state.goals[category].map((goal) =>
          goal.id === goalId ? { ...goal, title: newTitle.trim() } : goal
        ),
      },
    }));
    get().persist();
  },

  updateGoalDate: (category, goalId, targetDate) => {
    if (!['career', 'personal'].includes(category)) return;
    if (!targetDate) return;

    set((state) => ({
      goals: {
        ...state.goals,
        [category]: state.goals[category].map((goal) => {
          if (goal.id !== goalId) return goal;
          if (!isGoalOverdue(goal.targetDate)) return goal;
          return { ...goal, targetDate };
        }),
      },
    }));
    get().persist();
  },

  deleteGoal: (category, goalId) => {
    if (!['career', 'personal'].includes(category)) return;

    set((state) => ({
      goals: {
        ...state.goals,
        [category]: state.goals[category].filter((goal) => goal.id !== goalId),
      },
    }));
    get().persist();
  },
}));

export default useStore;
