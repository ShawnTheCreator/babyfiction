import Cart from '../models/Cart.js';
import { getPayFastProcessUrl, buildSignature, verifySignature } from '../services/payfast.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

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

    // Log baseline ITN details for debugging
    console.log('PayFast ITN:', {
      m_payment_id: payload.m_payment_id,
      pf_payment_id: payload.pf_payment_id,
      payment_status: payload.payment_status,
      amount_gross: payload.amount_gross,
      amount_fee: payload.amount_fee,
      amount_net: payload.amount_net,
    });

    // Only act on successful payment
    if (String(payload.payment_status).toUpperCase() === 'COMPLETE') {
      try {
        const mId = String(payload.m_payment_id || '');
        const parts = mId.split('-');
        // Expect m_payment_id format: BF-<userId>-<timestamp>
        const userId = parts.length >= 3 ? parts[1] : null;

        if (!userId) {
          console.warn('ITN: Could not parse userId from m_payment_id:', mId);
        } else {
          const user = await User.findById(userId);
          const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images thumbnail');
          const items = Array.isArray(cart?.items) ? cart.items : [];

          if (user && items.length > 0) {
            // Build order items
            const orderItems = items.map((it) => {
              const p = it?.product || {};
              const img = p?.thumbnail || (Array.isArray(p?.images) ? p.images[0] : '');
              return {
                product: p?._id,
                name: p?.name || 'Product',
                price: typeof p?.price === 'number' ? p.price : 0,
                quantity: it?.quantity || 1,
                size: it?.size,
                color: it?.color,
                image: img || '',
              };
            });

            // Calculate totals (mirror initiatePayFast)
            const TAX_RATE = 0.15;
            let subtotal = 0;
            for (const it of orderItems) {
              subtotal += (it.price || 0) * (it.quantity || 0);
            }
            const shipping = subtotal >= 3000 ? 0 : (subtotal > 0 ? 130 : 0);
            const tax = subtotal * TAX_RATE;
            const total = Math.round((subtotal + shipping + tax) * 100) / 100;

            // Derive shipping address from user's profile, with safe fallbacks
            const shippingAddress = {
              firstName: user?.firstName || 'Customer',
              lastName: user?.lastName || 'Customer',
              company: '',
              address: user?.address?.street || 'Unknown',
              apartment: '',
              city: user?.address?.city || 'Unknown',
              state: user?.address?.state || 'Unknown',
              zipCode: user?.address?.zipCode || '0000',
              country: user?.address?.country || 'South Africa',
              phone: user?.phone || '0000000000',
            };

            const order = await Order.create({
              user: user._id,
              items: orderItems,
              shippingAddress,
              billingAddress: { ...shippingAddress },
              paymentInfo: {
                method: 'payfast',
                status: 'paid',
                transactionId: String(payload.pf_payment_id || ''),
                paidAt: new Date(),
              },
              pricing: {
                subtotal,
                tax,
                shipping,
                discount: 0,
                total,
              },
              status: 'processing',
              notes: 'Created via PayFast ITN (sandbox/production)',
            });

            // Clear the user's cart after successful order creation
            await Cart.findOneAndDelete({ user: user._id });

            console.log('Order created from PayFast ITN:', order._id);
          } else {
            console.warn('ITN: Missing user or empty cart for userId:', userId);
          }
        }
      } catch (orderErr) {
        console.error('ITN order creation error:', orderErr);
        // Continue responding OK to PayFast to avoid retries, but log the error
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('ITN handler error:', err);
    res.status(500).send('Server error');
  }
}