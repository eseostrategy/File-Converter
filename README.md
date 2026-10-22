# PBN Commander — Centralized WordPress & PBN Management Platform

PBN Commander is a centralized WordPress website and Private Blog Network (PBN) management dashboard. It enables users to connect, monitor, publish content to, and manage sidebar widget links across multiple authorized WordPress websites from a single, modern SaaS dashboard without repeatedly logging into each WordPress website.

---

## Dual WordPress Plugin Architecture

PBN Commander uses **two separate, independently installable child plugins** that connect to the same central PBN Commander API using a shared Site API Key and HMAC SHA-256 request signing:

1. **PBN Commander Post Manager** (`pbn-commander-post-manager.zip`)
   - Handles remote article publishing only (title, HTML content, status, categories, tags, featured images, canonical URLs, and article backlinks).
   - Exposes REST API namespace: `/wp-json/pbn-commander-post/v1/`
2. **PBN Commander Sidebar Manager** (`pbn-commander-sidebar-manager.zip`)
   - Handles sidebar links and backlink widget deployments only (destination URLs, anchor text, `rel` attributes, target attributes, and widget headers).
   - Exposes REST API namespace: `/wp-json/pbn-commander-sidebar/v1/`

*Note:* Neither plugin requires installing the other. The central dashboard tracks connection statuses independently for each plugin per domain.

---

## Key Features

- **Modern SaaS Responsive UI:** Responsive single-page application built with HTML5, CSS3, JavaScript (ES6+), FontAwesome, and Inter typography.
- **Dark Mode & Light Mode:** Toggleable theme with `localStorage` state persistence.
- **Independent Plugin Status Tracking:** Monitor Post Manager and Sidebar Manager connectivity statuses independently for every registered website.
- **Domain Selection & Ordering Engine:** Select connected target domains from checkboxes or paste raw domain lists. Resolves pasted domain text against registered connected domains with status badges (*Connected*, *Disconnected*, *Unknown*, *Invalid*), preserves explicit user domain order, and provides up/down reordering controls.
- **Side-by-Side Multiline Client URL & Keyword Entry:** Two side-by-side multiline text boxes ("Client URL" and "Client Keyword"). Supports:
  - *Different URL & Keyword for each domain:* Line N URL pairs with Line N Keyword, mapped 1-to-1 to Position N of the ordered domain list.
  - *Same URL & Keyword for all domains:* One URL and anchor keyword applied across all target domains.
- **Normal & Spin Syntax Article Engine:**
  - *Normal Article Mode:* Static HTML or plain text content publishing with live preview.
  - *Spin Syntax Mode:* Supports `{option1|option2}` syntax with nested choice support. Offers two explicit variation strategies: **One unique variation per domain** vs **One shared variation**.
- **Downloadable Campaign Reports (CSV):** Generates downloadable CSV backlink completion reports after each campaign deployment. Includes client URL, keyword, target domain, status, error details, and completion timestamps with safe RFC 4180 CSV escaping.
- **2-Step Bulk Import Workflow:** Preview parsed CSV/TSV data with row-level status validation (Valid, Duplicate, Invalid) prior to committing valid rows to the database.
- **Security Hardening:** Express Rate Limiting, Helmet HTTP security headers, input sanitization, timing-safe HMAC signature verification, SSRF blocking of loopback/private IPs, and secure site key masking.

---

## Plugin Setup & Installation Instructions

### 1. Post Manager Plugin Setup
1. In PBN Commander Dashboard, open the **WP Plugins Client** tab.
2. Click **Download Post Manager ZIP** (`pbn-commander-post-manager.zip`).
3. In child WordPress admin panel (`https://yourchildsite.com/wp-admin`), go to **Plugins &rarr; Add New &rarr; Upload Plugin**, upload `pbn-commander-post-manager.zip`, and click **Activate Plugin**.
4. Click on **PBN Post Manager** in your WordPress sidebar.
5. In PBN Commander Dashboard, copy your domain's generated **Site API Key** and paste it into the plugin settings page. Click **Save Credentials**.
6. In PBN Commander Dashboard, click **Ping Post Manager** to verify connectivity.

### 2. Sidebar Manager Plugin Setup
1. In PBN Commander Dashboard, open the **WP Plugins Client** tab.
2. Click **Download Sidebar Manager ZIP** (`pbn-commander-sidebar-manager.zip`).
3. In child WordPress admin panel, go to **Plugins &rarr; Add New &rarr; Upload Plugin**, upload `pbn-commander-sidebar-manager.zip`, and click **Activate Plugin**.
4. Click on **PBN Sidebar Link** in your WordPress sidebar and paste the same **Site API Key**. Click **Save Credentials**.
5. Go to **Appearance &rarr; Widgets** (or **Appearance &rarr; Editor** for block themes) and add the **PBN Commander Sidebar Link** widget to your active sidebar or footer area.
6. In PBN Commander Dashboard, click **Ping Sidebar Manager** to verify connectivity.

---

## Exporting Backlink Completion Reports

1. Navigate to the **Sidebar Links** tab in the PBN Commander Dashboard.
2. Fill out the campaign parameters, select target domains, and click **Deploy Links to Ordered Domains**.
3. Upon completion, PBN Commander automatically records the per-site results reported by the Sidebar Manager plugins and generates an Excel/Google Sheets-compatible CSV report.
4. In the **Backlink Campaign Completion Reports (CSV)** table, click **Download CSV** to download the report file formatted as `<campaign_slug>_report_<YYYY-MM-DD>.csv`.

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

3. **Start the Application:**
   ```bash
   npm start
   ```
   Access the dashboard in your web browser at `http://localhost:3000`.

---

## Automated Test Suite

Run unit, integration, and UI verification tests:

```bash
# Run all 54 backend unit, integration, and mocked WordPress connectivity tests
npm test

# Run Playwright E2E visual UI screenshot/video tests
npm run test:e2e
```

---

## License

This project is licensed under the MIT License.
