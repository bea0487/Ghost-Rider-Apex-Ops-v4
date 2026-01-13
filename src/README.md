# Ghost-Rider v4.0 - System Instructions

## Project Overview
A web application built with **Vite**, **React**, and **Tailwind CSS**, utilizing **Supabase** for the backend/database and **Vercel** for deployment.

## Technical Stack
- **Frontend:** React + Vite
- **Styling:** Tailwind CSS / PostCSS
- **Backend/Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Setup & Execution for AI Agents
1. **Dependency Installation:** - Use `npm install` to ensure all packages in `package.json` are present.
2. **Environment Variables:**
   - Refer to `.env.example` to create a `.env` file.
   - Required keys: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. **Local Development:**
   - Run `npm run dev` to start the Vite development server.
   - The default local URL is `http://localhost:5173`.
4. **Database Schema:**
   - See `schema.sql` for the current Supabase table structures.
5. **Build Process:**
   - Run `npm run build` to verify the production build via Vite.

## AI Debugging Protocol
- **Primary Entry Point:** `src/main.jsx` or `src/App.jsx`.
- **Styling Issues:** Check `tailwind.config.js` and `src/index.css`.
- **Database Issues:** Check `src/supabase/` (if folder exists) or `supabaseClient.js`.
- **Verification:** Always run `npm run build` after major fixes to ensure no TypeScript/Linting breaks.