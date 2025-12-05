// 脚本：检查Stripe中的实际价格配置
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here');

const priceIds = [
  // 月度套餐
  'price_1SVtHbQzG0RJ3DV6F5lzzGJx',     // Starter
  'price_1SVtQuQzG0RJ3DV6Ek8QLcKl',     // Pro  
  'price_1SVtRlQzG0RJ3DV6asJ8Y1WT',     // Premium
  
  // 年度套餐
  'price_1SVtS4QzG0RJ3DV6fbpLMEsY',     // Starter
  'price_1SVtRHQzG0RJ3DV6mTmSu84A',     // Pro
  'price_1SVtS4QzG0RJ3DV6fbpLMEsY',     // Premium
  
  // 一次性
  'price_1SW9nnJTwmr0OX9E0KxvSv91',     // Small
  'price_1SW9q8JTwmr0OX9EkunELOqv',     // Big  
  'price_1SW9qUJTwmr0OX9EQnbvg7B9'      // Crate
];

async function checkPrices() {
  console.log('🔍 检查Stripe价格配置...\n');
  
  for (const priceId of priceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product);
      
      console.log(`📋 Price ID: ${priceId}`);
      console.log(`   产品: ${product.name}`);
      console.log(`   价格: $${(price.unit_amount / 100).toFixed(2)}`);
      console.log(`   类型: ${price.type}`);
      console.log(`   周期: ${price.recurring?.interval || '一次性'}`);
      console.log(`   货币: ${price.currency}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ Price ID ${priceId} 错误:`, error.message);
      console.log('');
    }
  }
}

checkPrices();