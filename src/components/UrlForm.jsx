import { FiSearch, FiClock, FiRotateCcw } from 'react-icons/fi';

function UrlForm({
  value,
  onChange,
  onSubmit,
  validationError,
  isLoading,
  inputRef,
  recentSearches,
  onRecentSearch,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(value);
  };

  return (
    <div className="audit-form panel panel--centered">
      <form className="audit-form__card" onSubmit={handleSubmit} noValidate>
        <label className="audit-form__label" htmlFor="website-url">
          Enter a website URL
        </label>

        <div className={`audit-form__input-shell ${validationError ? 'audit-form__input-shell--error' : ''}`}>
          <FiSearch className="audit-form__input-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            id="website-url"
            className="audit-form__input"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(validationError)}
            aria-describedby="url-help url-error"
            disabled={isLoading}
          />
          <button type="submit" className="button button--primary audit-form__submit" disabled={isLoading}>
            {isLoading ? <FiClock aria-hidden="true" /> : <FiSearch aria-hidden="true" />}
            {isLoading ? 'Analyzing your website…' : 'Analyze Website'}
          </button>
        </div>

        <p id="url-help" className="audit-form__helper">
          The audit works with public URLs. Press Enter to analyze instantly.
        </p>

        {validationError ? (
          <p id="url-error" className="audit-form__error" role="alert">
            {validationError}
          </p>
        ) : null}

        {recentSearches.length > 0 ? (
          <div className="audit-form__recent">
            <div className="audit-form__recent-header">
              <span className="audit-form__recent-title">Recent searches</span>
              <FiRotateCcw aria-hidden="true" />
            </div>
            <div className="chip-list" aria-label="Recent website searches">
              {recentSearches.map((recentSearch) => (
                <button key={recentSearch} type="button" className="chip" onClick={() => onRecentSearch(recentSearch)}>
                  {recentSearch}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}

export default UrlForm;
