import Transaction from "../models/Transaction.js";
import Stripe from "stripe";
import User from "../models/User.js"; // add import

const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
    features: [
      "100 text generations",
      "50 image generations",
      "Standard support",
      "Access to basic models",
    ],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
    features: [
      "500 text generations",
      "200 image generations",
      "Priority support",
      "Access to pro models",
      "Faster response time",
    ],
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
    features: [
      "1000 text generations",
      "500 image generations",
      "24/7 VIP support",
      "Access to premium models",
      "Dedicated account manager",
    ],
  },
];

// API Controller to get all plans
export const getPlans = (req, res) => {
  try {
    res.json({ success: true, plans });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API Controller for purchasing a plan
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;
    const plan = plans.find((p) => p._id === planId);

    if (!plan) {
      return res.json({ success: false, message: "Invalid plan ID" });
    }

    const transaction = await Transaction.create({
      userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const origin = req.get("origin") || process.env.FRONTEND_URL;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: { name: plan.name },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/loading?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      metadata: {
        transactionId: transaction._id.toString(),
        appId: "whitechapel_works",
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifySession = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.json({ success: false, message: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.json({ success: false, message: "Payment not completed" });
    }

    const { transactionId, appId } = session.metadata || {};
    if (appId !== "whitechapel_works" || !transactionId) {
      return res.json({ success: false, message: "Invalid metadata" });
    }

    const tx = await Transaction.findById(transactionId);
    if (!tx)
      return res.json({ success: false, message: "Transaction not found" });
    if (tx.isPaid) return res.json({ success: true, alreadyProcessed: true });

    await User.updateOne({ _id: tx.userId }, { $inc: { credits: tx.credits } });
    tx.isPaid = true;
    await tx.save();

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
