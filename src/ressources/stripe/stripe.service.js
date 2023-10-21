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
  User = User;
  Service = Service;
  Order = Order;
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  async getAccountBalance(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: "Vous devez vous connecter pour effectuer cette action.",
      });
    }

    const user = await User.findById(userSession.id);

    const accounts = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });

    return new Response(JSON.stringify(accounts), { status: 200 });
  }

  async getCarteInfo(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    try {
      const user = await User.findById(userSession.id);

      const account = await stripe.accounts.retrieve(user.stripe_account_id);

      const sellerInfo = {
        name: account.business_profile.name || '',
        email: account.email || '',
        card:
          account.external_accounts.data.length > 0
            ? account.external_accounts.data[0].card
            : null,
      };

      if (!account) {
        throw new Error('Aucun compte trouvé.');
      }
      // return new Response(JSON.stringify(sellerInfo), { status: 200 });
      return NextResponse.json(sellerInfo);
    } catch (error) {
      console.log(error);
    }
  }

  async createMonneyToPay(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    const accounts = await stripe.accounts.update(userSession.id, {
      settings: {
        payouts: {
          schedule: {
            delay_days: 7,
          },
        },
      },
    });

    return new Response(JSON.stringify(accounts), { status: 200 });
  }

  async createOptionPayement(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    try {
      const id = req.params.id;
      const order = await Order.findById(id);
      const seller = await User.findById(order.sellerId);

      if (!order || !seller) {
        return NextResponse.json({
          message: `Une erreur s'est produite`,
        });
      }

      const fee = ((order.optionpement.amount * 10) / 100).toFixed(2);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.optionpement.amount * 100,
        currency: 'eur',
        capture_method: 'manual',
        automatic_payment_methods: {
          enabled: true,
        },
        application_fee_amount: fee * 100,
        transfer_data: {
          destination: seller.stripe_account_id,
        },
      });

      const updateOrder = await Order.findByIdAndUpdate(
        id,
        {
          $set: { 'optionpement.id': paymentIntent.id },
        },
        { new: true }
      );

      console.log('updateOrder', updateOrder, paymentIntent.id);
      // await User.findByIdAndUpdate(userSession.id);

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.log(error);
    }
  }

  async createPayement(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    try {
      const id = req.params.id;
      const order = await Order.findById(id);
      const seller = await User.findById(order.sellerId);

      if (!order || !seller) {
        return NextResponse.json({
          message: `Une erreur s'est produite`,
        });
      }

      const fee = ((order.price * 10) / 100).toFixed(2);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.price * 100,
        currency: 'eur',
        capture_method: 'manual',
        automatic_payment_methods: {
          enabled: true,
        },

        application_fee_amount: fee * 100,
        transfer_data: {
          destination: seller.stripe_account_id,
        },
      });

      const updateOrder = await Order.findByIdAndUpdate(
        id,
        {
          $set: { payementId: paymentIntent.id },
        },
        { new: true }
      );

      await User.findByIdAndUpdate(userSession.id);

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.log(error);
    }
  }

  async getPayement(req, res, next) {

    return NextResponse.json({ publishable: process.env.STRIPE_PUBLIC_KEY });

  }

  async createPaymentSettings(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    const user = await User.findById(userSession.id);

    const url = `${process.env.URL}admin/portefeuil`;

    const loginLinks = await stripe.accounts.createLoginLink(
      user.stripe_account_id,
      {
        redirect_url: url,
      }
    );

    return new Response(JSON.stringify(accounts), { status: 200 });
  }

  async createPayoutSettings(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    const user = await User.findById(userSession.id);

    if (!user.stripe_account_id) {
      const accounts = await stripe.accounts.retrieve(user.stripe_account_id);

      const updateUser = await User.findByIdAndUpdate(
        userSession.id,
        {
          stripe_seller: accounts,
        },
        { new: true }
      ).select('-password');
      return new Response(JSON.stringify(updateUser), { status: 200 });
    }
  }

  async getManagePlan(req, res, next) {
    const session = req.user;

    try {
      const user = await User.findById(session.id);

      const portal = await stripe.billingPortal.sessions.create({
        customer: user.stripe_cumtomer_id,
        return_url: process.env.SUCCESS_URL,
      });

      return NextResponse.json(portal.url);
    } catch (err) {
      console.log(err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  async getSublistPlan(req, res, next) {
    const session = req.user;

    try {
      const user = await User.findById(session.id);

      const subs = await stripe.subscriptions.list({
        customer: user.stripe_cumtomer_id,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      const updated = await User.findByIdAndUpdate(
        session.id,
        {
          subscription: subs.data,
        },
        { new: true }
      );

      return NextResponse.json(updated);
    } catch (err) {
      console.log(err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  async getSubscriptionPlan(req, res, next) {

    try {
      const price = await stripe.prices.list();
      return NextResponse.json(price.data.reverse());
    } catch (err) {
      console.log(err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  async createSubscriptionPlan(req, res, next) {
    const session = req.user;

    if (session) {
      const { priceId } = await request.json();
      try {
        const user = await User.findById(session.id);

        const StripeSession = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          customer: user.stripe_customer_id,
          success_url: process.env.SUCCESS_URL,
          cancel_url: process.env.CANCEL_URL,
        });

        return NextResponse.json(StripeSession.url);
      } catch (err) {
        console.log(err);
        return new Response('Internal Server Error', { status: 500 });
      }
    } else {
      return new Response(
        'Vous devez vous connecter pour effectuer cette action',
        { status: 401 }
      );
    }
  }

  async getUserSubscriptionPlan(req, res, next) {
    const session = req.user;

    try {
      const user = await User.findById(session.user.id);

      const subs = await stripe.subscriptions.list({
        customer: user.stripe_cumtomer_id,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      return NextResponse.json(subs);
    } catch (err) {
      console.log(err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  async UpdateUser(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    const user = await User.findById(userSession.id);

    if (!user.stripe_account_id) {
      const accounts = await stripe.accounts.retrieve(user.stripe_account_id);

      const updateUser = await User.findByIdAndUpdate(
        userSession.id,
        {
          stripe_seller: accounts,
        },
        { new: true }
      ).select('-password');
      return new Response(JSON.stringify(updateUser), { status: 200 });
    }
  }

  async getUpdateCarteInfo(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    const user = await User.findById(userSession.id);

    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({
        type: 'standard',
      });

      user.stripe_account_id = account.id;
      await user.save();
    }

    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: `${process.env.URL}/stripe/callback`,
      return_url: `${process.env.URL}/admin/services-list`,
      type: 'account_onboarding',
    });

    accountLink = Object.assign(accountLink, {
      'stripe_user[email]': user.email || undefined,
    });

    const link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
    return NextResponse.json(link);
  }

  async UpdateUserAccompte(req, res, next) {
    const userSession = req.user;

    if (!userSession) {
      return NextResponse.json({
        message: 'Vous devez vous connecter pour effectuer cette action.',
      });
    }

    const user = await User.findById(userSession.id);

    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({
        type: 'standard',
      });

      user.stripe_account_id = account.id;
      await user.save();
    }

    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: `${process.env.URL}stripe/callback`,
      return_url: `${process.env.URL}admin/services-list`,
      type: 'account_onboarding',
    });

    accountLink = Object.assign(accountLink, {
      'stripe_user[email]': user.email || undefined,
    });

    const link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
    return NextResponse.json(link);
  }
}

module.exports = StripeService;
