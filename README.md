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

Open `http://localhost:3000/lotus-bf/`. The Vite development server forwards `/terms`, `/query`, and `/help` to the course API at `hpc.psy.ntu.edu.tw:5000`.

Create a production build with:

```bash
npm run build
```

Vite writes the static site to `dist/`. The default base path is `/lotus-bf/` for the course server. For a standalone site at the domain root, build with `VITE_BASE_PATH=/`.

## Render deployment

The separate Render frontend uses `VITE_BASE_PATH=/`, `npm ci && npm run build`, and `dist` as the publish directory. Its `/terms` and `/query/*` routes are configured as Render rewrites to the public course API, keeping browser requests on the HTTPS site origin. See [Render's rewrite documentation](https://render.com/docs/redirects-rewrites).

The Flask API source is included in this package. The public website currently uses the course API; this package does not contain database credentials.

## Backend

Install the Python dependencies with:

```bash
python3 -m pip install -r requirements-backend.txt
```

Set `DB_URL` in the server environment before starting the API. Keep real database credentials out of source control and submission packages. Start the Flask application with a production WSGI server such as:

```bash
gunicorn app:app --bind 0.0.0.0:${PORT:-5000}
```

See `.env.example` for placeholder variable names.

## Submission package

Include the frontend and backend source, `package.json`, `package-lock.json`, `requirements-backend.txt`, and the `public/static/mni_2mm.nii.gz` brain template. Do not include `node_modules`, a Python virtual environment, or database credentials.
