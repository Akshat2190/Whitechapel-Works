import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { transactionId, appId } = session.metadata || {};

        if (appId === "whitechapel_works" && transactionId) {
          const tx = await Transaction.findOne({
            _id: transactionId,
            isPaid: false,
          });
          if (tx) {
            await User.updateOne(
              { _id: tx.userId },
              { $inc: { credits: tx.credits } }
            );
            tx.isPaid = true;
            await tx.save();
          }
        }
        break;
      }
      default:
        // no-op
        break;
    }
    return response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return response.status(500).send("Internal Server Error");
  }
};
