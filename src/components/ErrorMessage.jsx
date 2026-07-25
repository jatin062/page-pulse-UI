import { FiAlertTriangle, FiWifiOff, FiClock, FiServer, FiFileText } from 'react-icons/fi';

const errorIcons = {
  timeout: FiClock,
  'network-error': FiWifiOff,
  'server-error': FiServer,
  'not-found': FiFileText,
  'non-html': FiFileText,
  'invalid-url': FiAlertTriangle,
};

function ErrorMessage({ error, onRetry }) {
  const ErrorIcon = errorIcons[error?.type] || FiAlertTriangle;

  return (
    <section className="error-card panel panel--centered" role="alert">
      <div className="error-card__icon">
        <ErrorIcon aria-hidden="true" />
      </div>
      <h3 className="error-card__title">{error?.title || 'Audit failed'}</h3>
      <p className="error-card__message">{error?.message || 'We were not able to complete the audit.'}</p>
      {error?.details ? <p className="error-card__meta">{error.details}</p> : null}
      <button type="button" className="button button--primary" onClick={onRetry}>
        Try Again
      </button>
    </section>
  );
}

export default ErrorMessage;
