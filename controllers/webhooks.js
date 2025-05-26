import Stripe from "stripe";
import { Purchase } from "../modals/Purchase.js"
import Course from "../modals/Course.js";
import User from "../modals/User.js";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
  }   catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      const purchaseData = await Purchase.findById(purchaseId);
      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId.toString());

      courseData.enrolledStudents.push(userData._id);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = "completed";
      await purchaseData.save();

      break;
    }

    case "payment_method.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);
      purchaseData.status = "failed";

      await purchaseData.save();
      break;
    }

    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
// Return a response to acknowledge receipt of the event
  response.json({ received: true });
};
