# Muhammad Akram Portfolio & Visual Admin Studio
## Production Deployment Guide: GitHub → cPanel → Node.js → MySQL

This guide provides step-by-step instructions for deploying the **Muhammad Akram Portfolio & Visual Admin Studio** onto a standard **cPanel hosting account with Node.js and MySQL**.

---

### System Architecture Overview

```
GitHub Repository (Source Code Version Control)
       ↓  (Git pull / cPanel Git Version Control)
cPanel Hosting Server
       ↓
Node.js Application (Express Runtime / Phusion Passenger)
       ↓
MySQL Relational Database (All Portfolio Content, Drafts, Versions, Users)
       ↓
cPanel Persistent Disk Storage (public/uploads/)
```

* **Public Website:** `https://your-domain.com/` (fast, SEO-optimized, cached)
* **Visual Admin Studio:** `https://your-domain.com/studio` (secure, private visual builder)
* **Admin Login:** Salted PBKDF2 hash verification, HttpOnly session cookie, rate limiting.

---

### Prerequisites on cPanel

1. **cPanel Account** with **Setup Node.js App** (CloudLinux NodeJS Selector or Passenger enabled).
2. **MySQL Database** access in cPanel.
3. Node.js version **18.x, 20.x, or 22.x** available in cPanel.
4. SSH Terminal access (optional, but convenient; all steps can also be done via cPanel UI).

---

### STEP 1: Create MySQL Database & User in cPanel

1. Log into your **cPanel Dashboard**.
2. Navigate to **Databases** → **MySQL® Databases**.
3. **Create New Database:**
   - Database Name: `akram_portfolio` (cPanel will prepend your account username, e.g. `cpaneluser_akram_portfolio`).
   - Click **Create Database**.
4. **Create Database User:**
   - Username: `akram_user` (e.g. `cpaneluser_akram_user`).
   - Password: Click **Password Generator** to create a strong password. Save this password securely!
   - Click **Create User**.
5. **Add User to Database:**
   - Select your user and database.
   - Click **Add**.
   - Check **ALL PRIVILEGES**.
   - Click **Make Changes**.

---

### STEP 2: Clone or Upload the GitHub Repository

#### Option A: Using cPanel Git™ Version Control (Recommended)
1. In cPanel, go to **Files** → **Git™ Version Control**.
2. Click **Create**.
3. Enter your **Clone URL** (your GitHub repository HTTPS URL).
4. Set the **Repository Path**: e.g., `/home/username/portfolio_app` (keep it outside `public_html` for best security, or in a subfolder).
5. Click **Create**. cPanel will clone the repository.

#### Option B: Using SSH
```bash
ssh username@your-server-ip
cd ~
git clone https://github.com/your-username/akram-portfolio.git portfolio_app
cd portfolio_app
```

---

### STEP 3: Configure "Setup Node.js App" in cPanel

1. In cPanel, navigate to **Software** → **Setup Node.js App**.
2. Click **Create Application**.
3. Configure the following fields:
   - **Node.js version:** Select `20.x` or `22.x` (or `18.x`).
   - **Application mode:** `Production`.
   - **Application root:** `portfolio_app` (path to your cloned repository).
   - **Application URL:** Select your primary domain or subdomain (e.g. `your-domain.com`).
   - **Application startup file:** `app.js` (or `server.js`).
4. Under **Environment variables**, click **Add Variable** and enter:
   - `DB_HOST`: `localhost`
   - `DB_PORT`: `3306`
   - `DB_NAME`: `cpaneluser_akram_portfolio` (your actual cPanel database name)
   - `DB_USER`: `cpaneluser_akram_user` (your actual cPanel database user)
   - `DB_PASSWORD`: `your_strong_mysql_password`
   - `STUDIO_ADMIN_EMAIL`: `admin@muhammadakram.dev` (or your personal admin email)
   - `STUDIO_ADMIN_PASSWORD`: `YourVeryStrongProductionPasskey123!`
   - `STORAGE_PROVIDER`: `local`
   - `NODE_ENV`: `production`
5. Click **Create**.
6. The app will be created and cPanel will display a command to activate the virtual environment.

---

### STEP 4: Install Dependencies and Build the Application

In the cPanel Node.js App interface, you can click **Run NPM Install**, or enter via SSH/Terminal:

```bash
# 1. Activate the cPanel Node.js virtual environment (command shown at top of cPanel Node app screen):
source /home/username/nodevenv/portfolio_app/20/bin/activate && cd /home/username/portfolio_app

# 2. Install production & build dependencies:
npm install

# 3. Compile the Vite client bundle and the production server bundle:
npm run build
```

This compiles:
- `dist/` — Optimized frontend SPA assets (HTML, CSS, JS, images).
- `dist/server.js` — Standalone bundled production backend.

---

### STEP 5: Initialize the MySQL Database Migrations

You can run the migration script directly from the terminal or let the server run it automatically on startup:

```bash
npm run db:migrate
```

**What this does automatically:**
1. Connects to your MySQL database.
2. Creates all 21 production tables (`users`, `portfolio_settings`, `sections`, `hero_content`, `about_content`, `skills`, `services`, `projects`, `project_gallery`, `experience`, `contact_settings`, `navigation_items`, `footer_settings`, `media`, `media_references`, `drafts`, `published_versions`, `version_history`, `sessions`, `audit_logs`).
3. Seeds all baseline portfolio showcase data from `initialPortfolioData.ts`.
4. Creates your initial immutable baseline Version History record (`v1.0.0`).
5. Prepares your administrator account with salted PBKDF2 hashing.

---

### STEP 6: Media Uploads Directory Permissions

Ensure that the media upload folder has writable permissions for the Node.js process:

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

---

### STEP 7: Start / Restart the Application

1. In the cPanel **Setup Node.js App** interface, click **Restart**.
2. Open your domain in your browser:
   - **Public Portfolio:** `https://your-domain.com/`
   - **System Diagnostics:** `https://your-domain.com/api/status`
   - **Visual Admin Studio:** `https://your-domain.com/studio`
3. Log into the Visual Admin Studio using your configured `STUDIO_ADMIN_EMAIL` and `STUDIO_ADMIN_PASSWORD`.

---

### STEP 8: Future Updates from GitHub (One-Click Pull)

Whenever you push changes or updates to your GitHub repository:
1. Go to cPanel **Git™ Version Control**.
2. Select your repository and click **Pull or Deploy** → **Update from Remote**.
3. If new packages or migrations were added, open the Node.js App and click **Run NPM Install** and run `npm run build`.
4. Click **Restart Application**.

---

### Production Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **500 Internal Server Error** | Port or environment variable error | Check `stderr.log` in your application root folder. Verify `DB_PASSWORD` and `DB_NAME`. |
| **"Cannot GET /studio"** | Static file serving not routing SPA | Verify that `.htaccess` is present and `dist/` folder was generated with `npm run build`. |
| **Database Connection Refused** | Incorrect `DB_HOST` or MySQL port | On cPanel, `DB_HOST` should be `localhost` or `127.0.0.1`. Verify database user privileges in cPanel. |
| **Uploads return 404** | Missing `public/uploads` directory | Run `mkdir -p public/uploads && chmod 755 public/uploads`. |
| **Admin login fails** | Passkey mismatch | Verify `STUDIO_ADMIN_PASSWORD` in your cPanel Node.js environment variables. |
