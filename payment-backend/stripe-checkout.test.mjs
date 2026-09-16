import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCart, checkoutParameters} from './stripe-checkout.mjs';
const config = {countries:'CA', shippingRate:'shr_test', returnUrl:'https://nexora.synapses.cloud/checkout.html', prices:{black:'price_black',white:'price_white'},automaticTax:false};
test('server price IDs override client-supplied amounts', () => {
  const p = checkoutParameters([{finish:'black',qty:2,price:1}],config);
  assert.deepEqual(p.line_items,[{price:'price_black',quantity:2}]);
  assert.equal(p.ui_mode,'embedded_page');
});
test('rejects invalid quantities, duplicates, unknown products and empty baskets', () => {
  for(const cart of [[],[{finish:'black',qty:-1}],[{finish:'white',qty:1.5}],[{finish:'black',qty:11}],[{finish:'other',qty:1}],[{finish:'black',qty:1},{finish:'black',qty:1}]]) assert.throws(()=>validateCart(cart));
});
test('checkout cannot omit shipping configuration or sell an unconfigured finish', () => {
  for(const override of [{countries:''},{shippingRate:''},{prices:{}}]) assert.throws(()=>checkoutParameters([{finish:'black',qty:1}],{...config,...override}));
});
