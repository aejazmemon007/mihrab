# Mihrab Production Deployment Guide (https://theboxux.com)

This guide provides step-by-step instructions to take the Mihrab application live on **`https://theboxux.com`**.

---

## 1. Quick Architecture & Configuration Summary

- **App Framework:** Next.js 16 (App Router + Turbopack/Webpack)
- **Target URL:** `https://theboxux.com`
- **Port:** `3000` (internal / upstream)
- **Node.js Engine:** `>= 20.x`
- **Environment Variables:**
  - `SITE_URL=https://theboxux.com`
  - `ADMIN_PASSWORD=mihrab2026`
  - `NEXT_PUBLIC_ADMIN_WHATSAPP=918980643688`

---

## 2. Option A: Deploy to Vercel (Fastest & Recommended)

Vercel is the native platform for Next.js and includes free automated SSL, edge caching, and global CDN with Mumbai (`bom1`) edge nodes.

### Step 1: Push Project to GitHub
```bash
git add .
git commit -m "feat: production ready for theboxux.com"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USER>/mihrab.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New"** > **"Project"** and select your GitHub repository.
3. Under **Environment Variables**, add:
   - `SITE_URL` = `https://theboxux.com`
   - `ADMIN_PASSWORD` = `mihrab2026` (or your chosen secure password)
   - `NEXT_PUBLIC_ADMIN_WHATSAPP` = `918980643688`
4. Click **Deploy**.

### Step 3: Connect `theboxux.com` Domain
1. In your Vercel project dashboard, navigate to **Settings** > **Domains**.
2. Type `theboxux.com` and click **Add**.
3. Vercel will prompt you to configure your DNS records at your domain registrar (GoDaddy, Namecheap, Cloudflare, Hostinger, etc.):

| Record Type | Host / Name | Target / Value | TTL |
|---|---|---|---|
| **A** | `@` | `76.76.21.21` | Automatic / 300 |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic / 300 |

*Once DNS propagates (usually 5 to 30 minutes), Vercel automatically issues a free Let's Encrypt SSL certificate.*

---

## 3. Option B: Deploy to VPS / Cloud Server (Ubuntu / Linux)

If you have a Linux VPS (DigitalOcean, Hostinger VPS, Linode, AWS EC2, Hetzner), you can host with PM2 and Nginx reverse proxy.

### Step 1: Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

### Step 2: Clone & Build
```bash
cd /var/www
git clone https://github.com/<YOUR_GITHUB_USER>/mihrab.git
cd mihrab
npm ci
npm run build
```

### Step 3: Run with PM2
```bash
pm2 start npm --name "mihrab" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy
Edit `/etc/nginx/sites-available/theboxux.com`:
```nginx
server {
    server_name theboxux.com www.theboxux.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site & SSL:
```bash
sudo ln -s /etc/nginx/sites-available/theboxux.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d theboxux.com -d www.theboxux.com
```

---

## 4. Option C: Run via Docker

```bash
# Build the production image
docker build -t mihrab-app .

# Run container on port 3000
docker run -d -p 3000:3000 --name mihrab -v $(pwd)/data:/app/data mihrab-app
```

---

## 5. Instant Test Right Now (Temporary Public HTTPS Tunnel)

To test on your mobile phone or share with other people right this moment without waiting for DNS propagation:
```bash
npx untun tunnel http://localhost:3000
```
This produces a live public HTTPS address that forwards all traffic directly to your running local instance.
