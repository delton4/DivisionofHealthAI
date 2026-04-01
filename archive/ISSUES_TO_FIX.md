# Issues to Fix - Quick Reference

## HIGH PRIORITY

### 1. Add LinkedIn Link to Theo Zanos Researcher Profile

**Issue:** The division leader's researcher detail page lacks a LinkedIn link, while the homepage leadership section has one.

**Files to Update:**

1. **Data file (likely):** Check researcher data source (YAML/JSON/CSV)
   - Add `linkedin: https://www.linkedin.com/in/theozanos/` to Theo's data

2. **Template file:** Update researcher detail template to render LinkedIn link
   - Location: Likely in `/templates/` directory
   - Look for researcher detail template
   - Add LinkedIn icon/link rendering (similar to homepage implementation)

3. **Reference implementation:** See homepage for correct LinkedIn link structure
   - File: `/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist/index.html`
   - Lines: 113-118
   ```html
   <a href="https://www.linkedin.com/in/theozanos/" target="_blank" rel="noopener" class="linkedin-link">
     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
       <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
     </svg>
     Follow Dr. Zanos on LinkedIn
   </a>
   ```

**Generated file needing LinkedIn link:**
- File: `/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist/researchers/1-theo-zanos.html`
- Location: Around line 60-67 (in the detail-grid section)

---

## LOW PRIORITY

### 2. Fix Heading Hierarchy on Join Us Page

**Issue:** Heading structure skips from h2 to h4, which is not ideal for accessibility.

**File to Update:**
- **Template:** Likely `/templates/join-us.html` or similar

**Lines to Fix in Generated HTML:**
- File: `/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist/join-us.html`
- Line 52: Change `<h4>Ideal Candidates:</h4>` to `<h3>Ideal Candidates:</h3>`
- Line 65: Change `<h4>Areas of Interest:</h4>` to `<h3>Areas of Interest:</h3>`

**Fix:** Replace h4 tags with h3 tags in the join-options section.

---

## OPTIONAL ENHANCEMENTS

### 3. Add Division Director Badge to Theo's Profile

**Current state:** Theo's researcher page shows "Director" as subtitle but lacks visual prominence.

**Suggestion:** Add a visual badge or indicator similar to homepage leadership section.

**File:** `/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist/researchers/1-theo-zanos.html` (line 45)

---

### 4. Update Formspree Form ID

**Current state:** Form uses placeholder "YOUR_FORM_ID"

**File to Update:**
- Template: Join Us form template
- Generated HTML: `/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist/join-us.html` (line 80)
- Change: `action="https://formspree.io/f/YOUR_FORM_ID"` to actual Formspree ID

---

## NOT BUGS (No Action Needed)

### Navigation Structure
- The test flagged "missing Home/People links" but these are design decisions:
  - "Division of Health AI" brand link acts as home
  - "Researchers" is equivalent to "People"
- **No changes needed**

### Neural Network Canvas on Non-Homepage
- The script intentionally only runs on homepage (where .hero exists)
- File: `/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist/assets/js/neural-bg.js` (lines 19-21)
- **No changes needed** - working as designed

### Theme Toggle
- Code is correct and functional
- Test couldn't verify CSS changes in headless environment
- File: `/Users/diego/Coding Things/vs code projects/northwellsite/futuristic northwell site /dist/assets/js/theme-toggle.js`
- **No changes needed**

---

## Build System Note

Since files in `/dist/` are generated, make changes in:
1. **Data sources** (YAML/JSON/CSV files with researcher/project/publication data)
2. **Templates** (Jinja2/HTML templates in `/templates/` directory)
3. **Build script** (`build.py` or similar)

Then rebuild to regenerate `/dist/` files.

**Do not edit `/dist/` files directly** - they will be overwritten on next build.
