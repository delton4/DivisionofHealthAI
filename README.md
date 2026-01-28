# Division of Health AI - Futuristic Command Center

This is a cinematic, futuristic single-page experience for the Division of Health AI (Neural & Data Science Lab). It combines layered visuals, interactive components, and progressive enhancement for WebGL and scroll-based motion.

## Files
- `index.html` - Primary structure and content.
- `variables.css` - Design tokens and fonts.
- `components.css` - Component styles and layout.
- `utilities.css` - Utility classes.
- `styles.css` - Base styles and section backgrounds.
- `fallbacks.css` - Progressive enhancement and mobile fallbacks.
- `print.css` - Print-friendly styles.
- `animations.js` - Interactions, cursor, scroll, counters, and particles.
- `3d-scene.js` - Three.js neural command center with fallback.
- `assets/` - Noise texture, cursors, icons, and SVG assets.

## Usage
Open `index.html` in a local server for best results (fonts and CDN scripts load correctly). No build step is required.

## Notes
- WebGL content is optional; the layout falls back to animated CSS or static visuals if WebGL is unavailable.
- Motion respects `prefers-reduced-motion` and reduces effects automatically.

## Source-of-truth policy
- The PowerPoint deck `DHAI_Projects.pptx` is the sole source of truth for project, researcher, and metric details.
- https://zanoslab.github.io is used only for tone and flavor text, not for factual project or personnel information.
- When in doubt, update the site copy to match `DHAI_Projects.pptx` verbatim data and numbers.
# DivisionofHealthAI
