import crypto from 'crypto';

export function getProcessUrl() {
  const mode = String(process.env.PAYFAST_MODE || 'test').toLowerCase();
  return mode === 'test'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process';
}

// Build signature per PayFast spec (sorted key=value&..., passphrase appended if set)
export function buildSignature(params = {}, passphrase = '') {
  const pairs = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && k !== 'signature')
    .sort()
    .map((k) => `${k}=${encodeURIComponent(String(params[k]).trim()).replace(/%20/g, '+')}`);
  const base = pairs.join('&');
  const withPassphrase = passphrase ? `${base}&passphrase=${encodeURIComponent(passphrase)}` : base;
  return crypto.createHash('md5').update(withPassphrase, 'utf8').digest('hex');
}

export function verifySignature(payload = {}, passphrase = '') {
  const expected = buildSignature(payload, passphrase);
  const provided = payload.signature;
  return String(expected).toLowerCase() === String(provided).toLowerCase();
}