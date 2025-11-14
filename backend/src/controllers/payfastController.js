import { getProcessUrl, buildSignature, verifySignature } from '../services/payfast.js';
import Cart from '../models/Cart.js';

export async function initiatePayFast(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price thumbnail');
    const items = Array.isArray(cart?.items) ? cart.items : [];

    // Compute totals (same logic as checkout)
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

    const merchant_id = String(process.env.PAYFAST_MERCHANT_ID || '').trim();
    const merchant_key = String(process.env.PAYFAST_MERCHANT_KEY || '').trim();
    const passphrase = String(process.env.PAYFAST_PASSPHRASE || '');

    if (!merchant_id || !merchant_key) {
      return res.status(500).json({ success: false, message: 'PayFast merchant credentials not configured' });
    }

    const m_payment_id = `BF-${req.user._id}-${Date.now()}`;
    const item_name = items.length > 1 ? `${items.length} items` : (items[0]?.product?.name || 'Order');
    const email_address = req.user.email;
    const name_first = req.user.firstName || 'Customer';
    const name_last = req.user.lastName || 'BF';

    const return_url = process.env.PAYFAST_RETURN_URL;
    const cancel_url = process.env.PAYFAST_CANCEL_URL;
    const notify_url = process.env.PAYFAST_NOTIFY_URL;

    const fields = {
      merchant_id,
      merchant_key,
      return_url,
      cancel_url,
      notify_url,
      m_payment_id,
      amount: total.toFixed(2),
      item_name,
      email_address,
      name_first,
      name_last,
    };

    const signature = buildSignature(fields, passphrase);
    fields.signature = signature;

    res.json({
      success: true,
      url: getProcessUrl(),
      fields,
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