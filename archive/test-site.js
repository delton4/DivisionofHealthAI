const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_PATH = '/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' +
                  new Date().toTimeString().split(' ')[0].replace(/:/g, '');
const RESULTS_DIR = path.join(process.cwd(), 'test-results', TIMESTAMP);
const SCREENSHOTS_DIR = path.join(RESULTS_DIR, 'screenshots');

// Create directories
['critical', 'high', 'medium', 'low'].forEach(severity => {
  fs.mkdirSync(path.join(SCREENSHOTS_DIR, severity), { recursive: true });
});

// Issue tracking
const issues = {
  critical: [],
  high: [],
  medium: [],
  low: []
};

let pagesCrawled = 0;
const consoleErrors = [];

// Helper functions
function addIssue(severity, issue) {
  issues[severity].push({
    ...issue,
    timestamp: new Date().toISOString()
  });
}

async function captureScreenshot(page, filename, severity = 'medium') {
  const screenshotPath = path.join(SCREENSHOTS_DIR, severity, filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return `screenshots/${severity}/${filename}`;
}

function fileUrl(filePath) {
  return `file://${filePath}`;
}

// Main testing function
async function runTests() {
  console.log('Starting comprehensive UX testing...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        location: msg.location()
      });
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push({
      text: error.message,
      stack: error.stack
    });
  });

  // Pages to test
  const pagesToTest = [
    { name: 'Homepage', path: 'index.html', critical: true },
    { name: 'About', path: 'about.html', critical: true },
    { name: 'Join Us', path: 'join-us.html', critical: true },
    { name: 'Researchers List', path: 'researchers/index.html', critical: true },
    { name: 'Projects List', path: 'projects/index.html', critical: true },
    { name: 'Publications List', path: 'publications/index.html', critical: true },
    { name: 'Researcher Detail - Theo Zanos', path: 'researchers/1-theo-zanos.html', critical: false },
    { name: 'Researcher Detail - Diego Gonzalez', path: 'researchers/2-diego-gonzalez.html', critical: false },
    { name: 'Project Detail - PREDICT', path: 'projects/1-predict.html', critical: false },
    { name: 'Project Detail - Website', path: 'projects/2-website.html', critical: false },
    { name: 'Publication Detail 1', path: 'publications/1-predict.html', critical: false },
    { name: 'Publication Detail 2', path: 'publications/2-website.html', critical: false },
    { name: 'Publication Detail 3', path: 'publications/3-dennis-test.html', critical: false }
  ];

  for (const pageInfo of pagesToTest) {
    console.log(`Testing: ${pageInfo.name}`);
    await testPage(page, pageInfo);
    pagesCrawled++;
  }

  // Close browser
  await browser.close();

  // Generate report
  await generateReport();

  console.log('\n=== Testing Complete ===');
  console.log(`Pages tested: ${pagesCrawled}`);
  console.log(`Critical issues: ${issues.critical.length}`);
  console.log(`High priority issues: ${issues.high.length}`);
  console.log(`Medium priority issues: ${issues.medium.length}`);
  console.log(`Low priority issues: ${issues.low.length}`);
  console.log(`\nFull report: ${path.join(RESULTS_DIR, 'report.md')}`);
}

async function testPage(page, pageInfo) {
  const filePath = path.join(BASE_PATH, pageInfo.path);
  const url = fileUrl(filePath);

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      addIssue('critical', {
        page: pageInfo.name,
        category: 'Page Load',
        title: `Page file does not exist: ${pageInfo.path}`,
        description: `The HTML file for ${pageInfo.name} is missing from the dist directory.`,
        expected: 'File should exist at the specified path',
        actual: 'File not found',
        fix: 'Ensure build script generates this page correctly'
      });
      return;
    }

    // Navigate to page
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });

    if (!response || response.status() !== 200) {
      addIssue('critical', {
        page: pageInfo.name,
        category: 'Page Load',
        title: `Failed to load page: ${pageInfo.path}`,
        description: `Page returned status ${response?.status() || 'unknown'}`,
        expected: 'Page should load with status 200',
        actual: `Status ${response?.status() || 'unknown'}`,
        fix: 'Check file permissions and content'
      });
      return;
    }

    // Test 1: Check CSS files are loaded
    await testCSSLoading(page, pageInfo);

    // Test 2: Check images
    await testImages(page, pageInfo);

    // Test 3: Check navigation links
    await testNavigation(page, pageInfo);

    // Test 4: Check JavaScript functionality
    await testJavaScript(page, pageInfo);

    // Test 5: Page-specific tests
    if (pageInfo.path === 'index.html') {
      await testHomepage(page, pageInfo);
    } else if (pageInfo.path === 'join-us.html') {
      await testJoinUsPage(page, pageInfo);
    } else if (pageInfo.path.includes('researchers/1-theo-zanos')) {
      await testTheoDivisionLeadership(page, pageInfo);
    }

    // Test 6: Check for basic accessibility issues
    await testBasicAccessibility(page, pageInfo);

    // Test 7: Theme toggle
    await testThemeToggle(page, pageInfo);

  } catch (error) {
    addIssue('critical', {
      page: pageInfo.name,
      category: 'Page Load',
      title: `Error loading page: ${pageInfo.path}`,
      description: error.message,
      expected: 'Page should load without errors',
      actual: `Error: ${error.message}`,
      fix: 'Investigate error and fix underlying issue'
    });
  }
}

async function testCSSLoading(page, pageInfo) {
  // Check if CSS is applied by looking for computed styles
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    return {
      fontFamily: styles.fontFamily,
      backgroundColor: styles.backgroundColor,
      margin: styles.margin
    };
  });

  // Check if styles are default (indicating CSS not loaded)
  if (bodyStyles.fontFamily.includes('Times') || bodyStyles.fontFamily === 'serif') {
    const screenshot = await captureScreenshot(page, `${pageInfo.path.replace(/\//g, '_')}_css_not_loaded.png`, 'high');
    addIssue('high', {
      page: pageInfo.name,
      category: 'CSS',
      title: 'CSS styles may not be loading properly',
      description: 'Body element shows default serif font, indicating CSS may not be applied',
      expected: 'Custom fonts and styles should be applied',
      actual: `Font family: ${bodyStyles.fontFamily}`,
      screenshot,
      fix: 'Check CSS file paths in HTML and ensure files exist in dist/assets/css/'
    });
  }

  // Check for missing CSS files in HTML
  const cssLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => ({
      href: link.href,
      exists: link.sheet !== null
    }));
  });

  for (const link of cssLinks) {
    if (!link.exists) {
      addIssue('high', {
        page: pageInfo.name,
        category: 'CSS',
        title: 'CSS file failed to load',
        description: `Stylesheet link exists in HTML but file could not be loaded: ${link.href}`,
        expected: 'All CSS files should load successfully',
        actual: 'CSS file not found or failed to load',
        fix: 'Verify CSS file exists at the specified path'
      });
    }
  }
}

async function testImages(page, pageInfo) {
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    }));
  });

  for (const img of images) {
    // Check for broken images
    if (img.complete && img.naturalWidth === 0) {
      const screenshot = await captureScreenshot(page, `${pageInfo.path.replace(/\//g, '_')}_broken_image.png`, 'high');
      addIssue('high', {
        page: pageInfo.name,
        category: 'Images',
        title: 'Broken image detected',
        description: `Image failed to load: ${img.src}`,
        expected: 'All images should load correctly',
        actual: 'Image not found or failed to load',
        screenshot,
        fix: 'Ensure image file exists in dist/assets/images/ and path is correct'
      });
    }

    // Check for missing alt text
    if (!img.alt || img.alt.trim() === '') {
      addIssue('medium', {
        page: pageInfo.name,
        category: 'Accessibility',
        title: 'Image missing alt text',
        description: `Image without alt attribute: ${img.src}`,
        expected: 'All images should have descriptive alt text',
        actual: 'Missing or empty alt attribute',
        fix: 'Add descriptive alt text to image in HTML template'
      });
    }
  }
}

async function testNavigation(page, pageInfo) {
  const navLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('nav a, header a')).map(link => ({
      href: link.href,
      text: link.textContent.trim(),
      isInternal: link.href.includes('file://')
    }));
  });

  // Check if navigation exists
  if (navLinks.length === 0) {
    addIssue('high', {
      page: pageInfo.name,
      category: 'Navigation',
      title: 'No navigation links found',
      description: 'Page does not contain any navigation links in header or nav elements',
      expected: 'Page should have navigation menu',
      actual: 'No navigation links detected',
      fix: 'Ensure navigation is included in page template'
    });
    return;
  }

  // Verify key navigation links exist
  const expectedLinks = ['Home', 'About', 'Research', 'People', 'Publications', 'Join'];
  const foundLinks = navLinks.map(link => link.text.toLowerCase());

  for (const expected of expectedLinks) {
    if (!foundLinks.some(found => found.includes(expected.toLowerCase()))) {
      addIssue('medium', {
        page: pageInfo.name,
        category: 'Navigation',
        title: `Missing navigation link: ${expected}`,
        description: `Expected navigation link "${expected}" not found in navigation menu`,
        expected: `Navigation should include link to ${expected}`,
        actual: `Link not found. Available links: ${foundLinks.join(', ')}`,
        fix: 'Add missing link to navigation template'
      });
    }
  }
}

async function testJavaScript(page, pageInfo) {
  // Check if neural network canvas exists
  const hasCanvas = await page.evaluate(() => {
    return document.querySelector('canvas#neural-bg') !== null;
  });

  if (!hasCanvas) {
    addIssue('medium', {
      page: pageInfo.name,
      category: 'JavaScript',
      title: 'Neural network canvas not found',
      description: 'The canvas element for neural network animation is missing',
      expected: 'Canvas element with id "neural-bg" should exist',
      actual: 'Canvas element not found',
      fix: 'Ensure neural-bg.js is loaded and canvas is created'
    });
  }

  // Check if canvas context is working
  if (hasCanvas) {
    const canvasWorking = await page.evaluate(() => {
      const canvas = document.querySelector('canvas#neural-bg');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      return ctx !== null && canvas.width > 0 && canvas.height > 0;
    });

    if (!canvasWorking) {
      addIssue('medium', {
        page: pageInfo.name,
        category: 'JavaScript',
        title: 'Neural network canvas not initialized properly',
        description: 'Canvas element exists but is not properly initialized',
        expected: 'Canvas should have valid 2D context and dimensions',
        actual: 'Canvas not functioning',
        fix: 'Check neural-bg.js initialization code'
      });
    }
  }
}

async function testHomepage(page, pageInfo) {
  console.log('  - Testing featured publications section...');

  // Check for featured publications
  const featuredPubs = await page.evaluate(() => {
    const section = document.querySelector('.featured-publications, [class*="featured"]');
    if (!section) return { exists: false };

    const cards = section.querySelectorAll('.card, .publication-card, [class*="card"]');
    return {
      exists: true,
      cardCount: cards.length,
      hasHeading: section.querySelector('h2, h3') !== null
    };
  });

  if (!featuredPubs.exists) {
    const screenshot = await captureScreenshot(page, 'homepage_missing_featured_pubs.png', 'high');
    addIssue('high', {
      page: pageInfo.name,
      category: 'Content',
      title: 'Featured publications section missing on homepage',
      description: 'The homepage does not have a featured publications section',
      expected: 'Homepage should display featured publications',
      actual: 'Featured publications section not found',
      screenshot,
      fix: 'Add featured publications section to homepage template'
    });
  } else if (featuredPubs.cardCount === 0) {
    const screenshot = await captureScreenshot(page, 'homepage_no_pub_cards.png', 'high');
    addIssue('high', {
      page: pageInfo.name,
      category: 'Content',
      title: 'No publication cards in featured section',
      description: 'Featured publications section exists but contains no publication cards',
      expected: 'Should display at least one featured publication',
      actual: 'Zero publication cards found',
      screenshot,
      fix: 'Ensure publications are being rendered in the featured section'
    });
  }
}

async function testJoinUsPage(page, pageInfo) {
  console.log('  - Testing Join Us form...');

  // Check for form elements
  const formElements = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return { exists: false };

    const inputs = form.querySelectorAll('input, textarea, select');
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

    return {
      exists: true,
      inputCount: inputs.length,
      hasSubmitButton: submitButton !== null,
      formAction: form.action,
      formMethod: form.method
    };
  });

  if (!formElements.exists) {
    const screenshot = await captureScreenshot(page, 'join-us_no_form.png', 'critical');
    addIssue('critical', {
      page: pageInfo.name,
      category: 'Forms',
      title: 'Contact form missing on Join Us page',
      description: 'No form element found on Join Us page',
      expected: 'Page should contain a contact/application form',
      actual: 'Form element not found',
      screenshot,
      fix: 'Add form to Join Us page template'
    });
  } else {
    if (formElements.inputCount === 0) {
      const screenshot = await captureScreenshot(page, 'join-us_no_inputs.png', 'critical');
      addIssue('critical', {
        page: pageInfo.name,
        category: 'Forms',
        title: 'Form has no input fields',
        description: 'Form element exists but contains no input fields',
        expected: 'Form should have input fields for user data',
        actual: 'No inputs found in form',
        screenshot,
        fix: 'Add input fields to form'
      });
    }

    if (!formElements.hasSubmitButton) {
      const screenshot = await captureScreenshot(page, 'join-us_no_submit.png', 'high');
      addIssue('high', {
        page: pageInfo.name,
        category: 'Forms',
        title: 'Form missing submit button',
        description: 'Form exists but has no submit button',
        expected: 'Form should have a submit button',
        actual: 'No submit button found',
        screenshot,
        fix: 'Add submit button to form'
      });
    }
  }
}

async function testTheoDivisionLeadership(page, pageInfo) {
  console.log('  - Testing division leadership section...');

  const leadership = await page.evaluate(() => {
    // Look for leadership indicators
    const hasLeaderBadge = document.body.textContent.includes('Division Director') ||
                           document.body.textContent.includes('Division Leader') ||
                           document.querySelector('.leadership, .director, [class*="leader"]') !== null;

    // Look for LinkedIn link
    const linkedInLinks = Array.from(document.querySelectorAll('a'))
      .filter(a => a.href.includes('linkedin.com'));

    return {
      hasLeadershipIndicator: hasLeaderBadge,
      hasLinkedIn: linkedInLinks.length > 0,
      linkedInHref: linkedInLinks[0]?.href || null
    };
  });

  if (!leadership.hasLeadershipIndicator) {
    addIssue('medium', {
      page: pageInfo.name,
      category: 'Content',
      title: 'Division leadership designation not clear',
      description: 'Theo Zanos page should clearly indicate division leadership role',
      expected: 'Page should show "Division Director" or similar designation',
      actual: 'No clear leadership indicator found',
      fix: 'Add leadership badge or designation to Theo Zanos profile'
    });
  }

  if (!leadership.hasLinkedIn) {
    const screenshot = await captureScreenshot(page, 'theo_no_linkedin.png', 'high');
    addIssue('high', {
      page: pageInfo.name,
      category: 'Links',
      title: 'LinkedIn link missing from division leader profile',
      description: 'Theo Zanos (Division Director) profile should include LinkedIn link',
      expected: 'Profile should have link to LinkedIn',
      actual: 'No LinkedIn link found',
      screenshot,
      fix: 'Add LinkedIn URL to Theo Zanos researcher data'
    });
  }
}

async function testBasicAccessibility(page, pageInfo) {
  const a11yIssues = await page.evaluate(() => {
    const issues = [];

    // Check heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const levels = headings.map(h => parseInt(h.tagName[1]));

    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i-1] + 1) {
        issues.push({
          type: 'heading_skip',
          description: `Heading hierarchy skips from h${levels[i-1]} to h${levels[i]}`
        });
        break;
      }
    }

    // Check for h1
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count === 0) {
      issues.push({ type: 'no_h1', description: 'Page has no h1 heading' });
    } else if (h1Count > 1) {
      issues.push({ type: 'multiple_h1', description: `Page has ${h1Count} h1 headings` });
    }

    // Check buttons without text
    const buttons = Array.from(document.querySelectorAll('button'));
    buttons.forEach((btn, idx) => {
      if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
        issues.push({
          type: 'button_no_text',
          description: `Button ${idx + 1} has no visible text or aria-label`
        });
      }
    });

    // Check links without text
    const links = Array.from(document.querySelectorAll('a'));
    links.forEach((link, idx) => {
      if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
        issues.push({
          type: 'link_no_text',
          description: `Link ${idx + 1} has no visible text or aria-label`
        });
      }
    });

    return issues;
  });

  for (const issue of a11yIssues) {
    const severity = issue.type.includes('h1') ? 'medium' : 'low';
    addIssue(severity, {
      page: pageInfo.name,
      category: 'Accessibility',
      title: issue.type.replace(/_/g, ' ').toUpperCase(),
      description: issue.description,
      expected: 'Page should follow basic accessibility guidelines',
      actual: issue.description,
      fix: 'Review and fix accessibility issue in template'
    });
  }
}

async function testThemeToggle(page, pageInfo) {
  // Check if theme toggle button exists
  const themeToggle = await page.evaluate(() => {
    const toggle = document.querySelector('#theme-toggle, .theme-toggle, [class*="theme"]');
    if (!toggle) return { exists: false };

    return {
      exists: true,
      isButton: toggle.tagName === 'BUTTON',
      hasText: toggle.textContent.trim().length > 0
    };
  });

  if (!themeToggle.exists) {
    addIssue('medium', {
      page: pageInfo.name,
      category: 'UI Features',
      title: 'Theme toggle button not found',
      description: 'Page should have a theme toggle button (Theo mode)',
      expected: 'Theme toggle button should be present',
      actual: 'Button not found',
      fix: 'Ensure theme-toggle.js is loaded and button is created'
    });
    return;
  }

  // Try to click theme toggle and check if theme changes
  try {
    const beforeTheme = await page.evaluate(() => document.body.className);

    await page.click('#theme-toggle, .theme-toggle, [class*="theme"]');
    await page.waitForTimeout(500); // Wait for transition

    const afterTheme = await page.evaluate(() => document.body.className);

    if (beforeTheme === afterTheme) {
      addIssue('medium', {
        page: pageInfo.name,
        category: 'UI Features',
        title: 'Theme toggle not functioning',
        description: 'Clicking theme toggle button does not change theme',
        expected: 'Theme should toggle when button is clicked',
        actual: 'No theme change detected',
        fix: 'Check theme-toggle.js functionality'
      });
    }
  } catch (error) {
    addIssue('low', {
      page: pageInfo.name,
      category: 'UI Features',
      title: 'Could not test theme toggle',
      description: `Error testing theme toggle: ${error.message}`,
      expected: 'Theme toggle should be testable',
      actual: `Error: ${error.message}`,
      fix: 'Investigate theme toggle implementation'
    });
  }
}

async function generateReport() {
  const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);

  let report = `# Division of Health AI - UX Testing Report\n\n`;
  report += `**Test Date**: ${new Date().toISOString()}\n`;
  report += `**Pages Tested**: ${pagesCrawled}\n`;
  report += `**Total Issues Found**: ${totalIssues}\n\n`;

  report += `## Issue Breakdown\n`;
  report += `- CRITICAL: ${issues.critical.length}\n`;
  report += `- HIGH: ${issues.high.length}\n`;
  report += `- MEDIUM: ${issues.medium.length}\n`;
  report += `- LOW: ${issues.low.length}\n\n`;

  // Console errors section
  if (consoleErrors.length > 0) {
    report += `## Console Errors Detected\n\n`;
    report += `Found ${consoleErrors.length} console errors during testing:\n\n`;
    consoleErrors.slice(0, 10).forEach((error, idx) => {
      report += `### Error ${idx + 1}\n`;
      report += `\`\`\`\n${error.text}\n\`\`\`\n`;
      if (error.stack) {
        report += `\`\`\`\n${error.stack}\n\`\`\`\n\n`;
      }
    });
    if (consoleErrors.length > 10) {
      report += `\n_... and ${consoleErrors.length - 10} more errors_\n\n`;
    }
  }

  // Critical issues
  if (issues.critical.length > 0) {
    report += `## CRITICAL Issues\n\n`;
    issues.critical.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.title}\n`;
      report += `**Page**: ${issue.page}\n`;
      report += `**Category**: ${issue.category}\n`;
      report += `**Description**: ${issue.description}\n`;
      report += `**Expected**: ${issue.expected}\n`;
      report += `**Actual**: ${issue.actual}\n`;
      if (issue.screenshot) {
        report += `**Screenshot**: ![Issue](${issue.screenshot})\n`;
      }
      report += `**Suggested Fix**: ${issue.fix}\n\n`;
    });
  }

  // High priority issues
  if (issues.high.length > 0) {
    report += `## HIGH Priority Issues\n\n`;
    issues.high.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.title}\n`;
      report += `**Page**: ${issue.page}\n`;
      report += `**Category**: ${issue.category}\n`;
      report += `**Description**: ${issue.description}\n`;
      report += `**Expected**: ${issue.expected}\n`;
      report += `**Actual**: ${issue.actual}\n`;
      if (issue.screenshot) {
        report += `**Screenshot**: ![Issue](${issue.screenshot})\n`;
      }
      report += `**Suggested Fix**: ${issue.fix}\n\n`;
    });
  }

  // Medium priority issues
  if (issues.medium.length > 0) {
    report += `## MEDIUM Priority Issues\n\n`;
    issues.medium.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.title}\n`;
      report += `**Page**: ${issue.page} | **Category**: ${issue.category}\n`;
      report += `${issue.description}\n`;
      report += `**Fix**: ${issue.fix}\n\n`;
    });
  }

  // Low priority issues
  if (issues.low.length > 0) {
    report += `## LOW Priority Issues\n\n`;
    issues.low.forEach((issue, idx) => {
      report += `- **${issue.page}**: ${issue.title} - ${issue.fix}\n`;
    });
  }

  // Recommendations
  report += `\n## Recommended Actions\n\n`;
  if (issues.critical.length > 0) {
    report += `1. **IMMEDIATE**: Address all ${issues.critical.length} critical issues before deployment\n`;
  }
  if (issues.high.length > 0) {
    report += `2. **HIGH PRIORITY**: Fix ${issues.high.length} high priority issues affecting user experience\n`;
  }
  if (issues.medium.length > 0) {
    report += `3. **MEDIUM PRIORITY**: Resolve ${issues.medium.length} medium priority issues to improve quality\n`;
  }
  if (totalIssues === 0) {
    report += `No critical issues found! Site is ready for deployment.\n`;
  }

  // Write report
  fs.writeFileSync(path.join(RESULTS_DIR, 'report.md'), report);

  // Write JSON summary
  const summary = {
    testDate: new Date().toISOString(),
    pagesCrawled,
    totalIssues,
    issuesBySeverity: {
      critical: issues.critical.length,
      high: issues.high.length,
      medium: issues.medium.length,
      low: issues.low.length
    },
    consoleErrors: consoleErrors.length,
    issues
  };

  fs.writeFileSync(
    path.join(RESULTS_DIR, 'test-summary.json'),
    JSON.stringify(summary, null, 2)
  );
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
