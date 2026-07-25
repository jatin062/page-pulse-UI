import apiClient from './apiClient';

function extractAuditPayload(responseData) {
  if (
    responseData
    && typeof responseData === 'object'
    && typeof responseData.code === 'number'
    && typeof responseData.message === 'string'
    && responseData.data
    && typeof responseData.data === 'object'
  ) {
    return responseData.data;
  }

  return responseData;
}

function isNonHtmlMessage(message) {
  return /does not point to an HTML|non-html|not an HTML/i.test(message);
}

function normalizeAuditResponse(url, responseData) {
  return {
    url,
    status: Number(responseData.status) || 200,
    responseTime: Number(responseData.responseTime) || 0,
    title: typeof responseData.pageTitle === 'string'
      ? responseData.pageTitle.trim()
      : typeof responseData.title === 'string'
        ? responseData.title.trim()
        : '',
    metaDescription: typeof responseData.metaDescription === 'string' ? responseData.metaDescription.trim() : '',
    h1Count: Number(responseData.h1Count) || 0,
    imagesMissingAlt: Number(responseData.missingAltImages ?? responseData.imagesMissingAlt) || 0,
    wordCount: Number(responseData.approximateWordCount ?? responseData.wordCount) || 0,
    canonical: typeof responseData.canonical === 'string' ? responseData.canonical.trim() : '',
    language: typeof responseData.language === 'string' ? responseData.language.trim() : '',
    totalImages: Number(responseData.totalImages) || 0,
    metaKeywords: typeof responseData.metaKeywords === 'string' ? responseData.metaKeywords.trim() : '',
    openGraphTitle: typeof responseData.openGraphTitle === 'string' ? responseData.openGraphTitle.trim() : '',
    openGraphDescription: typeof responseData.openGraphDescription === 'string' ? responseData.openGraphDescription.trim() : '',
    twitterTitle: typeof responseData.twitterTitle === 'string' ? responseData.twitterTitle.trim() : '',
    twitterDescription: typeof responseData.twitterDescription === 'string' ? responseData.twitterDescription.trim() : '',
    charset: typeof responseData.charset === 'string' ? responseData.charset.trim() : '',
    viewportMeta: typeof responseData.viewportMeta === 'string' ? responseData.viewportMeta.trim() : '',
    robotsMeta: typeof responseData.robotsMeta === 'string' ? responseData.robotsMeta.trim() : '',
    faviconUrl: typeof responseData.faviconUrl === 'string' ? responseData.faviconUrl.trim() : '',
    generatorMeta: typeof responseData.generatorMeta === 'string' ? responseData.generatorMeta.trim() : '',
    internalLinks: Number(responseData.internalLinks) || 0,
    externalLinks: Number(responseData.externalLinks) || 0,
    brokenLinkCount: Number(responseData.brokenLinkCount) || 0,
    brokenLinks: Array.isArray(responseData.brokenLinks) ? responseData.brokenLinks : [],
    pageSizeKb: Number(responseData.pageSizeKb) || 0,
    contentType: typeof responseData.contentType === 'string' ? responseData.contentType.trim() : '',
    lastModifiedHeader: typeof responseData.lastModifiedHeader === 'string' ? responseData.lastModifiedHeader.trim() : '',
    serverHeader: typeof responseData.serverHeader === 'string' ? responseData.serverHeader.trim() : '',
    httpsEnabled: Boolean(responseData.httpsEnabled),
  };
}

let inFlightController = null;

function createAbortError() {
  return {
    type: 'aborted',
    title: 'Request cancelled',
    message: 'The previous request was replaced by a newer one.',
  };
}

function mapError(error) {
  if (error?.code === 'ERR_CANCELED') {
    return createAbortError();
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      type: 'timeout',
      title: 'Request timed out',
      message: 'The request timed out. Please try again in a moment.',
    };
  }

  if (error?.response) {
    const { status, data } = error.response;
    const serverMessage = typeof data?.message === 'string' ? data.message : '';

    if (status === 400) {
      if (isNonHtmlMessage(serverMessage)) {
        return {
          type: 'non-html',
          title: 'Unsupported content',
          message: serverMessage || 'This URL does not point to an HTML webpage.',
        };
      }

      return {
        type: 'bad-request',
        title: serverMessage || 'Invalid URL',
        message: 'Please enter a valid website URL and try again.',
      };
    }

    if (status === 401) {
      return {
        type: 'unauthorized',
        title: 'Access denied',
        message: serverMessage || 'The server rejected the request.',
      };
    }

    if (status === 403) {
      return {
        type: 'forbidden',
        title: 'Access denied',
        message: serverMessage || 'You do not have permission to complete this request.',
      };
    }

    if (status === 404) {
      return {
        type: 'not-found',
        title: 'Not found',
        message: serverMessage || 'The requested endpoint could not be found.',
      };
    }

    if (status === 408) {
      return {
        type: 'timeout',
        title: 'Request timed out',
        message: serverMessage || 'The request took too long to complete.',
      };
    }

    if (status === 429) {
      return {
        type: 'rate-limited',
        title: 'Too many requests',
        message: serverMessage || 'Please wait a moment before trying again.',
      };
    }

    if (status === 415) {
      return {
        type: 'non-html',
        title: 'Unsupported content',
        message: serverMessage || 'This URL does not point to an HTML webpage.',
      };
    }

    if (status === 502) {
      return {
        type: 'server-error',
        title: 'Connection failed',
        message: serverMessage || 'Unable to connect to the target website.',
      };
    }

    if (status >= 500) {
      return {
        type: 'server-error',
        title: 'Server error',
        message: serverMessage || 'The server is currently unavailable. Please try again shortly.',
      };
    }

    return {
      type: 'request-error',
      title: 'Audit failed',
      message: serverMessage || 'We could not complete the audit request.',
    };
  }

  return {
    type: 'network-error',
    title: 'Network error',
    message: 'Unable to reach the server. Check your connection and try again.',
  };
}

export async function auditWebsite(url) {
  if (inFlightController) {
    inFlightController.abort();
  }

  const controller = new AbortController();
  inFlightController = controller;

  try {
    const response = await apiClient.post('/v1/audit', { url }, { signal: controller.signal });
    const payload = extractAuditPayload(response.data);
    return normalizeAuditResponse(url, payload);
  } catch (error) {
    throw mapError(error);
  } finally {
    if (inFlightController === controller) {
      inFlightController = null;
    }
  }
}
