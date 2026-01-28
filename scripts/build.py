#!/usr/bin/env python3
import json
import os
import re
import shutil
from pathlib import Path

from openpyxl import load_workbook
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parents[1]
DATA_XLSX = ROOT / "DataForSite.xlsx"
DATA_DIR = ROOT / "data"
DIST_DIR = ROOT / "dist"
TEMPLATES_DIR = ROOT / "templates"
ASSETS_DIR = ROOT / "assets"

BASE_URL = os.environ.get("BASE_URL", "").strip()
if BASE_URL:
    BASE_URL = "/" + BASE_URL.strip("/") + "/"
else:
    BASE_URL = ""

LIST_FIELDS = {"projectIds", "publicationIds", "researcherIds"}

HEADER_MAPS = {
    "Researchers": {
        "researcherid": "id",
        "researchername": "name",
        "researchertitle": "title",
        "researcherabout": "about",
        "researcherprojectids": "projectIds",
        "researcherpublicationid": "publicationIds",
        "researcherimage": "image",
    },
    "Projects": {
        "projectid": "id",
        "projectname": "name",
        "projecttitle": "title",
        "projectabout": "about",
        "projectresearcherids": "researcherIds",
        "projectpublicationid": "publicationIds",
        "projectimage": "image",
    },
    "Publications": {
        "publicatoinid": "id",  # typo in sheet
        "publicationid": "id",
        "publicationname": "name",
        "publicationjournal": "journal",
        "publicationabstract": "abstract",
        "publicationurl": "publicationUrl",
        "publicationresearcherids": "researcherIds",
        "publicationprojectid": "projectIds",
        "publicationimage": "image",
    },
}

REQUIRED_FIELDS = {"id", "name"}


def normalize_header(value):
    if value is None:
        return ""
    text = str(value).strip().lower()
    return re.sub(r"[^a-z0-9]+", "", text)


def cell_to_str(value):
    if value is None:
        return ""
    if isinstance(value, float):
        if value.is_integer():
            return str(int(value))
    if isinstance(value, int):
        return str(value)
    return str(value).strip()

def normalize_image_value(value):
    raw = cell_to_str(value)
    if not raw:
        return ""
    lowered = raw.lower()
    if lowered.startswith("http://") or lowered.startswith("https://") or lowered.startswith("//") or lowered.startswith("data:"):
        return raw
    cleaned = raw.strip()
    while cleaned.startswith("./"):
        cleaned = cleaned[2:]
    cleaned = cleaned.lstrip("/")
    if "/" not in cleaned:
        cleaned = f"assets/images/{cleaned}"
    return cleaned


def parse_id_list(value):
    text = cell_to_str(value)
    if not text:
        return []
    parts = re.split(r"[;,\n]+", text)
    cleaned = [p.strip() for p in parts if p and p.strip()]
    seen = set()
    unique = []
    for item in cleaned:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique


def slugify(text):
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return base or "item"


def load_sheet(workbook, sheet_name, header_map, errors):
    if sheet_name not in workbook.sheetnames:
        errors.append({
            "type": "missing_sheet",
            "sheet": sheet_name,
            "message": f"Sheet '{sheet_name}' not found in DataForSite.xlsx",
        })
        return []

    ws = workbook[sheet_name]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []

    header_row = rows[0]
    header_index = {}
    for idx, raw in enumerate(header_row):
        normalized = normalize_header(raw)
        if normalized in header_map:
            header_index[idx] = header_map[normalized]

    items = []
    for row in rows[1:]:
        if not any(cell_to_str(value) for value in row):
            continue
        item = {}
        for idx, value in enumerate(row):
            if idx not in header_index:
                continue
            field = header_index[idx]
            if field in LIST_FIELDS:
                item[field] = parse_id_list(value)
            elif field == "image":
                item[field] = normalize_image_value(value)
            else:
                item[field] = cell_to_str(value)
        # Ensure missing fields are present
        for field in LIST_FIELDS:
            item.setdefault(field, [])
        for field in ["id", "name", "title", "about", "journal", "abstract", "image", "publicationUrl"]:
            item.setdefault(field, "")
        items.append(item)

    return items


def validate_items(items, label, errors):
    seen = {}
    for item in items:
        item_id = item.get("id", "")
        if not item_id:
            errors.append({
                "type": "missing_id",
                "sheet": label,
                "message": f"Missing ID in {label}",
            })
            continue
        if item_id in seen:
            errors.append({
                "type": "duplicate_id",
                "sheet": label,
                "id": item_id,
                "message": f"Duplicate ID '{item_id}' in {label}",
            })
        else:
            seen[item_id] = item

        missing_required = [field for field in REQUIRED_FIELDS if not item.get(field)]
        if missing_required:
            errors.append({
                "type": "missing_required_fields",
                "sheet": label,
                "id": item_id,
                "fields": missing_required,
                "message": f"Missing required fields {missing_required} in {label} ID {item_id}",
            })

    return seen


def validate_references(items, field, target_map, label, target_label, errors):
    for item in items:
        for ref_id in item.get(field, []):
            if ref_id not in target_map:
                errors.append({
                    "type": "missing_reference",
                    "sheet": label,
                    "id": item.get("id", ""),
                    "field": field,
                    "missingId": ref_id,
                    "message": f"Missing {target_label} ID '{ref_id}' referenced by {label} ID {item.get('id', '')}",
                })

def validate_images(items, label, errors):
    for item in items:
        image = item.get("image", "")
        if not image:
            continue
        lowered = image.lower()
        if lowered.startswith("http://") or lowered.startswith("https://") or lowered.startswith("//") or lowered.startswith("data:"):
            continue
        image_path = ROOT / image
        if not image_path.exists():
            errors.append({
                "type": "missing_image",
                "sheet": label,
                "id": item.get("id", ""),
                "image": image,
                "message": f"Image '{image}' not found on disk for {label} ID {item.get('id','')}",
            })


def add_meta(items, kind):
    for item in items:
        display = item.get("name") or item.get("title") or item.get("id") or "item"
        item["slug"] = slugify(display)
        item["path"] = f"{kind}/{item.get('id','')}-{item['slug']}.html"


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def build_site(data):
    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=select_autoescape(["html"]),
    )

    root_prefix = BASE_URL
    sub_prefix = BASE_URL if BASE_URL else "../"

    DIST_DIR.mkdir(parents=True, exist_ok=True)

    # index
    index_template = env.get_template("index.html")
    sections = [
        {"slug": "researchers", "title": "Researchers", "count": len(data["researchers"])},
        {"slug": "projects", "title": "Projects", "count": len(data["projects"])},
        {"slug": "publications", "title": "Publications", "count": len(data["publications"])},
    ]
    index_html = index_template.render(
        base_url=root_prefix,
        page_title="Division of Health AI",
        sections=sections,
    )
    (DIST_DIR / "index.html").write_text(index_html, encoding="utf-8")

    list_template = env.get_template("list.html")
    detail_template = env.get_template("detail.html")

    # list pages
    for kind, title, items in [
        ("researchers", "Researchers", data["researchers"]),
        ("projects", "Projects", data["projects"]),
        ("publications", "Publications", data["publications"]),
    ]:
        section_dir = DIST_DIR / kind
        section_dir.mkdir(parents=True, exist_ok=True)
        list_html = list_template.render(
            base_url=sub_prefix,
            page_title=title,
            page_description=f"All {title.lower()} in the Division of Health AI database.",
            items=items,
        )
        (section_dir / "index.html").write_text(list_html, encoding="utf-8")

    # detail pages
    researcher_map = {item["id"]: item for item in data["researchers"]}
    project_map = {item["id"]: item for item in data["projects"]}
    publication_map = {item["id"]: item for item in data["publications"]}

    def related(items_map, ids):
        return [items_map[i] for i in ids if i in items_map]

    for researcher in data["researchers"]:
        html = detail_template.render(
            base_url=sub_prefix,
            page_title=researcher.get("name") or researcher.get("id"),
            section="researchers",
            entity=researcher,
            related_projects=related(project_map, researcher.get("projectIds", [])),
            related_publications=related(publication_map, researcher.get("publicationIds", [])),
            related_researchers=[],
        )
        target = DIST_DIR / "researchers" / Path(researcher["path"]).name
        target.write_text(html, encoding="utf-8")

    for project in data["projects"]:
        html = detail_template.render(
            base_url=sub_prefix,
            page_title=project.get("name") or project.get("id"),
            section="projects",
            entity=project,
            related_projects=[],
            related_publications=related(publication_map, project.get("publicationIds", [])),
            related_researchers=related(researcher_map, project.get("researcherIds", [])),
        )
        target = DIST_DIR / "projects" / Path(project["path"]).name
        target.write_text(html, encoding="utf-8")

    for publication in data["publications"]:
        html = detail_template.render(
            base_url=sub_prefix,
            page_title=publication.get("name") or publication.get("id"),
            section="publications",
            entity=publication,
            related_projects=related(project_map, publication.get("projectIds", [])),
            related_publications=[],
            related_researchers=related(researcher_map, publication.get("researcherIds", [])),
        )
        target = DIST_DIR / "publications" / Path(publication["path"]).name
        target.write_text(html, encoding="utf-8")



def main():
    errors = []
    workbook = load_workbook(DATA_XLSX, data_only=True)

    researchers = load_sheet(workbook, "Researchers", HEADER_MAPS["Researchers"], errors)
    projects = load_sheet(workbook, "Projects", HEADER_MAPS["Projects"], errors)
    publications = load_sheet(workbook, "Publications", HEADER_MAPS["Publications"], errors)

    validate_items(researchers, "Researchers", errors)
    validate_items(projects, "Projects", errors)
    validate_items(publications, "Publications", errors)

    researchers = [item for item in researchers if item.get("id")]
    projects = [item for item in projects if item.get("id")]
    publications = [item for item in publications if item.get("id")]

    add_meta(researchers, "researchers")
    add_meta(projects, "projects")
    add_meta(publications, "publications")

    researcher_map = {item["id"]: item for item in researchers}
    project_map = {item["id"]: item for item in projects}
    publication_map = {item["id"]: item for item in publications}

    validate_references(researchers, "projectIds", project_map, "Researchers", "Project", errors)
    validate_references(researchers, "publicationIds", publication_map, "Researchers", "Publication", errors)

    validate_references(projects, "researcherIds", researcher_map, "Projects", "Researcher", errors)
    validate_references(projects, "publicationIds", publication_map, "Projects", "Publication", errors)

    validate_references(publications, "researcherIds", researcher_map, "Publications", "Researcher", errors)
    validate_references(publications, "projectIds", project_map, "Publications", "Project", errors)

    validate_images(researchers, "Researchers", errors)
    validate_images(projects, "Projects", errors)
    validate_images(publications, "Publications", errors)

    # Write normalized data
    write_json(DATA_DIR / "researchers.json", researchers)
    write_json(DATA_DIR / "projects.json", projects)
    write_json(DATA_DIR / "publications.json", publications)
    write_json(DATA_DIR / "errors.json", errors)

    # Build output
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True, exist_ok=True)

    if ASSETS_DIR.exists():
        shutil.copytree(ASSETS_DIR, DIST_DIR / "assets")

    data = {
        "researchers": researchers,
        "projects": projects,
        "publications": publications,
        "errors": errors,
    }
    build_site(data)

    # Copy data into dist for optional client access
    dist_data = DIST_DIR / "data"
    dist_data.mkdir(parents=True, exist_ok=True)
    for name in ["researchers.json", "projects.json", "publications.json", "errors.json"]:
        shutil.copy2(DATA_DIR / name, dist_data / name)

    print("Build complete")
    if errors:
        print(f"Validation warnings: {len(errors)} (see data/errors.json)")


if __name__ == "__main__":
    main()
