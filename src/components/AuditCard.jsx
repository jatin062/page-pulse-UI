function AuditCard({ title, subtitle, icon, actions, children, className = '' }) {
  return (
    <section className={`panel audit-card ${className}`.trim()}>
      <div className="panel__header">
        <div className="panel__title-group">
          <div className="panel__icon" aria-hidden="true">
            {icon}
          </div>
          <div>
            <h3 className="panel__title">{title}</h3>
            {subtitle ? <p className="panel__subtitle">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="panel__actions">{actions}</div> : null}
      </div>

      <div className="panel__body">{children}</div>
    </section>
  );
}

export default AuditCard;
