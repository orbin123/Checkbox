import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import useStore from '../store/store';
import ConfirmDialog from './ConfirmDialog';

const DAY_MS = 24 * 60 * 60 * 1000;

const goalSections = [
  {
    key: 'career',
    title: 'Career Goals',
    description: 'Track work, study, and professional milestones.',
  },
  {
    key: 'personal',
    title: 'Personal Goals',
    description: 'Track habits and personal achievements outside of work.',
  },
];

function getDeadlineTime(targetDate) {
  return new Date(`${targetDate}T23:59:59.999`).getTime();
}

function getDaysLeft(targetDate, now) {
  return Math.ceil((getDeadlineTime(targetDate) - now) / DAY_MS);
}

function getGoalTone(daysLeft) {
  if (daysLeft >= 30) return 'success';
  if (daysLeft >= 10) return 'warning';
  return 'danger';
}

function formatDaysLabel(daysLeft) {
  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft);
    return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
  }

  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
}

function getGoalBadgeTone(index) {
  const tones = ['yellow', 'blue', 'purple', 'red'];
  return tones[(index - 1) % tones.length];
}

function GoalRow({ category, goal, now, index }) {
  const { renameGoal, updateGoalDate, deleteGoal } = useStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [dateDraft, setDateDraft] = useState(goal.targetDate);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const daysLeft = useMemo(() => getDaysLeft(goal.targetDate, now), [goal.targetDate, now]);
  const isOverdue = daysLeft < 0;
  const goalTone = getGoalTone(daysLeft);

  const startRename = () => {
    setTitleDraft(goal.title);
    setIsEditingTitle(true);
  };

  const finishRename = () => {
    if (titleDraft.trim()) {
      renameGoal(category, goal.id, titleDraft.trim());
    } else {
      setTitleDraft(goal.title);
    }

    setIsEditingTitle(false);
  };

  const handleRenameKeyDown = (event) => {
    if (event.key === 'Enter') finishRename();
    if (event.key === 'Escape') {
      setTitleDraft(goal.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <>
      <div className={`goal-row ${isExpanded ? 'goal-row-expanded' : ''}`}>
        <div
          className="goal-row-summary"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isEditingTitle) {
              setIsExpanded((current) => !current);
              setDateDraft(goal.targetDate);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (!isEditingTitle) {
                setIsExpanded((current) => !current);
                setDateDraft(goal.targetDate);
              }
            }
          }}
        >
          <div className="goal-main">
            <div className="goal-title-row">
              <span className={`goal-index-badge goal-index-${getGoalBadgeTone(index)}`}>
                {index}
              </span>
              {isEditingTitle ? (
                <input
                  type="text"
                  className="goal-title-input"
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onBlur={finishRename}
                  onKeyDown={handleRenameKeyDown}
                  autoFocus
                />
              ) : (
                <h3
                  className="goal-title-text"
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    startRename();
                  }}
                  title="Double-click to rename"
                >
                  {goal.title}
                </h3>
              )}
            </div>
          </div>

          <div className="goal-meta">
            <span className={`goal-status goal-status-${goalTone}`}>
              {formatDaysLabel(daysLeft)}
            </span>

            <button
              type="button"
              className="goal-delete-btn"
              onClick={(event) => {
                event.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              title="Delete goal"
              aria-label="Delete goal"
            >
              <Trash2 size={14} />
            </button>

            <span className="goal-expand-indicator" aria-hidden="true">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="goal-details" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="action-btn goal-inline-edit-btn"
              onClick={startRename}
            >
              Edit Title
            </button>

            {isOverdue ? (
              <label className="goal-date-editor">
                <span className="goal-detail-label">Set a new date</span>
                <input
                  type="date"
                  className="goal-date-input"
                  value={dateDraft}
                  onChange={(event) => setDateDraft(event.target.value)}
                  onBlur={() => {
                    if (dateDraft) {
                      updateGoalDate(category, goal.id, dateDraft);
                    }
                  }}
                />
              </label>
            ) : (
              <div className="goal-date-locked">
                <CalendarDays size={14} />
                <span>Due on {goal.targetDate}. Date unlocks after it becomes overdue.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Goal"
        message={`This will permanently delete "${goal.title}". This action cannot be undone.`}
        onConfirm={() => {
          deleteGoal(category, goal.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

function GoalSection({ category, title, description, goals, now }) {
  const { addGoal } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    addGoal(category, newTitle, newDate);
    setNewTitle('');
    setNewDate('');
    setIsAdding(false);
  };

  return (
    <section className="table-card goal-section-card">
      <div className="goal-section-header">
        <div>
          <h2 className="goal-section-title">{title}</h2>
          <p className="goal-section-desc">{description}</p>
        </div>
      </div>

      {goals.length > 0 ? (
        <div className="goal-list">
          {goals.map((goal, index) => (
            <GoalRow
              key={goal.id}
              category={category}
              goal={goal}
              now={now}
              index={index + 1}
            />
          ))}
        </div>
      ) : (
        <p className="goal-empty">No goals yet. Add one to start tracking your deadline.</p>
      )}

      <div className="goal-footer-composer">
        {isAdding ? (
          <form className="goal-create-form goal-create-form-footer" onSubmit={handleSubmit}>
            <input
              type="text"
              className="add-input goal-create-title"
              placeholder="Goal title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              autoFocus
            />
            <input
              type="date"
              className="add-input goal-create-date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />
            <div className="goal-footer-actions">
              <button
                type="button"
                className="action-btn"
                onClick={() => {
                  setIsAdding(false);
                  setNewTitle('');
                  setNewDate('');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="add-btn"
                disabled={!newTitle.trim() || !newDate}
              >
                <Plus size={16} />
                Add Goal
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="goal-footer-trigger"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={16} />
            Add goal
          </button>
        )}
      </div>
    </section>
  );
}

export default function GoalsView() {
  const { goals } = useStore();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());

    const timeoutId = window.setTimeout(updateNow, 0);
    const intervalId = window.setInterval(updateNow, 60 * 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="focus-view">
      <div className="workspace-header">
        <div>
          <h1 className="workspace-title">Goals</h1>
          <p className="workspace-desc">
            Keep personal and career goals visible with deadline-based urgency.
          </p>
        </div>
      </div>

      <div className="goal-sections">
        {goalSections.map((section) => (
          <GoalSection
            key={section.key}
            category={section.key}
            title={section.title}
            description={section.description}
            goals={goals[section.key]}
            now={now}
          />
        ))}
      </div>
    </section>
  );
}
