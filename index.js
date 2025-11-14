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
  const res = await fetch(CYBRO_API_URL);
  if (!res.ok) throw new Error(`Cybro fetch failed: ${res.status}`);
  
  const payload = await res.json();
  const { aum_usd, day } = payload.data || {};
  if (aum_usd === undefined || day === undefined) {
    throw new Error("Missing fields");
  }

  const d = new Date(day);
  const dayIso = isNaN(d.getTime()) ? String(day) : d.toISOString().slice(0, 10);

  const csv = `day,aum_usd\n${dayIso},${String(aum_usd).trim()}\n`;

  let uploadUrl = DUNE_API_URL;
  if (DUNE_DATASET_ID) {
    uploadUrl = `${uploadUrl}${uploadUrl.includes('?') ? '&' : '?'}dataset_id=${encodeURIComponent(DUNE_DATASET_ID)}`;
  }

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DUNE_API_KEY}`,
      "Content-Type": "text/csv",
      "Accept": "application/json",
    },
    body: csv,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => "<no body>");
    throw new Error(`Dune upload failed: ${uploadRes.status} — ${text}`);
  }
}

main().catch(err => {
  console.error("Script failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
