import AnalyticsEvent from '../models/AnalyticsEvent.js';

export const ingestEvent = async (req, res) => {
  try {
    const payload = req.body || {};
    const doc = await AnalyticsEvent.create({
      type: payload.type,
      userId: req.user?._id || undefined,
      sessionId: payload.sessionId,
      route: payload.route,
      productId: payload.productId,
      orderId: payload.orderId,
      amount: payload.amount,
      rating: payload.rating,
      referrer: payload.referrer,
      utm: payload.utm,
      ua: payload.ua,
      meta: payload.meta,
      ts: payload.ts,
    });
    res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid analytics event', error: err.message });
  }
};

export const getSummary = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '30', 10) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [pageViews, funnel, revenue, reviews] = await Promise.all([
      // Page views by route
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: since } } },
        { $group: { _id: '$route', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      // Funnel counts
      AnalyticsEvent.aggregate([
        { $match: { type: { $in: ['product_view','add_to_cart','checkout_start','purchase'] }, createdAt: { $gte: since } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      // Revenue by day
      AnalyticsEvent.aggregate([
        { $match: { type: 'purchase', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: { $ifNull: ['$amount', 0] } }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Reviews
      AnalyticsEvent.aggregate([
        { $match: { type: 'review_submitted', createdAt: { $gte: since } } },
        { $group: { _id: '$productId', reviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
        { $sort: { reviews: -1 } },
        { $limit: 20 },
      ])
    ]);

    const funnelObj = funnel.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});
    const conversion = funnelObj.product_view ? (funnelObj.purchase || 0) / funnelObj.product_view : null;

    res.json({
      since,
      pageViews,
      funnel: funnelObj,
      conversion,
      revenue,
      topReviewed: reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics summary', error: err.message });
  }
};
