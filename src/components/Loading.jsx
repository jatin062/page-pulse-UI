import { FiLoader } from 'react-icons/fi';

function Loading() {
  return (
    <section className="loading panel" aria-busy="true" aria-live="polite">
      <div className="loading__header">
        <span className="loading__spinner" aria-hidden="true">
          <FiLoader />
        </span>
        <div>
          <p className="loading__title">Analyzing Website...</p>
          <p className="loading__subtitle">Gathering metadata, headers, and SEO signals.</p>
        </div>
      </div>

      <div className="loading__grid">
        <div className="skeleton-card">
          <span className="skeleton skeleton--line skeleton--long" />
          <span className="skeleton skeleton--line" />
          <span className="skeleton skeleton--line skeleton--short" />
        </div>
        <div className="skeleton-card">
          <span className="skeleton skeleton--line skeleton--long" />
          <span className="skeleton skeleton--line" />
          <span className="skeleton skeleton--line skeleton--short" />
        </div>
        <div className="skeleton-card">
          <span className="skeleton skeleton--line skeleton--long" />
          <span className="skeleton skeleton--line" />
          <span className="skeleton skeleton--line skeleton--short" />
        </div>
      </div>
    </section>
  );
}

export default Loading;
