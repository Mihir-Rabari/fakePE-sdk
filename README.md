# @fakepe/sdk

Official Node.js SDK for FakePE Payment Gateway - A Razorpay-inspired mock payment system for testing and development.

## 🚀 Installation

```bash
npm install @fakepe/sdk
```

## 📦 Quick Start

```javascript
const FakePE = require('@fakepe/sdk');

const fakepe = new FakePE({
  key_id: 'your_key_id',
  key_secret: 'your_key_secret',
  baseUrl: 'http://localhost:4000' // Optional
});

// Create a payment
const payment = await fakepe.payments.create({
  merchantId: 'mer_123',
  amount: 50000, // Amount in paise (₹500)
  orderId: 'order_001',
  callbackUrl: 'https://yoursite.com/webhook'
});

console.log(payment.paymentId);
console.log(payment.paymentUrl);
```

## 📚 API Reference

### Initialize SDK

```javascript
const fakepe = new FakePE({
  key_id: 'your_key_id',        // Required
  key_secret: 'your_key_secret', // Required
  baseUrl: 'http://localhost:4000' // Optional
});
```

### Payments

#### Create Payment

```javascript
const payment = await fakepe.payments.create({
  merchantId: 'mer_123',
  amount: 50000, // in paise
  orderId: 'order_001',
  callbackUrl: 'https://yoursite.com/webhook',
  metadata: { // optional
    customer_name: 'John Doe',
    customer_email: 'john@example.com'
  }
});
```

#### Fetch Payment

```javascript
const payment = await fakepe.payments.fetch('pay_xyz789');
```

#### List Payments

```javascript
const payments = await fakepe.payments.list({
  merchantId: 'mer_123',
  status: 'COMPLETED',
  limit: 10,
  offset: 0
});
```

#### Refund Payment

```javascript
await fakepe.payments.refund('pay_xyz789', {
  amount: 25000, // partial refund
  reason: 'Customer request'
});
```

### UPI

#### Create VPA

```javascript
await fakepe.upi.createVpa({
  userId: 'usr_123',
  vpa: 'user@fakepe'
});
```

#### Get User VPAs

```javascript
const vpas = await fakepe.upi.getVpas('usr_123');
```

#### Generate QR Code

```javascript
const qr = await fakepe.upi.generateQr('pay_xyz789');
console.log(qr.upiIntent); // upi://pay?...
console.log(qr.qrCodeData); // base64 QR code image
```

#### Initiate Payment

```javascript
const txn = await fakepe.upi.initiate({
  paymentId: 'pay_xyz789',
  payerVpa: 'user@fakepe'
});
```

#### Confirm Payment

```javascript
const result = await fakepe.upi.confirm({
  txnId: txn.txnId,
  pin: '1234' // Mock PIN
});
```

#### Get Transaction

```javascript
const txn = await fakepe.upi.getTransaction('UPI2024011512345678');
```

#### Get Transaction History

```javascript
const history = await fakepe.upi.getHistory('usr_123', {
  limit: 20,
  offset: 0
});
```

### Wallets

#### Get Balance

```javascript
const wallet = await fakepe.wallets.getBalance('usr_123');
console.log(wallet.balance); // in paise
```

#### Top Up

```javascript
await fakepe.wallets.topup({
  userId: 'usr_123',
  amount: 100000 // ₹1000
});
```

#### Transfer

```javascript
await fakepe.wallets.transfer({
  from: 'usr_123',
  to: 'usr_456',
  amount: 50000
});
```

### Webhooks

#### Verify Signature

```javascript
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-fakepe-signature'];
  
  // Verify webhook signature
  if (!fakepe.webhooks.verify(req.body, signature)) {
    return res.status(400).send('Invalid signature');
  }
  
  // Process webhook
  const { event, data } = req.body;
  
  switch(event) {
    case 'payment.completed':
      console.log('Payment completed:', data.paymentId);
      break;
    case 'payment.failed':
      console.log('Payment failed:', data.paymentId);
      break;
  }
  
  res.status(200).send('OK');
});
```

#### Generate Signature (for testing)

```javascript
const signature = fakepe.webhooks.generateSignature(payload);
```

## 📋 Examples

Check the `examples/` directory for complete working examples:

- `basic-payment.js` - Simple payment creation
- `upi-payment.js` - Complete UPI payment flow
- `webhook-server.js` - Webhook handling with signature verification

## 🔧 Error Handling

```javascript
try {
  const payment = await fakepe.payments.create({
    merchantId: 'mer_123',
    amount: 50000,
    orderId: 'order_001'
  });
} catch (error) {
  console.error('Payment creation failed:', error.message);
  console.error('Error code:', error.response?.status);
  console.error('Error details:', error.response?.data);
}
```

## 💡 Best Practices

1. **Store credentials securely** - Never commit API keys
2. **Use environment variables** - `process.env.FAKEPE_KEY_ID`
3. **Handle errors gracefully** - Wrap API calls in try-catch
4. **Verify webhooks** - Always verify signature before processing
5. **Use idempotency** - Pass `Idempotency-Key` header for safe retries

## 🔗 Related Projects

- **Main API**: [fake-pe](https://github.com/Mihir-Rabari/fake-pe)
- **User App**: [fakePE-user-app](https://github.com/Mihir-Rabari/fakePE-user-app)

## ⚠️ Disclaimer

This is a **MOCK payment system** for testing and development only. All transactions use fake money and are not real financial transactions.

For production use, integrate with real payment providers like:
- [Razorpay](https://razorpay.com)
- [Stripe](https://stripe.com)
- [PayPal](https://paypal.com)

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Author

**Mihir Rabari**

---

**⭐ Star the repo if you find it useful!**
