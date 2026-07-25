import { FiCheckCircle, FiInfo, FiAlertTriangle, FiXCircle, FiX } from 'react-icons/fi';

const toastIcons = {
  success: FiCheckCircle,
  neutral: FiInfo,
  warning: FiAlertTriangle,
  danger: FiXCircle,
};

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((toast) => {
        const ToastIcon = toastIcons[toast.tone] || FiInfo;

        return (
          <div key={toast.id} className={`toast toast--${toast.tone}`} role={toast.tone === 'danger' ? 'alert' : 'status'}>
            <div className="toast__icon" aria-hidden="true">
              <ToastIcon />
            </div>
            <div className="toast__content">
              <p className="toast__title">{toast.title}</p>
              <p className="toast__message">{toast.message}</p>
            </div>
            <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
              <FiX aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastStack;
