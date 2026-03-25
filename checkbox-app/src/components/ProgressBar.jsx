export default function ProgressBar({ checked, total }) {
  const completed = checked.filter(Boolean).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-section">
      <div className="progress-stats">
        <span className="progress-text">
          {completed} / {total} completed
        </span>
        <span className="progress-percent">{percentage}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
