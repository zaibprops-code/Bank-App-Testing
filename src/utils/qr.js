// Payment-QR decoding.
//
// The primary format we target is the EMVCo Merchant-Presented QR standard —
// the same TLV (Tag / Length / Value) encoding used by Raast, 1LINK and the
// merchant QRs printed at tills across Pakistan. We also fall back to a few
// simpler encodings (JSON, URL query strings, UPI-style, plain numbers) so a
// wide range of real-world QRs auto-fill the form instead of failing.
//
// Every parser returns a normalized object:
//   { name, account, tillId, amount, city, currency, raw, format }
// with empty strings for anything the QR did not carry.

// ---- EMVCo TLV helpers ------------------------------------------------------

// Walk a TLV string into { [tag]: value }. EMVCo tags are 2 digits, the length
// is 2 decimal digits, then that many characters of value. Malformed tails are
// ignored rather than throwing so a partial or odd QR still yields what it can.
function parseTLV(str) {
  const out = {};
  let i = 0;
  while (i + 4 <= str.length) {
    const tag = str.slice(i, i + 2);
    const len = parseInt(str.slice(i + 2, i + 4), 10);
    if (Number.isNaN(len)) break;
    const start = i + 4;
    const end = start + len;
    if (end > str.length) break;
    out[tag] = str.slice(start, end);
    i = end;
  }
  return out;
}

// Does the string look like the EMVCo payload? It must start with the Payload
// Format Indicator (tag "00", length "02", value "01") and end with the CRC
// tag "63". We check the prefix; the CRC presence is a soft signal.
function looksLikeEmv(str) {
  return /^000201/.test(str) || /6304[0-9A-Fa-f]{4}$/.test(str);
}

// Pick the value that most resembles an account / IBAN / mobile number from a
// set of candidate strings: mostly digits, reasonably long, longest wins.
function pickAccountLike(candidates) {
  let best = '';
  for (const c of candidates) {
    if (!c) continue;
    const digits = c.replace(/\D/g, '');
    if (digits.length < 6) continue;
    // Prefer IBAN-looking (starts with 2 letters) or the longest digit run.
    if (c.length > best.length) best = c;
  }
  return best;
}

function parseEmv(str) {
  const top = parseTLV(str);

  // Merchant name (59) and city (60).
  const name = (top['59'] || '').trim();
  const city = (top['60'] || '').trim();

  // Transaction amount (54) and currency (53, ISO 4217 numeric — 586 = PKR).
  const amount = (top['54'] || '').trim();
  const currency = (top['53'] || '').trim();

  // Merchant Account Information lives in templates 26–51. Each is itself TLV:
  // subtag 00 is a Globally Unique Identifier, the rest are scheme-specific and
  // commonly hold the merchant's IBAN / account / merchant id.
  const accountCandidates = [];
  let merchantId = '';
  for (let t = 26; t <= 51; t++) {
    const tag = String(t).padStart(2, '0');
    if (!top[tag]) continue;
    const sub = parseTLV(top[tag]);
    for (const k of Object.keys(sub)) {
      if (k === '00') continue; // GUID, not an account
      accountCandidates.push(sub[k].trim());
    }
    // First scheme-specific value doubles as a merchant identifier fallback.
    if (!merchantId) {
      const firstKey = Object.keys(sub).find((k) => k !== '00');
      if (firstKey) merchantId = sub[firstKey].trim();
    }
  }
  const account = pickAccountLike(accountCandidates);

  // Additional Data Field Template (62): 07 = Terminal (till) label,
  // 03 = Store label, 01 = Bill number, 05 = Reference label.
  let tillId = '';
  if (top['62']) {
    const add = parseTLV(top['62']);
    tillId = (add['07'] || add['03'] || add['05'] || add['01'] || '').trim();
  }
  // If no explicit terminal label, fall back to the merchant id.
  if (!tillId) tillId = merchantId;

  return { name, account, tillId, amount, city, currency, raw: str, format: 'emv' };
}

// ---- Simpler fallbacks ------------------------------------------------------

function parseJson(str) {
  const o = JSON.parse(str);
  const pick = (...keys) => {
    for (const k of keys) {
      if (o[k] != null && String(o[k]).trim() !== '') return String(o[k]).trim();
    }
    return '';
  };
  return {
    name: pick('name', 'merchantName', 'payeeName', 'title', 'pn'),
    account: pick('account', 'accountNumber', 'iban', 'mobile', 'number', 'pa'),
    tillId: pick('tillId', 'till', 'terminalId', 'terminal', 'merchantId', 'mid'),
    amount: pick('amount', 'amt', 'value', 'am'),
    city: pick('city'),
    currency: pick('currency', 'cur'),
    raw: str,
    format: 'json',
  };
}

// bankapp://pay?name=..&account=..&till=..&amount=.. and UPI-style pa/pn/am.
function parseQuery(str) {
  const q = str.slice(str.indexOf('?') + 1);
  const params = {};
  for (const pair of q.split('&')) {
    if (!pair) continue;
    const idx = pair.indexOf('=');
    const key = decodeURIComponent(idx >= 0 ? pair.slice(0, idx) : pair).toLowerCase();
    const val = idx >= 0 ? decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' ')) : '';
    params[key] = val.trim();
  }
  const pick = (...keys) => {
    for (const k of keys) if (params[k]) return params[k];
    return '';
  };
  return {
    name: pick('name', 'pn', 'payee', 'merchant'),
    account: pick('account', 'acc', 'pa', 'iban', 'mobile', 'number'),
    tillId: pick('till', 'tillid', 'terminal', 'tid', 'merchantid', 'mid'),
    amount: pick('amount', 'amt', 'am', 'value'),
    city: pick('city'),
    currency: pick('currency', 'cur'),
    raw: str,
    format: 'query',
  };
}

function empty(str) {
  return { name: '', account: '', tillId: '', amount: '', city: '', currency: '', raw: str, format: 'unknown' };
}

// ---- Public API -------------------------------------------------------------

// Decode a scanned QR payload into normalized recipient fields. Never throws —
// an unrecognized payload comes back with empty fields and format 'unknown'
// (a long numeric string is still treated as a bare account number).
export function parsePaymentQR(data) {
  const str = String(data || '').trim();
  if (!str) return empty(str);

  if (looksLikeEmv(str)) {
    try {
      return parseEmv(str);
    } catch (e) {
      /* fall through to other parsers */
    }
  }

  if (str.startsWith('{')) {
    try {
      return parseJson(str);
    } catch (e) {
      /* not valid JSON */
    }
  }

  if (str.includes('?') && str.includes('=')) {
    try {
      return parseQuery(str);
    } catch (e) {
      /* not a query string */
    }
  }

  // Bare account / mobile number.
  const digits = str.replace(/[\s-]/g, '');
  if (/^[A-Za-z]{0,2}\d{6,}$/.test(digits)) {
    return { ...empty(str), account: str, format: 'account' };
  }

  return empty(str);
}

// True when a decode produced at least one useful field to pre-fill.
export function hasUsableFields(parsed) {
  return Boolean(parsed && (parsed.name || parsed.account || parsed.tillId || parsed.amount));
}
