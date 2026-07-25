import { FiArrowUpRight } from 'react-icons/fi';

function EmptyState({ illustration }) {
  return (
    <section className="empty-state panel panel--centered">
      <img className="empty-state__illustration" src={illustration} alt="" aria-hidden="true" />
      <h3 className="empty-state__title">Enter a website URL above to generate an SEO audit report.</h3>
      <p className="empty-state__message">
        The report will show response status, title quality, meta description signals, H1 usage, image alt coverage, and performance hints.
      </p>
      <a className="button button--secondary" href="#audit-form">
        <FiArrowUpRight aria-hidden="true" />
        Start Auditing
      </a>
    </section>
  );
}

export default EmptyState;
