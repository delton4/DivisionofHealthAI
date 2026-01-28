# Division of Health AI Site

This repo builds a static site from a single Excel source of truth: `DataForSite.xlsx`.

## For researchers (content updates)
1. Open `DataForSite.xlsx`.
2. Update researchers, projects, or publications in their respective sheets.
3. Save the file and commit it to the repo.
4. Push to `main`. GitHub Pages will rebuild the site automatically.

## For developers (local build)
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/build.py
```
Then open `dist/index.html` in a browser.

## Notes
- The build script normalizes and validates the Excel data.
- Validation warnings are written to `data/errors.json` and copied into `dist/data/errors.json`.
- GitHub Pages uses `BASE_URL=/<repo-name>` for links. If you deploy on a custom domain or a user site, update the workflow env accordingly.
