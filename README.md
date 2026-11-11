# LoTUS-BF

**Location or Term Unified Search for Brain Functions** is a neuroscience research workspace for exploring studies by concept, Boolean expression, and MNI coordinate.

## Explore

- Search the indexed concept vocabulary and add terms to a query.
- Combine terms and coordinates with `AND`, `OR`, and `NOT`.
- Sort and page through matching studies, open PubMed records, and export the full result set as CSV.
- Explore orthogonal MNI slices, adjust the activation-map display, and download the generated map.
- Share a search by copying its URL; the active query is stored in `?q=`.

## Frontend setup

Requires Node.js LTS and npm.

```bash
npm ci
npm run dev
```
Create a production build with:

```bash
npm run build
```

## Render deployment

The Flask API source is included in this package.

## Backend

Install the Python dependencies with:

```bash
python3 -m pip install -r requirements-backend.txt
```
