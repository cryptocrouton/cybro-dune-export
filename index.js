#!/usr/bin/env node
const CYBRO_API_URL = process.env.CYBRO_API_URL;
const DUNE_API_URL = process.env.DUNE_API_URL;
const DUNE_API_KEY = process.env.DUNE_API_KEY;
const DUNE_DATASET_ID = process.env.DUNE_DATASET_ID;

if (!DUNE_API_URL || !DUNE_API_KEY) {
  console.error("Missing DUNE_API_URL or DUNE_API_KEY");
  process.exit(2);
}

async function main() {
  if (!CYBRO_API_URL) {
    throw new Error("CYBRO_API_URL is not set");
  }

  const res = await fetch(CYBRO_API_URL);
  if (!res.ok) throw new Error(`Cybro fetch failed: ${res.status}`);

  const payload = await res.json();
  const { aum_usd, day } = payload.data || {};
  if (aum_usd === undefined || day === undefined) {
    throw new Error("Missing fields in Cybro response");
  }

  const d = new Date(day);
  const dayIso = isNaN(d.getTime()) ? String(day) : d.toISOString().slice(0, 10);

  const csv = `day,aum_usd\n${dayIso},${String(aum_usd).trim()}\n`;

  let uploadUrl = DUNE_API_URL;
  if (DUNE_DATASET_ID) {
    uploadUrl = `${uploadUrl}${uploadUrl.includes("?") ? "&" : "?"}dataset_id=${encodeURIComponent(DUNE_DATASET_ID)}`;
  }

  const body = {
    data: csv,
    description: "Cybro total assets under management in USD",
    table_name: "cybro_aum_usd",
    is_private: false,
  };

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-DUNE-API-KEY": DUNE_API_KEY,
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "<no body>");
    throw new Error(`Dune upload failed: ${uploadRes.status} — ${text}`);
  }

  const respJson = await uploadRes.json().catch(() => null);
  console.log("Dune upload successful:", respJson || "<no json>");
}

main().catch(err => {
  console.error("Script failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
