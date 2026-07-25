import { useEffect, useMemo, useRef, useState } from 'react';
import { FiExternalLink, FiShield, FiZap, FiSearch, FiCopy, FiServer } from 'react-icons/fi';
import { RiCheckLine, RiFileCopyLine, RiDownload2Line, RiDeleteBinLine } from 'react-icons/ri';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UrlForm from '../components/UrlForm';
import AuditCard from '../components/AuditCard';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { auditWebsite } from '../services/auditService';
import { isValidURL, normalizeUrl } from '../utils/validators';
import heroIllustration from '../assets/hero-illustration.svg';

const RECENT_SEARCHES_KEY = 'page-pulse-recent-searches';

function getStoredRecentSearches() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches) {
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

function formatBadgeTone(status) {
  if (typeof status !== 'number') {
    return 'neutral';
  }

  if (status >= 200 && status < 300) {
    return 'success';
  }

  if (status >= 300 && status < 400) {
    return 'warning';
  }

  return 'danger';
}

function formatResponseTone(responseTime) {
  if (responseTime <= 500) {
    return 'success';
  }

  if (responseTime <= 1000) {
    return 'warning';
  }

  return 'danger';
}

function buildRecommendations(report) {
  if (!report) {
    return [];
  }

  const recommendations = [];

  // Page title checks
  if (!report.title) {
    recommendations.push({ tone: 'danger', title: 'Missing page title', message: 'Add a unique, descriptive page title for search engines.' });
  } else if (report.title.length > 60) {
    recommendations.push({ tone: 'warning', title: 'Long page title', message: `Title is ${report.title.length} characters (recommended: 50-60 chars).` });
  } else {
    recommendations.push({ tone: 'success', title: 'Page title optimal', message: `Title tag length (${report.title.length} chars) is within search limits.` });
  }

  // Meta description checks
  if (!report.metaDescription) {
    recommendations.push({ tone: 'danger', title: 'Missing meta description', message: 'Write a concise meta description tag to improve search click rates.' });
  } else if (report.metaDescription.length > 160) {
    recommendations.push({ tone: 'warning', title: 'Long meta description', message: `Meta description is ${report.metaDescription.length} characters (recommended: 120-160 chars).` });
  } else {
    recommendations.push({ tone: 'success', title: 'Meta description optimal', message: `Meta description length (${report.metaDescription.length} chars) is well-optimized.` });
  }

  // H1 heading checks
  if (!report.h1Count) {
    recommendations.push({ tone: 'warning', title: 'Missing H1 heading', message: 'Add a single primary <h1> heading to clarify page topic.' });
  } else {
    recommendations.push({ tone: 'success', title: 'Primary H1 heading present', message: `Found ${report.h1Count} primary heading(s) on the page.` });
  }

  // Image Alt checks
  if (report.imagesMissingAlt > 0) {
    recommendations.push({ tone: 'warning', title: 'Image alt attributes warning', message: `${report.imagesMissingAlt} of ${report.totalImages || report.imagesMissingAlt} image(s) are missing alt text.` });
  } else if (report.totalImages > 0) {
    recommendations.push({ tone: 'success', title: 'All images have alt text', message: `All ${report.totalImages} image(s) include descriptive alt tags.` });
  }

  // HTTPS Security check
  if (report.httpsEnabled) {
    recommendations.push({ tone: 'success', title: 'HTTPS SSL encryption enabled', message: 'Website uses secure HTTPS connection.' });
  } else {
    recommendations.push({ tone: 'danger', title: 'Insecure HTTP connection', message: 'Migrate to HTTPS to ensure security and prevent search penalties.' });
  }

  // Canonical tag check
  if (report.canonical) {
    recommendations.push({ tone: 'success', title: 'Canonical URL declared', message: `Canonical tag is set to ${report.canonical}` });
  }

  // Response time checks
  if (report.responseTime > 1000) {
    recommendations.push({ tone: 'danger', title: 'Slow response time', message: `Server response time is ${report.responseTime} ms. Optimize backend performance.` });
  } else if (report.responseTime <= 500) {
    recommendations.push({ tone: 'success', title: 'Fast response speed', message: `Server responded quickly in ${report.responseTime} ms.` });
  } else {
    recommendations.push({ tone: 'warning', title: 'Moderate response speed', message: `Server response time is ${report.responseTime} ms.` });
  }

  return recommendations;
}

function buildExportPayload(report, recommendations, url) {
  return {
    scannedUrl: url,
    generatedAt: new Date().toISOString(),
    report,
    recommendations,
  };
}

function getDomainName(url) {
  try {
    const raw = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(raw);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function calculateSeoScore(report) {
  if (!report) return 0;
  let score = 100;
  if (!report.title) score -= 20;
  else if (report.title.length > 60) score -= 10;

  if (!report.metaDescription) score -= 20;
  else if (report.metaDescription.length > 160) score -= 10;

  if (!report.h1Count) score -= 15;
  if (report.imagesMissingAlt > 0) score -= 10;
  if (report.responseTime > 1000) score -= 15;
  else if (report.responseTime > 500) score -= 5;
  if (!report.httpsEnabled) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function Home({ theme, onToggleTheme, notify }) {
  const [url, setUrl] = useState('');
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(getStoredRecentSearches);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (audit && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [audit]);

  const recommendations = useMemo(() => buildRecommendations(audit), [audit]);

  const reportSummary = useMemo(() => {
    if (!audit) {
      return null;
    }

    return {
      statusTone: formatBadgeTone(audit.status),
      responseTone: formatResponseTone(audit.responseTime),
      titleLength: audit.title ? audit.title.length : 0,
      metaDescriptionLength: audit.metaDescription ? audit.metaDescription.length : 0,
    };
  }, [audit]);

  const handleUrlChange = (nextUrl) => {
    setUrl(nextUrl);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleRecentSearch = (recentUrl) => {
    setUrl(recentUrl);
    setValidationError('');
    inputRef.current?.focus();
  };

  const updateRecentSearches = (nextUrl) => {
    const normalizedUrl = nextUrl.trim();
    const nextRecentSearches = [normalizedUrl, ...recentSearches.filter((entry) => entry !== normalizedUrl)].slice(0, 5);
    setRecentSearches(nextRecentSearches);
    saveRecentSearches(nextRecentSearches);
  };

  const handleSubmit = async (submittedUrl) => {
    const candidateUrl = normalizeUrl(submittedUrl);

    if (!isValidURL(submittedUrl)) {
      setValidationError('Enter a valid website URL (e.g., https://example.com or example.com).');
      notify('danger', 'Invalid URL', 'Please enter a complete website URL before auditing.');
      return;
    }

    setUrl(candidateUrl);
    setLoading(true);
    setValidationError('');
    setError(null);

    try {
      const result = await auditWebsite(candidateUrl);
      setAudit(result);
      updateRecentSearches(candidateUrl);
      notify('success', 'Audit complete', 'Your SEO summary is ready.');
    } catch (requestError) {
      if (requestError?.type === 'aborted') {
        return;
      }

      const nextError = requestError || { type: 'unknown', title: 'Something went wrong', message: 'Unable to complete the audit.' };
      setError(nextError);
      setAudit(null);
      notify('danger', nextError.title || 'Audit failed', nextError.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (url.trim()) {
      handleSubmit(url);
    } else {
      inputRef.current?.focus();
    }
  };

  const handleClearResults = () => {
    setAudit(null);
    setError(null);
    setValidationError('');
    notify('neutral', 'Cleared', 'The current audit report was removed.');
  };

  const handleCopyResults = async () => {
    if (!audit) {
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(buildExportPayload(audit, recommendations, url), null, 2));
      notify('success', 'Copied', 'The SEO report JSON was copied to your clipboard.');
    } catch {
      notify('danger', 'Copy failed', 'Your browser blocked clipboard access.');
    }
  };

  const handleExportResults = () => {
    if (!audit) {
      return;
    }

    const payload = buildExportPayload(audit, recommendations, url);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `page-pulse-audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    notify('success', 'Exported', 'Your SEO audit report was downloaded as JSON.');
  };

  const renderAuditBody = () => {
    if (loading) {
      return <Loading />;
    }

    if (error) {
      return <ErrorMessage error={error} onRetry={handleRetry} />;
    }

    if (!audit) {
      return <EmptyState illustration={heroIllustration} />;
    }

    const score = calculateSeoScore(audit);
    const scoreTone = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
    const domain = getDomainName(audit.url);

    return (
      <div className="report" ref={resultsRef}>
        <AuditCard
          title="Audit Summary"
          subtitle="Comprehensive SEO health & technical page performance report."
          actions={(
            <div className="report-actions">
              <button type="button" className="button button--secondary button--small" onClick={handleCopyResults}>
                <RiFileCopyLine aria-hidden="true" />
                Copy Results
              </button>
              <button type="button" className="button button--secondary button--small" onClick={handleExportResults}>
                <RiDownload2Line aria-hidden="true" />
                Export JSON
              </button>
              <button type="button" className="button button--ghost button--small" onClick={handleClearResults}>
                <RiDeleteBinLine aria-hidden="true" />
                Clear Results
              </button>
            </div>
          )}
        >
          <div className="summary-card">
            <div className="summary-card__meta">
              <p className="summary-card__eyebrow">Audited Target</p>
              <a className="summary-card__url" href={audit.url} target="_blank" rel="noreferrer">
                {audit.url}
                <FiExternalLink aria-hidden="true" />
              </a>
            </div>
            <div className="summary-card__badges" aria-label="Status and score summary">
              <div className={`score-badge score-badge--${scoreTone}`}>
                <span className="score-badge__value">{score}</span>
                <span className="score-badge__label">/100 Health Score</span>
              </div>
              <span className={`badge badge--${reportSummary.statusTone}`}>HTTP {audit.status}</span>
              <span className={`badge badge--${reportSummary.responseTone}`}>{audit.responseTime} ms</span>
            </div>
          </div>

          <div className="stat-grid">
            <StatCard label="Status Code" value={audit.status} hint="HTTP response code" tone={reportSummary.statusTone} />
            <StatCard label="Response Speed" value={`${audit.responseTime} ms`} hint="Network load speed" tone={reportSummary.responseTone} />
            <StatCard label="Word Count" value={audit.wordCount} hint="Approx. visible words" tone="neutral" />
            <StatCard label="Missing Alt Images" value={`${audit.imagesMissingAlt} / ${audit.totalImages}`} hint="Accessibility check" tone={audit.imagesMissingAlt > 0 ? 'warning' : 'success'} />
            <StatCard label="Primary Headings" value={`${audit.h1Count} H1`} hint="Heading structure" tone={audit.h1Count > 0 ? 'success' : 'warning'} />
            <StatCard label="Title Length" value={`${reportSummary.titleLength} ch`} hint="Optimal: 50-60 chars" tone={reportSummary.titleLength > 60 ? 'warning' : reportSummary.titleLength === 0 ? 'danger' : 'success'} />
            <StatCard label="Meta Desc Length" value={`${reportSummary.metaDescriptionLength} ch`} hint="Optimal: 120-160 chars" tone={reportSummary.metaDescriptionLength > 160 ? 'warning' : reportSummary.metaDescriptionLength === 0 ? 'danger' : 'success'} />
          </div>

          <div className="detail-sections">
            {/* 1. SERP Snippet Box */}
            <div className="serp-box">
              <div className="serp-box__header">
                <div className="serp-box__title-group">
                  <FiSearch className="serp-box__icon" />
                  <span>Google Search Result Snippet Preview</span>
                </div>
                <span className="serp-box__tag">SERP Preview</span>
              </div>
              <div className="serp-snippet">
                <div className="serp-snippet__cite">
                  <div className="serp-snippet__favicon-placeholder">
                    {domain.charAt(0).toUpperCase()}
                  </div>
                  <div className="serp-snippet__url-group">
                    <span className="serp-snippet__site-name">{domain}</span>
                    <span className="serp-snippet__url">{audit.url}</span>
                  </div>
                </div>
                <h3 className="serp-snippet__title">
                  {audit.title || 'Missing Page Title'}
                </h3>
                <p className="serp-snippet__desc">
                  {audit.metaDescription || 'No meta description snippet provided. Search engines will automatically extract paragraph text from the page.'}
                </p>
              </div>
            </div>

            {/* 2. Page Title & Meta Description Cards */}
            <div className="meta-inspectors">
              <div className="inspector-card">
                <div className="inspector-card__header">
                  <div className="inspector-card__label-group">
                    <FiSearch className="inspector-card__icon" />
                    <h4>Page Title</h4>
                  </div>
                  <span className={`pill-badge pill-badge--${reportSummary.titleLength === 0 ? 'danger' : reportSummary.titleLength > 60 ? 'warning' : 'success'}`}>
                    {reportSummary.titleLength} / 60 chars
                  </span>
                </div>
                <div className="inspector-card__content">
                  <p className={`inspector-card__text ${!audit.title ? 'inspector-card__text--empty' : ''}`}>
                    {audit.title || 'No title tag found on this webpage.'}
                  </p>
                  {audit.title && (
                    <button
                      type="button"
                      className="copy-chip"
                      onClick={() => {
                        navigator.clipboard.writeText(audit.title);
                        notify('success', 'Copied', 'Title tag copied to clipboard.');
                      }}
                    >
                      <FiCopy /> Copy Title
                    </button>
                  )}
                </div>
              </div>

              <div className="inspector-card">
                <div className="inspector-card__header">
                  <div className="inspector-card__label-group">
                    <FiZap className="inspector-card__icon" />
                    <h4>Meta Description</h4>
                  </div>
                  <span className={`pill-badge pill-badge--${reportSummary.metaDescriptionLength === 0 ? 'danger' : reportSummary.metaDescriptionLength > 160 ? 'warning' : 'success'}`}>
                    {reportSummary.metaDescriptionLength} / 160 chars
                  </span>
                </div>
                <div className="inspector-card__content">
                  <p className={`inspector-card__text ${!audit.metaDescription ? 'inspector-card__text--empty' : ''}`}>
                    {audit.metaDescription || 'No meta description tag found on this webpage.'}
                  </p>
                  {audit.metaDescription && (
                    <button
                      type="button"
                      className="copy-chip"
                      onClick={() => {
                        navigator.clipboard.writeText(audit.metaDescription);
                        notify('success', 'Copied', 'Meta description copied to clipboard.');
                      }}
                    >
                      <FiCopy /> Copy Description
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Bottom Row: Recommendations & Technical Signals */}
            <div className="bottom-grid">
              <AuditCard title="SEO Recommendations" subtitle="Actionable improvements to boost rankings." icon={<FiShield aria-hidden="true" />}>
                <ul className="recommendation-list" aria-live="polite">
                  {recommendations.map((recommendation) => (
                    <li key={`${recommendation.title}-${recommendation.message}`} className={`recommendation-item recommendation-item--${recommendation.tone}`}>
                      <span className="recommendation-item__icon" aria-hidden="true">
                        {recommendation.tone === 'success' ? <RiCheckLine /> : recommendation.tone === 'warning' ? '⚠' : '✕'}
                      </span>
                      <div>
                        <p className="recommendation-item__title">{recommendation.title}</p>
                        <p className="recommendation-item__message">{recommendation.message}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </AuditCard>

              <div className="tech-signals-card">
                <div className="tech-signals-card__header">
                  <FiServer />
                  <h4>Technical & Security Signals</h4>
                </div>
                <div className="tech-signals-grid">
                  <div className="tech-signal-item">
                    <span className="tech-signal-item__label">HTTPS Security</span>
                    <span className={`tech-signal-item__value ${audit.httpsEnabled ? 'text-success' : 'text-danger'}`}>
                      {audit.httpsEnabled ? '🔒 Secured (HTTPS)' : '⚠️ Insecure (HTTP)'}
                    </span>
                  </div>
                  <div className="tech-signal-item">
                    <span className="tech-signal-item__label">Canonical Tag</span>
                    <span className="tech-signal-item__value" title={audit.canonical || 'Not specified'}>
                      {audit.canonical || 'Not specified'}
                    </span>
                  </div>
                  <div className="tech-signal-item">
                    <span className="tech-signal-item__label">Language</span>
                    <span className="tech-signal-item__value">
                      {audit.language ? audit.language.toUpperCase() : 'Not declared'}
                    </span>
                  </div>
                  <div className="tech-signal-item">
                    <span className="tech-signal-item__label">Page Size</span>
                    <span className="tech-signal-item__value">
                      {audit.pageSizeKb ? `${audit.pageSizeKb} KB` : 'N/A'}
                    </span>
                  </div>
                  <div className="tech-signal-item">
                    <span className="tech-signal-item__label">Internal / External Links</span>
                    <span className="tech-signal-item__value">
                      {audit.internalLinks} int / {audit.externalLinks} ext
                    </span>
                  </div>
                  <div className="tech-signal-item">
                    <span className="tech-signal-item__label">Server Header</span>
                    <span className="tech-signal-item__value">
                      {audit.serverHeader || 'Hidden / N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AuditCard>
      </div>
    );
  };

  return (
    <div className="page-shell">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="page-main">
        <section className="hero section" id="about">
          <div className="hero__content">
            <p className="hero__eyebrow">Instant website SEO insights</p>
            <h1 className="hero__title">Website SEO Audit Tool</h1>
            <p className="hero__subtitle">
              Analyze any website in seconds and receive actionable SEO insights, including HTTP status, page title, meta description, heading structure, image accessibility, response time, and estimated word count.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#audit-form">
                Analyze Website
              </a>
              <a className="button button--secondary" href="#audit-form">
                Learn More
              </a>
            </div>
          </div>

          <div className="hero__media" aria-hidden="true">
            <img className="hero__illustration" src={heroIllustration} alt="" />
          </div>
        </section>

        <section className="section" id="audit-form">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Audit URL</p>
            <h2 className="section-heading__title">Analyze a website and inspect the SEO report.</h2>
          </div>

          <UrlForm
            value={url}
            onChange={handleUrlChange}
            onSubmit={handleSubmit}
            validationError={validationError}
            isLoading={loading}
            inputRef={inputRef}
            recentSearches={recentSearches}
            onRecentSearch={handleRecentSearch}
          />
        </section>

        <section className="section report-section" aria-live="polite">
          {renderAuditBody()}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
