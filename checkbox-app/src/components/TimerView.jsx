import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import useStore from '../store/store';

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

export default function TimerView() {
  const { timer, startTimer, resetTimer, syncTimer } = useStore();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const updateClock = () => {
      const currentTime = Date.now();
      syncTimer(currentTime);
      setNow(currentTime);
    };

    const timeoutId = window.setTimeout(updateClock, 0);

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [syncTimer]);

  useEffect(() => {
    if (timer.isRunning && now > 0) {
      syncTimer(now);
    }
  }, [now, timer.isRunning, syncTimer]);

  const remainingMs = timer.isRunning
    ? now > 0
      ? Math.max(0, (timer.endsAt || 0) - now)
      : timer.remainingMs
    : timer.remainingMs;
  const elapsedMs = Math.max(0, timer.durationMs - remainingMs);
  const progress = useMemo(
    () => elapsedMs / timer.durationMs,
    [elapsedMs, timer.durationMs]
  );

  const radius = 136;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <section className="focus-view">
      <div className="workspace-header timer-header">
        <div>
          <h1 className="workspace-title">Timer</h1>
          <p className="workspace-desc">
            Start a fixed two-hour focus block. There is no pause, only start and reset.
          </p>
        </div>
      </div>

      <div className="table-card timer-card">
        <div className="timer-circle-shell">
          <svg
            className="timer-ring"
            viewBox="0 0 320 320"
            role="img"
            aria-label="Timer progress"
          >
            <circle className="timer-ring-track" cx="160" cy="160" r={radius} />
            <circle
              className="timer-ring-progress"
              cx="160"
              cy="160"
              r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: dashOffset,
              }}
            />
          </svg>

          <div className="timer-circle-content">
            <div className="timer-icon">
              <TimerIcon size={24} />
            </div>
            <p className="timer-label">
              {timer.isRunning ? 'Focus Session Running' : 'Ready To Start'}
            </p>
            <div className="timer-display">{formatTime(remainingMs)}</div>
          </div>
        </div>

        <div className="timer-progress-stats">
          <span className="goal-status goal-status-neutral">
            {Math.round(progress * 100)}% complete
          </span>
        </div>

        <div className="timer-actions">
          <button
            type="button"
            className="add-table-cta timer-action-btn timer-primary-btn"
            onClick={() => {
              const currentTime = Date.now();
              startTimer(currentTime);
              setNow(currentTime);
            }}
            disabled={timer.isRunning}
          >
            <Play size={18} />
            Start
          </button>

          <button
            type="button"
            className="timer-action-btn timer-secondary-btn"
            onClick={() => {
              resetTimer();
              setNow(Date.now());
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
