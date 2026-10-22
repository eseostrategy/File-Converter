# PBN Commander — Centralized WordPress & PBN Management Platform

PBN Commander is a centralized WordPress website and Private Blog Network (PBN) management dashboard. It enables users to connect, monitor, publish content to, and manage sidebar widget links across multiple authorized WordPress websites from a single, modern SaaS dashboard without repeatedly logging into each WordPress website.

---

## Key Features

- **Modern SaaS Responsive UI:** Responsive single-page application built with HTML5, CSS3, JavaScript (ES6+), FontAwesome, and Inter typography.
- **Dark Mode & Light Mode:** Toggleable theme with `localStorage` state persistence.
- **Domain Management:** Add single websites, bulk import via one-domain-per-line list, domain URL normalization (`https://`), SSRF protection against internal IP addresses, duplicate validation, custom tags/labels, and internal notes.
- **Custom Client WordPress Plugin:** Custom WordPress plugin connector (`wordpress-plugin/pbn-commander-client/pbn-commander-client.php`) supporting encrypted HMAC SHA-256 signature authorization, 5-minute replay window protection, REST endpoints (`/ping`, `/publish`, `/sidebar-links`), and custom sidebar link widgets.
- **Real WordPress Connectivity:** Actual HTTP API requests dispatched with HMAC signature headers to WordPress endpoints (`/wp-json/pbn-commander/v1/ping`, `/publish`, `/sidebar-links`).
- **Article Publisher Engine:** Rich HTML content publishing, post preview, target site selection, post status (`publish` or `draft`), categories, tags, featured image URL, canonical URL, and per-site publishing history logs.
- **Sidebar Link Management:** Centralized control over sidebar widget links, custom anchor text, target URLs, `rel` attributes (`dofollow`, `nofollow`, `sponsored`, `ugc`), target attributes (`_blank`, `_self`), and campaign names.
- **Activity & Security Audit Log:** Complete event audit trail recording site registration, connection checks, article publishing, sidebar deployments, and security events.
- **Security Hardening:** Express Rate Limiting, Helmet HTTP security headers, input sanitization, timing-safe HMAC signature verification, SSRF blocking of loopback/private IPs, and secure site key masking.

---

## Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **WordPress Target Sites:** WordPress v5.0+ with REST API enabled

---

## Local Installation & Quickstart Guide

1. **Clone Repository & Install Dependencies:**
   ```bash
   git clone https://github.com/your-username/pbn-commander.git
   cd pbn-commander
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` if necessary:*
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=super-secret-pbn-commander-jwt-key
   DB_PATH=./pbn_commander.db
   ```

3. **Start the Application:**
   ```bash
   npm start
   ```
   Access the dashboard in your web browser at `http://localhost:3000`.

---

## WordPress Child Website Integration Guide

1. Log in to your PBN Commander Dashboard (`http://localhost:3000`).
2. Navigate to the **WP Plugin Client** tab in the sidebar and click **Download Plugin ZIP** (`pbn-commander-client.zip`).
3. Log in to your child WordPress admin panel (`https://yourchildsite.com/wp-admin`).
4. Go to **Plugins &rarr; Add New &rarr; Upload Plugin**, upload `pbn-commander-client.zip`, and click **Activate Plugin**.
5. In your WordPress sidebar, click on **PBN Commander**.
6. In the PBN Commander Dashboard, register the website domain in the **Domains & Sites** section, click **Key** to copy the generated **Site API Key**, and paste it into the plugin settings page on WordPress. Click **Save Credentials**.
7. In the PBN Commander Dashboard, click **Ping** or **Ping All Sites** to confirm authorization status.

### Sidebar Widget Placement Note
To display deployed sidebar links on your child website frontend:
1. In WordPress admin, go to **Appearance &rarr; Widgets** (or **Appearance &rarr; Site Editor** for block themes).
2. Add the **PBN Commander Sidebar Link** widget to your main Sidebar widget area.
3. When you deploy a sidebar link campaign from the PBN Commander Dashboard, the widget automatically renders the configured link, anchor text, rel attribute, and header on the frontend!

---

## Automated Test Suite

Run unit, integration, and UI verification tests:

```bash
# Run all backend unit, integration, and mocked WordPress connectivity tests
npm test

# Run Playwright E2E visual UI screenshot/video tests
npm run test:e2e
```

---

## License

This project is licensed under the MIT License.
