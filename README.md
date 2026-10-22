# PBN Commander — Centralized WordPress & PBN Management Platform

PBN Commander is a centralized WordPress website and Private Blog Network (PBN) management dashboard. It enables users to connect, monitor, publish content to, and manage sidebar widget links across multiple authorized WordPress websites from a single, modern SaaS dashboard without repeatedly logging into each WordPress website.

---

## Key Features

- **Modern SaaS Responsive UI:** Responsive single-page application built with HTML5, CSS3, JavaScript (ES6+), FontAwesome, and Inter typography.
- **Dark Mode & Light Mode:** Toggleable theme with `localStorage` state persistence.
- **Domain Selection & Ordering Engine:** Select connected target domains from checkboxes or paste raw domain lists. Resolves pasted domain text against registered connected domains with status badges (*Connected*, *Disconnected*, *Unknown*, *Invalid*), preserves explicit user domain order, and provides up/down reordering controls.
- **Side-by-Side Multiline Client URL & Keyword Entry:** Two side-by-side multiline text boxes modeled on user specifications ("Client URL" and "Client Keyword"). Supports:
  - *Different URL & Keyword for each domain:* Line 1 URL pairs with Line 1 Keyword, Line 2 with Line 2, mapped 1-to-1 to Position 1, Position 2 of the ordered domain list.
  - *Same URL & Keyword for all domains:* One URL and anchor keyword applied across all target domains.
- **Normal & Spin Syntax Article Engine:**
  - *Normal Article Mode:* Static HTML or plain text content publishing with live preview.
  - *Spin Syntax Mode:* Supports `{option1|option2}` syntax with nested choice support and fallback handling. Includes two explicit variation strategies: **One unique variation per domain** vs **One shared variation**.
- **Live Final Ordered Mapping Preview:** Real-time preview table displaying `Order | Target Domain | Client URL | Client Keyword | Content Preview` prior to submission.
- **2-Step Bulk Import Workflow:** Preview parsed CSV/TSV data with row-level status validation (Valid, Duplicate, Invalid) prior to committing valid rows to the database.
- **Custom Client WordPress Plugin:** Custom WordPress plugin connector (`wordpress-plugin/pbn-commander-client/pbn-commander-client.php`) supporting encrypted HMAC SHA-256 signature authorization, 5-minute replay window protection, REST endpoints (`/ping`, `/publish`, `/sidebar-links`), and custom sidebar link widgets.
- **Real WordPress Connectivity:** Actual HTTP API requests dispatched with HMAC signature headers to WordPress endpoints (`/wp-json/pbn-commander/v1/ping`, `/publish`, `/sidebar-links`).
- **Sidebar Link Management Engine:** Apply the same ordered domain selection and side-by-side URL/keyword pairing to sidebar widget link deployments across target sites.
- **Activity & Security Audit Log:** Complete event audit trail recording site registration, connection checks, article publishing, sidebar deployments, and security events.
- **Security Hardening:** Express Rate Limiting, Helmet HTTP security headers, input sanitization, timing-safe HMAC signature verification, SSRF blocking of loopback/private IPs, and secure site key masking.

---

## Article Publishing & Sidebar Link Workflows

### 1. Selected Target Domains & Ordering
1. Select target websites via checkboxes or paste domain names in the **Manual Domain Paste Box** (one domain per line).
2. Click **Resolve & Order Domains**. The system matches pasted lines against registered connected domains in SQLite, highlights status badges (*Connected*, *Disconnected*, *Unknown*, *Invalid*), and checks the matched connected sites.
3. Adjust domain priority using the **Up** and **Down** arrow buttons. This exact order determines how URLs, keywords, and spin syntax variations are assigned.

### 2. Side-by-Side URL & Keyword Entry
1. In the **Backlink URL & Keyword Entry** section, choose your assignment mode:
   - **Different URL & Keyword for each domain:** Paste one Client URL per line in the left box and one Client Keyword per line in the right box. Line N pairs with Line N for Domain N.
   - **Same URL & Keyword for all selected domains:** Enter one URL and one keyword applied to all target domains.
2. The **Final Ordered Mapping Preview** table updates in real time to show the exact row-by-row mapping (`Order | Target Domain | Client URL | Client Keyword | Content Preview`).

### 3. Normal & Spin Syntax Article Modes
- **Normal Article:** Paste or write static HTML content.
- **Spin Syntax Article:** Write or paste HTML containing `{option 1|option 2|option 3}` syntax.
  - Choose **One unique variation per domain** to generate a distinct, deterministic variation seeded by domain name.
  - Choose **One shared variation** to generate one variation and publish it to all selected target sites.

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
# Run all 50 backend unit, integration, and mocked WordPress connectivity tests
npm test

# Run Playwright E2E visual UI screenshot/video tests
npm run test:e2e
```

---

## License

This project is licensed under the MIT License.
