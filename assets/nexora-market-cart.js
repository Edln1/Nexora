(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NexoraMarketCart = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const currencies = {CA:'cad', US:'usd'};
  const positive = value => Number.isSafeInteger(value) && value > 0;
  function createCart(config, saved = {}) {
    if (config?.collection !== 'nexora-catalogue' || config.enabled !== true
        || !Array.isArray(config.shippingCountries) || !['CA','US'].every(country => config.shippingCountries.includes(country))
        || !Array.isArray(config.products)) throw Error('Catalogue ordering is not available yet.');
    const offers = new Map(), products = new Map();
    for (const product of config.products) {
      if (!product?.ready || !Array.isArray(product.offers)) continue;
      const pair = ['CA','US'].map(country => product.offers.find(offer => offer.market === country));
      if (!pair.every(offer => offer?.ready && offer.physicalSku === product.sku
          && offer.currency === currencies[offer.market] && positive(offer.amount)
          && Number.isSafeInteger(offer.shippingAmount) && offer.shippingAmount >= 0
          && offer.shippingBasis === 'per-unit' && typeof offer.sku === 'string')) continue;
      if (pair.some(offer => offers.has(offer.sku)) || products.has(product.sku)) throw Error('Catalogue identities need review.');
      const copied = pair.map(offer => Object.freeze({...offer}));
      products.set(product.sku, copied);
      copied.forEach(offer => offers.set(offer.sku, offer));
    }
    let market = Object.hasOwn(currencies, saved.market) ? saved.market : 'CA';
    let items = [];
    for (const item of Array.isArray(saved.items) ? saved.items.slice(0,5) : []) {
      const offer = offers.get(item?.sku);
      if (offer?.market === market && positive(item.qty) && item.qty <= 5 && !items.some(row => row.sku === item.sku))
        items.push({sku:item.sku,qty:item.qty});
    }
    function snapshot() { return {market,items:items.map(item=>({...item}))}; }
    function lines() { return items.map(item=>({...offers.get(item.sku),qty:item.qty})); }
    function totals() { return lines().reduce((sum,line)=>({amount:sum.amount+line.amount*line.qty,
      shipping:sum.shipping+line.shippingAmount*line.qty,count:sum.count+line.qty}),{amount:0,shipping:0,count:0}); }
    function add(sku,qty) {
      const offer = offers.get(sku);
      if (!offer || offer.market !== market || !positive(qty) || qty > 5) throw Error('Choose an available product for this country and a quantity from 1 to 5.');
      const item = items.find(item=>item.sku===sku);
      if (item && item.qty+qty>5) throw Error('A maximum of five units is available per product.');
      if (!item && items.length>=5) throw Error('A basket can contain up to five different products.');
      if (item) item.qty+=qty; else items.push({sku,qty});
    }
    function quantity(sku,qty) {
      const item=items.find(item=>item.sku===sku);
      if (!item || !positive(qty) || qty>5) throw Error('Choose a quantity from 1 to 5.');
      item.qty=qty;
    }
    function remove(sku) { items=items.filter(item=>item.sku!==sku); }
    function selectMarket(next) {
      if (!Object.hasOwn(currencies,next)) throw Error('Choose Canada or the United States.');
      if (next===market) return;
      const repriced=items.map(item=>({sku:products.get(offers.get(item.sku).physicalSku).find(offer=>offer.market===next).sku,qty:item.qty}));
      items=repriced;market=next;
    }
    function request() {
      if (!items.length) throw Error('Your basket is empty.');
      return {collection:'nexora-catalogue',market,currency:currencies[market],items:snapshot().items};
    }
    function clearMatchingReceipt(receipt) {
      if (receipt?.market!==market || receipt.currency!==currencies[market] || !Array.isArray(receipt.items)
          || receipt.items.length!==items.length || !items.every(item=>receipt.items.some(line=>line.sku===item.sku&&line.qty===item.qty))) return false;
      items=[];return true;
    }
    return {snapshot,lines,totals,add,quantity,remove,selectMarket,request,clearMatchingReceipt,
      offer:sku=>offers.get(sku), currency:()=>currencies[market]};
  }
  return {createCart};
});
