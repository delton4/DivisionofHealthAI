# Performance Strategy

## Rendering
- Critical styles in `variables.css`, `components.css`, and `styles.css` load first.
- Visual effects are layered using GPU-friendly properties (`transform`, `opacity`).
- WebGL is optional and only initializes when available.

## Motion & Interaction
- Scroll reveals use GSAP if present; otherwise, the site relies on native CSS and observers.
- Particle counts are reduced on smaller screens.
- `prefers-reduced-motion` disables heavy animations.

## Assets
- SVG assets are lightweight and reusable.
- Noise is generated via SVG turbulence to avoid heavy bitmaps.

## Recommendations
- Serve fonts locally for production.
- Add `preload` for critical assets if hosting publicly.
- Consider image optimization and `loading="lazy"` for team photos.
