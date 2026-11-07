# LoTUS-BF

Location-or-Term Unified Search for Brain Functions. This project contains a React/Vite frontend and a Flask API backend for exploring neuroscience studies by term, MNI coordinate, or a mixed Boolean query.

## Frontend: local preview

Requires Node.js LTS and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/lotus-bf/`. The development server forwards `/terms`, `/query`, and `/help` to the Flask API at `hpc.psy.ntu.edu.tw:5000`.

## Frontend: production build

```bash
npm run build
```

Vite writes the static site to `dist/`. The site is configured for the `/lotus-bf/` path. The production API address is set in `.env.production`; update that file before building if the course server uses a different API address. The production web server must serve `dist/` at `/lotus-bf/` and allow browser access to the API.

## Backend

Install the Python dependencies with:

```bash
python3 -m pip install -r requirements-backend.txt
```

Set `DB_URL` in the server environment before starting the API. Keep the real database URL out of this repository and the submission ZIP. Start the Flask application with a production WSGI server such as:

```bash
gunicorn app:app --bind 0.0.0.0:${PORT:-5000}
```

See `.env.example` for the variable names. It contains placeholders only.

## Submission package

Include the frontend and backend source, `package.json`, `package-lock.json`, `requirements-backend.txt`, and the `public/static/mni_2mm.nii.gz` brain template. Do not include `node_modules`, a Python virtual environment, `.env` files containing real values, or database credentials.
