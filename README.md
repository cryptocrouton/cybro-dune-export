```markdown
# cybro-dune-export

Fetches the AUM value from the Cybro back-end and uploads it to Dune as a CSV row.

What it does
- GET the AUM data from Cybro's API (default: https://dev-v2-api.cybro.io/api/v1/dashboard/aum)
- Extracts `aum_usd` and `day`
- Builds a CSV with headers `day,aum_usd`
- POSTs the CSV to a Dune API endpoint

Configuration (environment variables)
- DUNE_API_URL (required) — the Dune endpoint that accepts CSV uploads (e.g. an import endpoint in your Dune setup)
- DUNE_API_KEY (required) — the API key for Dune (stored as a GitHub Secret)
- CYBRO_API_URL (optional) — override the Cybro endpoint (default is the dev endpoint shown above)
- DUNE_DATASET_ID (optional) — appended as `?dataset_id=...` to the DUNE_API_URL if provided

Usage
- Locally:
  - Set environment variables DUNE_API_URL and DUNE_API_KEY and run:
    ```bash
    node index.js
    ```
- In GitHub Actions:
  - See .github/workflows/export.yml for an example workflow that runs on schedule and on-demand.

Notes about Dune
- This repository does not hardcode a Dune endpoint — provide the correct DUNE_API_URL for your organization (Dune's ingestion/import endpoint or whichever endpoint you use to receive CSVs).
- The script sends CSV as `text/csv` and uses `Authorization: Bearer <DUNE_API_KEY>`.

License: MIT
```