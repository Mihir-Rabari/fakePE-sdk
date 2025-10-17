/**
 * Basic Payment Example
 * Demonstrates creating a simple payment using FakePay SDK
 */

const FakePay = require('../lib/index');

// Initialize SDK
const fakepay = new FakePay({
  key_id: 'test_key_id',
  key_secret: 'test_key_secret',
  baseUrl: 'http://localhost:4000'
});

async function basicPaymentExample() {
  try {
    console.log('Creating payment...');

    // Create a payment
    const payment = await fakepay.payments.create({
      merchantId: 'mer_demo123',
      amount: 50000, // ₹500 (amount in paise)
      orderId: 'order_' + Date.now(),
      callbackUrl: 'https://example.com/webhook',
      metadata: {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        items: [
          { name: 'Product A', price: 30000 },
          { name: 'Product B', price: 20000 }
        ]
      }
    });

    console.log('Payment created successfully!');
    console.log('Payment ID:', payment.paymentId);
    console.log('Payment URL:', payment.paymentUrl);
    console.log('Status:', payment.status);
    console.log('\nShare this URL with customer:');
    console.log(payment.paymentUrl);
    console.log('\nOr show this QR code:');
    console.log('QR Data available at:', payment.qrData ? 'Yes' : 'No');

    // Fetch payment details
    console.log('\n--- Fetching payment details ---');
    const fetchedPayment = await fakepay.payments.fetch(payment.paymentId);
    console.log('Fetched payment:', fetchedPayment.paymentId);
    console.log('Current status:', fetchedPayment.status);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
  }
}

// Run example
basicPaymentExample();
