# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Frontend: React + Vite + Tailwind CSS (no test framework configured)
- Routing: react-router-dom with a role-based layout switch driven by localStorage
- Linting: ESLint (flat config) with react-hooks and react-refresh plugins
- Build target: Vite with production base set to /vitecap1/CAPSTONE1/
- Backend API: src/config.js builds BASE_URL pointing to a sibling php/ directory (not present in this repo); API calls will fail if that backend is unavailable

Essential commands
- Install dependencies (uses npm; package-lock.json present)
  ```sh path=null start=null
  npm ci
  # or, if you need to modify dependencies
  npm install
  ```
- Start dev server (HMR)
  ```sh path=null start=null
  npm run dev
  ```
- Lint the codebase
  ```sh path=null start=null
  npm run lint
  ```
- Build for production
  ```sh path=null start=null
  npm run build
  ```
- Preview the production build locally
  ```sh path=null start=null
  npm run preview
  ```
- Tests
  ```sh path=null start=null
  # No test script is configured in package.json; running a single test is not applicable.
  ```

Architecture and key implementation details
- Entry point and app bootstrap
  - src/main.jsx mounts <App /> with React StrictMode.
  - Vite handles module bundling and dev server.
- Routing and navigation
  - src/App.jsx defines the router. Public routes: / and /login.
  - All other paths are funneled through a wildcard route (/*) that conditionally renders AppLayout if localStorage contains user_id; otherwise it redirects to /login.
  - AppLayout selects one of four role-specific layouts based on localStorage role: admin, staff, guard, homeowner. Each role renders its own sidebar and a distinct set of <Routes>.
  - Sign-out is implemented by clearing localStorage and pushing to /login via window.location.
  - Components/components available for authorization (not currently wired into App.jsx routing):
    - src/components/RequireAuth.jsx redirects to /login when user_id is missing.
    - src/components/RequireRole.jsx redirects to /login when the stored role is absent or not allowed.
- Role-specific UI composition
  - Common header: src/components/Header.jsx
  - Sidebars:
    - Admin: src/components/Sidebar.jsx
    - Staff: src/components/SidebarStaff.jsx
    - Guard: src/components/SidebarGuard.jsx
    - Homeowner: src/components/SidebarHomeowner.jsx
  - Icons from lucide-react provide consistent visual vocabulary.
  - Pages are grouped by feature and role under src/pages, with further subfolders for amenities, items, and homeowner flows.
- Styling
  - Tailwind CSS v4 via @tailwindcss/vite is integrated in vite.config.js.
  - Global styles in src/index.css and src/App.css.
- Configuration and environments
  - vite.config.js sets base depending on mode:
    - Development: base "/"
    - Production: base "/vitecap1/CAPSTONE1/"
    This is important if the app is deployed under a subpath; links and asset URLs will be prefixed accordingly.
  - src/config.js sets BASE_URL for API calls:
    - In development (localhost or port 5173): http://localhost/vitecap1/CAPSTONE1/php/
    - In production: ${window.location.origin}/vitecap1/CAPSTONE1/php/
    Ensure the backend is hosted at that path; otherwise network requests will fail.
- Linting configuration
  - eslint.config.js (flat config) enables:
    - @eslint/js recommended rules
    - eslint-plugin-react-hooks recommended rules
    - eslint-plugin-react-refresh (warns when only-export-components is violated)
    - Custom rule: no-unused-vars with varsIgnorePattern '^[A-Z_]' (useful for global constants)
  - dist is ignored by ESLint.

Important context from repository files
- README.md is the default Vite React template; it does not add project-specific setup beyond the standard plugin notes.
- No WARP, CLAUDE, Cursor, or Copilot instruction files are present.

Operational notes for agents
- Role and session are managed via localStorage keys: user_id and role.
- When debugging route access, verify these keys before assuming a routing issue.
- If asset or navigation paths break after build, confirm that the production base (/vitecap1/CAPSTONE1/) matches the actual deploy subpath.
- If API calls fail, verify that the expected php/ backend is reachable at the BASE_URL computed in src/config.js.

Windows/XAMPP development and deployment notes
- Run frontend and PHP backend together
  - Start Vite dev server:
    ```sh path=null start=null
    npm run dev
    ```
  - Ensure XAMPP Apache is running and serving PHP at http://localhost/vitecap1/CAPSTONE1/php/
  - If you see CORS errors from calls originating at http://localhost:5173 to http://localhost, add a Vite dev proxy so requests go through the dev server:
    ```js path=null start=null
    // vite.config.js (add the server.proxy block)
    export default defineConfig(({ command, mode }) => {
      const isProd = mode === 'production'
      return {
        base: isProd ? '/vitecap1/CAPSTONE1/' : '/',
        plugins: [tailwindcss(), react()],
        server: {
          proxy: {
            '/vitecap1/CAPSTONE1/php': {
              target: 'http://localhost',
              changeOrigin: false,
            },
          },
        },
        build: { outDir: 'dist' },
      }
    })
    ```
- SPA routing under Apache (avoid 404 on deep links/refresh)
  - When deploying under http://localhost/vitecap1/CAPSTONE1/, configure Apache to rewrite all non-file requests to index.html for the SPA.
  - Option A (copy dist contents into C:\\xampp\\htdocs\\vitecap1\\CAPSTONE1\\ so index.html is at the project root):
    ```apache path=null start=null
    # C:\xampp\htdocs\vitecap1\CAPSTONE1\.htaccess
    RewriteEngine On
    RewriteBase /vitecap1/CAPSTONE1/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /vitecap1/CAPSTONE1/index.html [L]
    ```
  - Option B (serve from the dist subfolder):
    ```apache path=null start=null
    # C:\xampp\htdocs\vitecap1\CAPSTONE1\.htaccess
    RewriteEngine On
    RewriteBase /vitecap1/CAPSTONE1/
    RewriteRule ^dist/index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /vitecap1/CAPSTONE1/dist/index.html [L]
    ```
- Router basename alignment (optional)
  - To make the router aware of the deployment subpath, pass a basename using Vite's BASE_URL:
    ```jsx path=null start=null
    // src/App.jsx
    import { BrowserRouter as Router } from 'react-router-dom'
    
    export default function App() {
      return (
        <Router basename={import.meta.env.BASE_URL}>
          {/* ... */}
        </Router>
      )
    }
    ```
- Known discrepancies to verify in routing
  - Admin sidebar links to "/announcements" but the route is registered as "/announcement" in src/App.jsx. Choose one path and make them consistent.
  - Staff routes reference <Items /> at path "/items" but no Items component is imported; verify intended component or remove the route.
- Build and deploy to XAMPP quick steps
  1) Build: `npm run build`
  2) Copy the contents of `dist/` into `C:\\xampp\\htdocs\\vitecap1\\CAPSTONE1\\` (or configure Apache to serve the `dist` directory as the web root for this subpath).
  3) Add one of the .htaccess rewrite options above.
  4) Visit: http://localhost/vitecap1/CAPSTONE1/
- Node on Windows
  - If `npm run dev` fails with syntax/ESM errors, check your Node version (`node -v`). Using a modern LTS (e.g., 18+) generally works best with Vite 6 on Windows. Consider nvm-windows to switch versions.
