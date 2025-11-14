// payfast service helpers
import crypto from 'crypto';

export function getPayFastProcessUrl() {
  const mode = String(process.env.PAYFAST_MODE || 'test').toLowerCase();
  return mode === 'test'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

export function buildSignature(fields, passphrase) {
  // Build signature using PayFast's documented form-field order.
  // Only include non-empty fields; encode values; append passphrase last.
  const orderedKeys = [
    // Receiver details
    'merchant_id',
    'merchant_key',
    // Redirect URLs
    'return_url',
    'cancel_url',
    'notify_url',
    // Payer details
    'name_first',
    'name_last',
    'email_address',
    // Transaction details
    'm_payment_id',
    'amount',
    'item_name',
    'item_description',
  ];

  // Create the concatenated name=value string in exact order
  let pfOutput = '';
  for (const key of orderedKeys) {
    const raw = fields[key];
    if (raw !== undefined && raw !== null) {
      const val = String(raw).trim();
      if (val !== '') {
        const encoded = encodeURIComponent(val).replace(/%20/g, '+');
        pfOutput += `${key}=${encoded}&`;
      }
    }
  }

  // Remove trailing '&' before appending passphrase
  if (pfOutput.endsWith('&')) {
    pfOutput = pfOutput.slice(0, -1);
  }

  // Append passphrase if configured on the merchant account
  if (passphrase && String(passphrase).trim() !== '') {
    const encodedPass = encodeURIComponent(String(passphrase).trim()).replace(/%20/g, '+');
    pfOutput += `&passphrase=${encodedPass}`;
  }

  return crypto.createHash('md5').update(pfOutput, 'utf8').digest('hex');
}

export function verifySignature(payload = {}, passphrase = '') {
  // Rebuild signature from posted payload:
  // - Exclude 'signature'
  // - Only include non-empty values
  // - Sort keys ascending
  // - URL-encode values (uppercase percent, spaces as '+')
  // - Append passphrase last
  const data = { ...payload };
  delete data.signature;

  const keys = Object.keys(data)
    .filter((k) => data[k] !== undefined && data[k] !== null && String(data[k]).trim() !== '')
    .sort();

  let pfOutput = '';
  for (const key of keys) {
    const encoded = encodeURIComponent(String(data[key]).trim()).replace(/%20/g, '+');
    pfOutput += `${key}=${encoded}&`;
  }

  if (pfOutput.endsWith('&')) {
    pfOutput = pfOutput.slice(0, -1);
  }

  if (passphrase && String(passphrase).trim() !== '') {
    const encodedPass = encodeURIComponent(String(passphrase).trim()).replace(/%20/g, '+');
    pfOutput += `&passphrase=${encodedPass}`;
  }

  const expected = crypto.createHash('md5').update(pfOutput, 'utf8').digest('hex');
  const provided = payload.signature;
  return String(expected).toLowerCase() === String(provided).toLowerCase();
}