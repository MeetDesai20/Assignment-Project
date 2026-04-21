require('dotenv').config();
const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (process.env.MOCK_RAZORPAY === 'true') {
  module.exports = {
    subscriptions: {
      create: async () => ({
        id: `sub_${Date.now()}`,
        short_url: 'http://localhost/mock-razorpay',
      }),
      cancel: async () => ({}),
    },
  };
  return;
}

if (!keyId || !keySecret) {
  throw new Error('Missing Razorpay credentials. Check your .env file.');
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

module.exports = razorpay;