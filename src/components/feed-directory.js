// Feed Directory JavaScript functionality
// Simple, focused functions for maintainability

// Simple debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Simple fuzzy search
function fuzzyMatch(text, query) {
  if (!query) return true;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let textIndex = 0;
  let queryIndex = 0;
  while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
    if (lowerQuery[queryIndex] === lowerText[textIndex]) queryIndex++;
    textIndex++;
  }
  return queryIndex === lowerQuery.length;
}

// Search functionality
function setupSearch(searchInput, feedItems) {
  if (!searchInput) return;

  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value.toLowerCase();
    feedItems.forEach(item => {
      const searchableText = item.dataset.searchable?.toLowerCase() || '';
      item.style.display = fuzzyMatch(searchableText, query) ? 'flex' : 'none';
    });
  }, 150));
}

// Instance URL updates
function setupInstanceUrlUpdates(instanceInput, defaultInstanceUrl, updateFeedUrls) {
  if (!instanceInput) return;

  instanceInput.addEventListener('input', debounce((e) => {
    const instanceUrl = e.target.value || defaultInstanceUrl;
    updateFeedUrls(instanceUrl);
  }, 300));
}

// Parameter forms toggle
function setupParameterForms(updateFeedUrls) {
  document.querySelectorAll('.feed-directory__configure-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const targetId = e.target.closest('button')?.dataset.target;
      const form = document.getElementById(targetId);
      if (!form) return;

      const isExpanded = !form.hidden;
      form.hidden = isExpanded;
      const button = e.target.closest('button');
      if (button) {
        button.setAttribute('aria-expanded', !isExpanded);
        const span = button.querySelector('span');
        if (span) {
          span.textContent = isExpanded ? 'Configure' : 'Hide';
        }
      }

      if (!isExpanded) updateFeedUrls();
    });
  });
}

// Close forms
function setupCloseForms() {
  document.querySelectorAll('[data-close-form]').forEach(button => {
    button.addEventListener('click', (e) => {
      const form = e.target.closest('.feed-directory__item-params');
      const toggle = document.querySelector(`[data-target="${form?.id}"]`);
      if (!form || !toggle) return;

      form.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      const span = toggle.querySelector('span');
      if (span) {
        span.textContent = 'Configure';
      }
    });
  });
}

// Parameter input updates
function setupParameterInputs(updateFeedUrls) {
  document.querySelectorAll('.feed-directory__param-input').forEach(input => {
    input.addEventListener('input', debounce(() => updateFeedUrls(), 200));
  });
}

// Update feed URLs
function createUpdateFeedUrlsFunction() {
  return function updateFeedUrls(instanceUrl) {
    document.querySelectorAll('[data-feed-url]').forEach(link => {
      const item = link.closest('[data-domain]');
      if (!item) return;

      const domain = item.dataset.domain;
      const name = item.dataset.name;
      if (!domain || !name) return;

      // Get parameters
      const params = {};
      item.querySelectorAll('[data-param-key]').forEach(input => {
        if (input.value) params[input.dataset.paramKey] = input.value;
      });

      // Build URL
      let url = instanceUrl.endsWith("/") ? instanceUrl : `${instanceUrl}/`;
      url += `${domain}/${name}.rss`;

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => queryParams.append(key, value));
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      link.href = url;
    });
  }
}

// Main initialization
function initializeFeedDirectory() {
  const defaultInstanceUrl = atob("aHR0cHM6Ly8xLmgyci53b3JrZXJzLmRldi8=");
  let instanceUrl = defaultInstanceUrl;
  const searchInput = document.getElementById('search-input');
  const feedItems = document.querySelectorAll('[data-domain]');
  const instanceInput = document.getElementById('instance-url-input');

  // Initialize instance URL field
  if (instanceInput) {
    instanceInput.value = defaultInstanceUrl;
    instanceUrl = defaultInstanceUrl;
  }

  // Create update function with current instance URL
  const updateFeedUrls = createUpdateFeedUrlsFunction();

  // Setup all functionality
  setupSearch(searchInput, feedItems);
  setupInstanceUrlUpdates(instanceInput, defaultInstanceUrl, (newUrl) => {
    instanceUrl = newUrl;
    updateFeedUrls(instanceUrl);
  });
  setupParameterForms(() => updateFeedUrls(instanceUrl));
  setupCloseForms();
  setupParameterInputs(() => updateFeedUrls(instanceUrl));

  // Initialize feed URLs on page load
  updateFeedUrls(instanceUrl);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeedDirectory);
} else {
  initializeFeedDirectory();
}
