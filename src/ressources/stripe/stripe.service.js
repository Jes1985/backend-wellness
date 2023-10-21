const User = require("../user/user.model");
const Service = require("../service/service.model");
const Order = require("../order/order.model");
const HttpException = require("../../utils/exceptions/http.exception");
const { dbConnect } = require("../../config/dbConnect");

dbConnect();

const ERROR_MESSAGES = {
  CREATION_ERROR: "Erreur de donnée",
};

class StripeService {
  Stripe = Stripe;
  User = User;
  Service = Service;
  Order = Order;
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async getAccountBalance(req, res, next) {
    const usersession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: "Vous devez vous connecter pour effectuer cette action.",
      });
    }

    const user = await User.findById(usersession.id);

    const accounts = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });

    return new Response(JSON.stringify(accounts), { status: 200 });
  }
}

module.exports = StripeService;
