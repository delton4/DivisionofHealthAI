/**
 * Theme Toggle - Theo Mode Implementation
 * Handles switching between light mode and Theo mode (dark theme)
 */

(function() {
  'use strict';

  // Get elements
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Check for saved theme preference or default to 'light'
  const savedTheme = localStorage.getItem('theme');
  const currentTheme = savedTheme || 'light';

  // Set initial theme
  html.setAttribute('data-theme', currentTheme);

  // Update toggle button text/icon based on current theme
  function updateToggleButton(theme) {
    if (!themeToggle) return;

    const isTheo = theme === 'theo';
    themeToggle.setAttribute('aria-label', isTheo ? 'Switch to Light Mode' : 'Switch to Theo Mode');
    themeToggle.setAttribute('aria-pressed', isTheo ? 'true' : 'false');

    // Update button text (can be replaced with icons)
    themeToggle.textContent = isTheo ? '☀️' : '🌙';
  }

  // Initialize button state
  updateToggleButton(currentTheme);

  // Theme toggle event listener
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'theo' : 'light';

      // Set new theme
      html.setAttribute('data-theme', newTheme);

      // Save to localStorage
      localStorage.setItem('theme', newTheme);

      // Update button
      updateToggleButton(newTheme);

      // Dispatch custom event for other scripts to react to theme change
      const themeChangeEvent = new CustomEvent('themechange', {
        detail: { theme: newTheme }
      });
      document.dispatchEvent(themeChangeEvent);
    });
  }

  // Listen for system theme preference changes (optional enhancement)
  if (window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    prefersDark.addEventListener('change', function(e) {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'theo' : 'light';
        html.setAttribute('data-theme', newTheme);
        updateToggleButton(newTheme);
      }
    });
  }

})();
