const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox', //sandbox or live
  client_id:
    'AV_-gw6yIi-HWfFff4E4q3rQoaPrnHnTHz_sS8JbiCsFUnQB4XkYOOHawppYgpyVUx3dyfbF9d0FLqMk',
  client_secret:
    'ENZrnlX82N_NP7yJ8ei-G90qcmzhC0aPQlqV03wFV9RplvPUVIJouRqA1sRJYgu4lBHBcf_e_ZnBOrZx',
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    redirect_urls: {
      return_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: 'SONY Headphones XS-20',
              sku: '001',
              price: '2500.00',
              currency: 'INR',
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: 'INR',
          total: '2500.00',
        },
        description: 'Best Headphones ever!!',
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: 'INR',
          total: '2500.00',
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
    }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3500, () => console.log('Server Started'));
