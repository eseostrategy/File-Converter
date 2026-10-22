# PBN Commander — Centralized WordPress & PBN Management Platform

PBN Commander is a centralized WordPress website and Private Blog Network (PBN) management dashboard. It enables users to connect, monitor, publish content to, and manage sidebar widget links across multiple authorized WordPress websites from a single, modern SaaS dashboard without repeatedly logging into each WordPress website.

---

## Key Features

- **Modern SaaS Responsive UI:** Responsive single-page application built with HTML5, CSS3, JavaScript (ES6+), FontAwesome, and Inter typography.
- **Dark Mode & Light Mode:** Toggleable theme with `localStorage` state persistence.
- **Domain & Client Asset Management:** Single domain registration, editing, and CSV/TSV bulk import supporting client URLs (`client_url`) and target keywords (`keyword`). Includes domain URL normalization (`https://`), SSRF protection against internal IP addresses, duplicate validation, custom tags/labels, and internal notes.
- **2-Step Bulk Import Workflow:** Preview parsed CSV/TSV data with row-level status validation (Valid, Duplicate, Invalid) prior to committing valid rows to the database.
- **Custom Client WordPress Plugin:** Custom WordPress plugin connector (`wordpress-plugin/pbn-commander-client/pbn-commander-client.php`) supporting encrypted HMAC SHA-256 signature authorization, 5-minute replay window protection, REST endpoints (`/ping`, `/publish`, `/sidebar-links`), and custom sidebar link widgets.
- **Real WordPress Connectivity:** Actual HTTP API requests dispatched with HMAC signature headers to WordPress endpoints (`/wp-json/pbn-commander/v1/ping`, `/publish`, `/sidebar-links`).
- **Article Publisher & Backlink Engine:** Rich HTML content publishing, post preview, target site selection, post status (`publish` or `draft`), categories, tags, featured image URL, canonical URL, and per-site publishing history logs.
- **Backlink Insertion Modes:** Supports inserting backlinks into published article content via:
  - *Same URL & Keyword for All:* A single client landing page URL and anchor keyword appended across all target sites.
  - *Bulk Pairs (1-to-1 Mapping):* Paste bulk URL and keyword pairs (`https://client.com/page | Anchor Text`) with deterministic 1-to-1 mapping across selected target domains.
- **Manual Domain Paste Matching:** Fast domain matching sidebar tool that parses pasted raw domain lists, matches them against registered connected domains in the SQLite database, reports connection status badges (*Matched Connected*, *Matched Disconnected*, *Unknown Domains*), and automatically selects matched connected target sites.
- **Sidebar Link Management:** Centralized control over sidebar widget links, custom anchor text, target URLs, `rel` attributes (`dofollow`, `nofollow`, `sponsored`, `ugc`), target attributes (`_blank`, `_self`), and campaign names.
- **Activity & Security Audit Log:** Complete event audit trail recording site registration, connection checks, article publishing, sidebar deployments, and security events.
- **Security Hardening:** Express Rate Limiting, Helmet HTTP security headers, input sanitization, timing-safe HMAC signature verification, SSRF blocking of loopback/private IPs, and secure site key masking.

---

## Article Publisher & Backlink Features

### 1. Backlink Insertion Modes
- **Same URL & Keyword for All:** Enter one target URL and anchor keyword. Every selected site receives the same backlink appended safely to the post body using WordPress `wp_kses_post`.
- **Bulk Pairs (1-to-1 Mapping):** Paste bulk backlink lines formatted as `Target URL | Anchor Keyword`. The system validates all URLs and matches line 1 to Site 1, line 2 to Site 2, and so on.

### 2. Manual Domain Paste Box
Located on the right sidebar of the Article Publisher:
1. Paste a list of domain names (one per line).
2. Click **Match & Select Connected Domains**.
3. The dashboard parses and normalizes the domains, matches them against connected sites in SQLite, reports status badges, and automatically checks the matching connected sites for publishing.

---

## Supported Bulk Import CSV/TSV Format

The Bulk Import modal supports both CSV (comma-separated) and TSV (tab-separated) files as well as plain single-column domain lists.

### CSV / TSV Column Headers
```csv
domain,client_url,keyword,label,notes
pbndomain1.com,https://clientsite.com/page,Best SEO Services,Batch 1,Main client blog
pbndomain2.org,client2.org,Backlink Strategy,Batch 1,Secondary blog
```

- `domain` *(Required)*: The URL or hostname of the child WordPress website.
- `client_url` *(Optional)*: The target client landing page URL. Validated as HTTP/HTTPS.
- `keyword` *(Optional)*: Plain text target anchor keyword.
- `label` *(Optional)*: Categorization tag.
- `notes` *(Optional)*: Internal reference note.

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
