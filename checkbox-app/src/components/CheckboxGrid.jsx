import useStore from '../store/store';

export default function CheckboxGrid({ tabId, tableId, checked, startIndex = 0, allChecked = [] }) {
  const toggleCheckbox = useStore((s) => s.toggleCheckbox);

  // Count consecutive checked from the start for linear ticking
  let checkedCount = 0;
  for (let i = 0; i < allChecked.length; i++) {
    if (allChecked[i]) checkedCount++;
    else break;
  }

  return (
    <div className="checkbox-grid">
      {checked.map((isChecked, localIndex) => {
        const globalIndex = startIndex + localIndex;

        // Linear ticking: can only toggle the next unchecked (checkedCount)
        // or un-toggle the last checked (checkedCount - 1)
        const canToggle =
          globalIndex === checkedCount || globalIndex === checkedCount - 1;

        return (
          <label
            key={globalIndex}
            className={`checkbox-item ${isChecked ? 'checked' : ''} ${!canToggle ? 'disabled' : ''}`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                if (canToggle) toggleCheckbox(tabId, tableId, globalIndex);
              }}
              disabled={!canToggle}
              className="checkbox-input"
            />
            <span className="checkbox-box">
              {isChecked && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path
                    d="M1 5L4.5 8.5L11 1.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="checkbox-number">{globalIndex + 1}</span>
          </label>
        );
      })}
    </div>
  );
}
