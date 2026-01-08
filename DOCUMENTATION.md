# eseostrategy Website

A professional, fully responsive website for 'eseostrategy', a digital marketing agency specializing in SEO, Backlinks, and Web Design for competitive niches.

## Project Structure

```
/
├── public/                 # Frontend assets
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   └── main.js         # Frontend logic (forms, nav)
│   ├── assets/
│   │   └── images/         # Images
│   └── index.html          # Main HTML entry point
├── src/                    # Backend logic
│   ├── server.js           # Express server setup & API endpoints
│   └── database.js         # SQLite database connection & schema
├── legacy_converter/       # Old files from previous project
├── package.json            # Project dependencies and scripts
└── DOCUMENTATION.md        # This file
```

## Prerequisites

*   Node.js (v14 or higher)
*   npm (Node Package Manager)

## Installation

1.  Clone the repository or download the project folder.
2.  Open a terminal in the project root directory.
3.  Install dependencies:

    ```bash
    npm install
    ```

    *Note: This will install `express`, `sqlite3`, `body-parser`, and `cors`.*

## Running the Website

1.  Start the server:

    ```bash
    npm start
    ```

2.  Open your web browser and navigate to:

    ```
    http://localhost:3000
    ```

## Functionality

*   **Responsive Design:** Works on mobile, tablet, and desktop.
*   **Contact Form:** Submits data to the backend API (`/api/contact`), which saves it to the SQLite database.
*   **Service Enquiry:** Clicking "Enquire Now" on a service card prefills the contact form with the specific service and submits to `/api/enquiry`.
*   **Database:** Uses SQLite (`eseostrategy.db`) to store contacts and enquiries. The database file is automatically created in the root directory upon first run.

## Database Schema

**Contacts Table:**
*   `id`: INTEGER PRIMARY KEY
*   `name`: TEXT
*   `email`: TEXT
*   `phone`: TEXT
*   `message`: TEXT
*   `created_at`: DATETIME

**Enquiries Table:**
*   `id`: INTEGER PRIMARY KEY
*   `name`: TEXT
*   `email`: TEXT
*   `service`: TEXT
*   `details`: TEXT
*   `created_at`: DATETIME

## API Endpoints

*   `POST /api/contact`: Accepts JSON `{ name, email, phone, message }`
*   `POST /api/enquiry`: Accepts JSON `{ name, email, service, details }`
*   `GET /api/admin/contacts`: Returns a list of all contact submissions (JSON).
