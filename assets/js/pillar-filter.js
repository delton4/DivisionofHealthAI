/**
 * Pillar Filter - Client-side filtering for projects
 * Filters projects by PREDICT, PREVENT, PERSONALIZE pillars
 */

(function() {
  'use strict';

  // Only run on projects list page
  const isProjectsPage = window.location.pathname.includes('/projects/index.html') || 
                         window.location.pathname.includes('/projects/');
  
  if (!isProjectsPage || !window.location.pathname.includes('index.html')) return;

  // Get all list items
  const listItems = document.querySelectorAll('.list-item');
  
  // Check if any items have pillar badges (only projects have them)
  const hasPillars = Array.from(listItems).some(item => item.querySelector('.pillar-badge'));
  if (!hasPillars) return;
  
  // Create filter buttons
  const filterContainer = document.createElement('div');
  filterContainer.className = 'pillar-filter';
  filterContainer.innerHTML = `
    <div class="filter-buttons">
      <button class="filter-btn active" data-filter="all">All Projects</button>
      <button class="filter-btn" data-filter="PREDICT">
        <span class="filter-icon">🔮</span> Predict
      </button>
      <button class="filter-btn" data-filter="PREVENT">
        <span class="filter-icon">🛡️</span> Prevent
      </button>
      <button class="filter-btn" data-filter="PERSONALIZE">
        <span class="filter-icon">⚕️</span> Personalize
      </button>
    </div>
  `;

  // Insert filter before the list
  const listSection = document.querySelector('.list');
  if (listSection) {
    listSection.parentNode.insertBefore(filterContainer, listSection);
  }

  // Filter functionality
  const filterButtons = filterContainer.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filter = this.dataset.filter;
      
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Filter items
      listItems.forEach(item => {
        const badge = item.querySelector('.pillar-badge');
        const pillar = badge ? badge.textContent.trim() : null;
        
        if (filter === 'all' || pillar === filter) {
          item.style.display = 'block';
          // Add fade-in animation
          item.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
      
      // Update URL without reload
      const url = new URL(window.location);
      if (filter === 'all') {
        url.searchParams.delete('pillar');
      } else {
        url.searchParams.set('pillar', filter);
      }
      window.history.pushState({}, '', url);
    });
  });

  // Check URL for initial filter
  const urlParams = new URLSearchParams(window.location.search);
  const initialFilter = urlParams.get('pillar');
  if (initialFilter) {
    const button = filterContainer.querySelector(`[data-filter="${initialFilter}"]`);
    if (button) {
      button.click();
    }
  }

})();
