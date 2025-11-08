#!/usr/bin/env node
const CYBRO_API_URL = process.env.CYBRO_API_URL || 'https://dev-v2-api.cybro.io/api/v1/dashboard/aum';
const DUNE_API_URL = process.env.DUNE_API_URL;
const DUNE_API_KEY = process.env.DUNE_API_KEY;
const DUNE_DATASET_ID = process.env.DUNE_DATASET_ID;

if (!DUNE_API_URL || !DUNE_API_KEY) process.exit(2);

async function main(){
  const res = await fetch(CYBRO_API_URL);
  if (!res.ok) throw new Error(`Cybro fetch failed: ${res.status}`);
  const payload = await res.json();
  const { aum_usd, day } = payload.data || {};
  if (aum_usd === undefined || day === undefined) throw new Error('Missing fields');
  let dayIso;
  const d = new Date(day);
  dayIso = isNaN(d.getTime()) ? String(day) : d.toISOString().slice(0,10);
  const csv = `day,aum_usd\n${dayIso},${String(aum_usd).trim()}\n`;
  let uploadUrl = DUNE_API_URL;
  if (DUNE_DATASET_ID) uploadUrl = `${uploadUrl}${uploadUrl.includes('?') ? '&' : '?'}dataset_id=${encodeURIComponent(DUNE_DATASET_ID)}`;
  const uploadRes = await fetch(uploadUrl, {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${DUNE_API_KEY}`, 'Content-Type':'text/csv', 'Accept':'application/json' },
    body:csv
  });
  if (!uploadRes.ok) throw new Error(`Dune upload failed: ${uploadRes.status}`);
  process.exit(0);
}

main().catch(()=>process.exit(1));