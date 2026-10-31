# Mihrab Production Deployment Guide (Subdomain)

Target URL: **`https://mihrab-masjid.theboxux.com`**

---

## 1. Environment Configuration

The project is pre-configured with:
- `SITE_URL=https://mihrab-masjid.theboxux.com`
- `ADMIN_PASSWORD=mihrab2026`
- `NEXT_PUBLIC_ADMIN_WHATSAPP=918980643688`

---

## 2. Option A: cPanel / Shared Hosting (via "Setup Node.js App")

Since you have already created the subdomain **`mihrab-masjid.theboxux.com`** in cPanel:

### Step 1: Upload Project Files
1. Open cPanel **File Manager**.
2. Navigate to the document root folder created for your subdomain (e.g. `public_html/mihrab-masjid` or `/mihrab-masjid.theboxux.com`).
3. Upload and extract **`mihrab-project.zip`** directly into that directory.
4. Ensure the `.env.production` file is renamed or copied as `.env` in that root folder.

### Step 2: Configure Node.js App in cPanel
1. In cPanel, search for **"Setup Node.js App"** (or **"Node.js Selector"**).
2. Click **Create Application**:
   - **Node.js version:** Select `20.x` (or highest available `18+` or `20+`).
   - **Application mode:** `Production`
   - **Application root:** The folder path where you uploaded the files (e.g. `mihrab-masjid.theboxux.com` or `public_html/mihrab-masjid`).
   - **Application URL:** Select `mihrab-masjid.theboxux.com`.
   - **Application startup file:** `server.js`
3. Click **Create**.

### Step 3: Install Packages and Build
1. Click **"Run NPM Install"** in the cPanel Node.js dashboard.
2. In the terminal or via the command runner, run:
   ```bash
   npm run build
   ```
3. Click **"Restart"** application.
4. Visit `https://mihrab-masjid.theboxux.com`!

---

## 3. Option B: Vercel (Edge Cloud Hosting)

If you host via Vercel:

### Step 1: Push & Deploy
1. Push this project to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Environment Variables**, set:
   - `SITE_URL` = `https://mihrab-masjid.theboxux.com`
   - `ADMIN_PASSWORD` = `mihrab2026`
   - `NEXT_PUBLIC_ADMIN_WHATSAPP` = `918980643688`
4. Click **Deploy**.

### Step 2: Connect Subdomain
1. In Vercel Project > **Settings** > **Domains**.
2. Enter: `mihrab-masjid.theboxux.com`.
3. In your DNS manager (where `theboxux.com` DNS is managed), add this CNAME record:
   - **Type:** `CNAME`
   - **Name:** `mihrab-masjid`
   - **Target / Value:** `cname.vercel-dns.com`

---

## 4. Option C: Ubuntu VPS with Nginx & PM2

### Step 1: Clone & Run
```bash
cd /var/www/mihrab-masjid
git clone <YOUR_REPO> .
npm ci
npm run build
pm2 start server.js --name "mihrab-masjid"
pm2 save
```

### Step 2: Nginx Virtual Host
```nginx
server {
    server_name mihrab-masjid.theboxux.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d mihrab-masjid.theboxux.com
```
