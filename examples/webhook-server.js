/**
 * Webhook Server Example
 * Demonstrates how to receive and verify webhooks
 */

const express = require('express');
const FakePay = require('../lib/index');

const app = express();
app.use(express.json());

// Initialize FakePay SDK
const fakepay = new FakePay({
  key_id: 'test_key_id',
  key_secret: 'test_key_secret',
  baseUrl: 'http://localhost:4000'
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('\n📨 Webhook received!');
  
  // Get signature from headers
  const signature = req.headers['x-fakepay-signature'];
  const eventType = req.headers['x-fakepay-event'];
  
  console.log('Event Type:', eventType);
  console.log('Signature:', signature);

  // Verify webhook signature
  const isValid = fakepay.webhooks.verify(req.body, signature);
  
  if (!isValid) {
    console.log('❌ Invalid signature - webhook rejected');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log('✅ Signature verified');

  const { event, data, created_at } = req.body;

  // Process different event types
  switch (event) {
    case 'payment.created':
      console.log('💳 Payment Created:', data.paymentId);
      // Handle payment creation
      break;

    case 'payment.pending':
      console.log('⏳ Payment Pending:', data.paymentId);
      // Handle pending status
      break;

    case 'payment.completed':
      console.log('✅ Payment Completed:', data.paymentId);
      console.log('   Amount:', data.amount);
      console.log('   Order ID:', data.orderId);
      // Update order status in database
      // Send confirmation email
      // Trigger fulfillment
      break;

    case 'payment.failed':
      console.log('❌ Payment Failed:', data.paymentId);
      console.log('   Reason:', data.error);
      // Handle failed payment
      // Notify customer
      break;

    case 'payment.refunded':
      console.log('💰 Payment Refunded:', data.paymentId);
      console.log('   Refund Amount:', data.refundAmount);
      // Process refund
      // Update inventory
      break;

    default:
      console.log('ℹ️  Unknown event type:', event);
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ success: true });
});

// Test endpoint to create a payment
app.post('/create-test-payment', async (req, res) => {
  try {
    const payment = await fakepay.payments.create({
      merchantId: 'mer_demo123',
      amount: 50000,
      orderId: 'order_' + Date.now(),
      callbackUrl: 'http://localhost:3000/webhook',
      metadata: {
        test: true
      }
    });

    res.json({
      success: true,
      payment: {
        id: payment.paymentId,
        url: payment.paymentUrl
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'webhook-server' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on http://localhost:${PORT}`);
  console.log('\nEndpoints:');
  console.log('  POST /webhook - Webhook receiver');
  console.log('  POST /create-test-payment - Create test payment');
  console.log('  GET  /health - Health check');
  console.log('\nWaiting for webhooks...\n');
});
