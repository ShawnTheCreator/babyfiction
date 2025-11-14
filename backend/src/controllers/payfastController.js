// module imports and initiatePayFast
import Cart from '../models/Cart.js';
import { getPayFastProcessUrl, buildSignature, verifySignature } from '../services/payfast.js';

export async function initiatePayFast(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price thumbnail');
    const items = Array.isArray(cart?.items) ? cart.items : [];

    const TAX_RATE = 0.15;
    let subtotal = 0;
    for (const it of items) {
      const p = it?.product || {};
      const priceNum = typeof p.price === 'number' ? p.price : 0;
      subtotal += priceNum * (it?.quantity || 0);
    }
    const shipping = subtotal >= 3000 ? 0 : (subtotal > 0 ? 130 : 0);
    const tax = subtotal * TAX_RATE;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    if (total <= 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty or invalid.' });
    }

    const {
      PAYFAST_MERCHANT_ID,
      PAYFAST_MERCHANT_KEY,
      PAYFAST_PASSPHRASE,
      PAYFAST_RETURN_URL,
      PAYFAST_CANCEL_URL,
      PAYFAST_NOTIFY_URL,
    } = process.env;

    const merchant_id = String(PAYFAST_MERCHANT_ID || '').trim();
    const merchant_key = String(PAYFAST_MERCHANT_KEY || '').trim();

    if (!merchant_id || !merchant_key) {
      return res.status(500).json({ success: false, message: 'PayFast merchant credentials not configured' });
    }

    const amount = (Number(total) || 0).toFixed(2);
    const payer = req.user || {};
    const name_first = payer.firstName || 'Customer';
    const name_last = payer.lastName || 'Guest';
    const email_address = payer.email || 'test@payfast.co.za';
    const m_payment_id = `BF-${req.user._id}-${Date.now()}`;
    const item_name = items.length > 1 ? `${items.length} items` : (items[0]?.product?.name || 'Order');
    const item_description = `Cart checkout`;

    const fields = {
      merchant_id,
      merchant_key,
      return_url: PAYFAST_RETURN_URL,
      cancel_url: PAYFAST_CANCEL_URL,
      notify_url: PAYFAST_NOTIFY_URL,
      name_first,
      name_last,
      email_address,
      m_payment_id,
      amount,
      item_name,
      item_description,
    };

    Object.keys(fields).forEach((k) => {
      const v = fields[k];
      if (v === undefined || v === null || String(v).trim() === '') {
        delete fields[k];
      }
    });

    const signature = buildSignature(fields, PAYFAST_PASSPHRASE);
    const processUrl = getPayFastProcessUrl();

    return res.json({
      processUrl,
      fields: { ...fields, signature },
    });
  } catch (err) {
    next(err);
  }
}

export async function handleITN(req, res) {
  try {
    const passphrase = String(process.env.PAYFAST_PASSPHRASE || '');
    const payload = req.body || {};

    if (!verifySignature(payload, passphrase)) {
      return res.status(400).send('Invalid signature');
    }

    // Sandbox acceptance; extend here to update orders by m_payment_id
    console.log('PayFast ITN (sandbox):', {
      m_payment_id: payload.m_payment_id,
      pf_payment_id: payload.pf_payment_id,
      payment_status: payload.payment_status,
      amount_gross: payload.amount_gross,
      amount_fee: payload.amount_fee,
      amount_net: payload.amount_net,
    });

    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Server error');
  }
}