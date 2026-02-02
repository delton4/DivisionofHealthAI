/**
 * Global Search - Client-side search across all content
 * Searches researchers, projects, and publications
 */

(function() {
  'use strict';

  // Create search overlay
  const searchOverlay = document.createElement('div');
  searchOverlay.className = 'search-overlay';
  searchOverlay.innerHTML = `
    <div class="search-container">
      <div class="search-header">
        <input type="text" id="search-input" class="search-input" placeholder="Search researchers, projects, publications..." autocomplete="off">
        <button class="search-close" aria-label="Close search">&times;</button>
      </div>
      <div class="search-results" id="search-results">
        <div class="search-hint">Type at least 2 characters to search...</div>
      </div>
    </div>
  `;
  document.body.appendChild(searchOverlay);

  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const closeBtn = searchOverlay.querySelector('.search-close');

  let allData = null;

  // Determine base URL for data fetching
  function getBaseUrl() {
    const path = window.location.pathname;
    if (path.includes('/researchers/') || path.includes('/projects/') || path.includes('/publications/')) {
      return '../';
    }
    return '';
  }

  // Load all data
  async function loadData() {
    if (allData) return allData;

    try {
      const baseUrl = getBaseUrl();
      const [researchers, projects, publications] = await Promise.all([
        fetch(baseUrl + 'data/researchers.json').then(r => r.json()).catch(() => []),
        fetch(baseUrl + 'data/projects.json').then(r => r.json()).catch(() => []),
        fetch(baseUrl + 'data/publications.json').then(r => r.json()).catch(() => [])
      ]);

      allData = {
        researchers: researchers.map(function(item) { return Object.assign({}, item, { type: 'researcher' }); }),
        projects: projects.map(function(item) { return Object.assign({}, item, { type: 'project' }); }),
        publications: publications.map(function(item) { return Object.assign({}, item, { type: 'publication' }); })
      };

      return allData;
    } catch (error) {
      console.error('Error loading search data:', error);
      return { researchers: [], projects: [], publications: [] };
    }
  }

  // Simple search function
  function search(query) {
    if (!query || query.length < 2) return [];

    var lowerQuery = query.toLowerCase();
    var results = [];

    ['researchers', 'projects', 'publications'].forEach(function(category) {
      allData[category].forEach(function(item) {
        var searchableText = [
          item.name || '',
          item.title || '',
          item.about || '',
          item.abstract || '',
          item.journal || '',
          item.pillar || ''
        ].join(' ').toLowerCase();

        if (searchableText.includes(lowerQuery)) {
          results.push(item);
        }
      });
    });

    return results.slice(0, 10); // Limit to 10 results
  }

  // Display results
  function displayResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
      return;
    }

    var baseUrl = getBaseUrl();
    var html = results.map(function(item) {
      var title = item.name || item.title || 'Untitled';
      var subtitle = (item.title && item.name) ? item.title : (item.journal || '');
      var description = (item.about || item.abstract || '').substring(0, 150);
      var typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
      var path = baseUrl + (item.path || '');
      var pillarBadge = item.pillar ? '<span class="pillar-badge pillar-' + item.pillar.toLowerCase() + '">' + item.pillar + '</span>' : '';

      return '<a href="' + path + '" class="search-result-item">' +
        '<div class="search-result-header">' +
          '<span class="search-result-type">' + typeLabel + '</span>' +
          pillarBadge +
        '</div>' +
        '<h3 class="search-result-title">' + title + '</h3>' +
        (subtitle ? '<p class="search-result-subtitle">' + subtitle + '</p>' : '') +
        (description ? '<p class="search-result-description">' + description + '...</p>' : '') +
      '</a>';
    }).join('');

    searchResults.innerHTML = html;
  }

  // Handle search input
  var searchTimeout;
  searchInput.addEventListener('input', async function() {
    var query = this.value.trim();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
      searchResults.innerHTML = '<div class="search-hint">Type at least 2 characters to search...</div>';
      return;
    }

    searchTimeout = setTimeout(async function() {
      if (!allData) {
        searchResults.innerHTML = '<div class="search-loading">Loading...</div>';
        await loadData();
      }

      var results = search(query);
      displayResults(results);
    }, 300);
  });

  // Open search
  function openSearch() {
    searchOverlay.classList.add('active');
    searchInput.focus();
    document.body.style.overflow = 'hidden';
    if (!allData) loadData();
  }

  // Close search
  function closeSearch() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '<div class="search-hint">Type at least 2 characters to search...</div>';
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeSearch);
  searchOverlay.addEventListener('click', function(e) {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      closeSearch();
    }
  });

  // Add search button to header
  var nav = document.querySelector('.nav');
  if (nav) {
    var searchBtn = document.createElement('button');
    searchBtn.className = 'search-btn';
    searchBtn.innerHTML = '<span class="search-icon">&#128269;</span> Search';
    searchBtn.setAttribute('aria-label', 'Open search (Ctrl+K)');
    searchBtn.addEventListener('click', openSearch);
    nav.appendChild(searchBtn);
  }

})();
