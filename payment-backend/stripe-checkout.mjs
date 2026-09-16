export function validateCart(items) {
  if (!Array.isArray(items) || !items.length || items.length > 2) throw Error('Invalid basket');
  const seen = new Set();
  return items.map(({finish, qty}) => {
    if (!['black', 'white'].includes(finish) || seen.has(finish) || !Number.isInteger(qty) || qty < 1 || qty > 10) throw Error('Invalid basket');
    seen.add(finish);
    return {finish, qty};
  });
}

export function checkoutParameters(items, config) {
  const cart = validateCart(items);
  const countries = config.countries.split(',').map(x => x.trim()).filter(Boolean);
  if (!countries.length || countries.some(x => !/^[A-Z]{2}$/.test(x))) throw Error('Shipping countries must be configured');
  if (!/^shr_/.test(config.shippingRate || '')) throw Error('Shipping rate must be configured');
  return {
    ui_mode: 'embedded_page', mode: 'payment',
    return_url: config.returnUrl + '?session_id={CHECKOUT_SESSION_ID}',
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    shipping_address_collection: {allowed_countries: countries},
    shipping_options: [{shipping_rate: config.shippingRate}],
    automatic_tax: {enabled: config.automaticTax},
    line_items: cart.map(({finish, qty}) => {
      const price = config.prices[finish];
      if (!/^price_/.test(price || '')) throw Error('Selected finish is not available');
      return {price, quantity: qty};
    }),
    metadata: {store: 'nexora', product: 'mi-1'},
    payment_intent_data: {metadata: {store: 'nexora', product: 'mi-1'}},
  };
}
