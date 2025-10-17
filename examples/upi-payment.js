/**
 * UPI Payment Example
 * Demonstrates complete UPI payment flow
 */

const FakePay = require('../lib/index');

const fakepay = new FakePay({
  key_id: 'test_key_id',
  key_secret: 'test_key_secret',
  baseUrl: 'http://localhost:4000'
});

async function upiPaymentExample() {
  try {
    const userId = 'usr_demo_' + Date.now();

    // Step 1: Create UPI VPA for user
    console.log('Step 1: Creating UPI VPA...');
    const vpaResult = await fakepay.upi.createVpa({
      userId: userId,
      vpa: `user${Date.now()}@fakepay`
    });
    console.log('VPA created:', vpaResult.vpa.vpa);

    // Step 2: Top up wallet
    console.log('\nStep 2: Topping up wallet...');
    await fakepay.wallets.topup({
      userId: userId,
      amount: 100000 // ₹1000
    });
    console.log('Wallet topped up with ₹1000');

    // Step 3: Create payment
    console.log('\nStep 3: Creating payment...');
    const payment = await fakepay.payments.create({
      merchantId: 'mer_demo123',
      amount: 50000, // ₹500
      orderId: 'order_' + Date.now(),
      callbackUrl: 'https://example.com/webhook'
    });
    console.log('Payment created:', payment.paymentId);

    // Step 4: Generate UPI QR code
    console.log('\nStep 4: Generating UPI QR code...');
    const qr = await fakepay.upi.generateQr(payment.paymentId);
    console.log('UPI Intent:', qr.upiIntent);
    console.log('Payee VPA:', qr.payeeVpa);
    console.log('Amount:', qr.amount / 100, 'INR');

    // Step 5: Initiate UPI payment
    console.log('\nStep 5: Initiating UPI payment...');
    const upiTxn = await fakepay.upi.initiate({
      paymentId: payment.paymentId,
      payerVpa: vpaResult.vpa.vpa
    });
    console.log('UPI Transaction ID:', upiTxn.txnId);
    console.log('Status:', upiTxn.status);

    // Step 6: Confirm payment (simulating user entering PIN)
    console.log('\nStep 6: Confirming payment...');
    const result = await fakepay.upi.confirm({
      txnId: upiTxn.txnId,
      pin: '1234' // Demo PIN
    });
    console.log('Payment confirmed!');
    console.log('Status:', result.status);
    console.log('UTR Number:', result.upiRef);

    // Step 7: Verify payment status
    console.log('\nStep 7: Verifying payment...');
    const finalPayment = await fakepay.payments.fetch(payment.paymentId);
    console.log('Final Payment Status:', finalPayment.status);

    // Step 8: Check wallet balance
    console.log('\nStep 8: Checking wallet balance...');
    const wallet = await fakepay.wallets.getBalance(userId);
    console.log('Remaining balance:', wallet.balance / 100, 'INR');

    console.log('\n✅ UPI payment flow completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
  }
}

// Run example
upiPaymentExample();
