# Nexora Stripe setup

This service is prepared, not activated. It uses Stripe Embedded Checkout and keeps card details out of Nexora's server. No supplier dispatch is enabled.

## Hosting

Deploy this directory to a Node 24 HTTPS service with a persistent disk. Run `npm ci`, then `npm start`. Set `DATA_DIR` to the persistent disk location. Use the environment variable names in `.env.stripe.example`; enter credentials only in the host's private environment settings.

## Sandbox activation

1. Configure Stripe test secret and publishable keys.
2. Create MI-1 Black and White test Prices matching the advertised **USD 99**. Set their Price IDs, a confirmed Shipping Rate ID, and allowed destination countries. Seller country does not determine shipping destinations.
3. Register `/webhooks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Configure its signing secret.
4. Set allowed origins to both storefront domains. Configure the checkout return URL. The status endpoint returns payment status only, not customer details.
5. Set each storefront's `assets/payment-config.json` API base URL to this service and enable `PAYMENTS_ENABLED` for sandbox tests.
6. Test successful payment, decline, 3DS, invalid baskets, retries, and duplicate webhook delivery before live activation.

## Live activation

Confirm supplier fulfilment, stock, destinations, shipping fees, delivery estimates, returns and tax configuration first. Automatic tax starts disabled; configure Stripe Tax before enabling it. Replace all test IDs and credentials with live values, then set `LIVE_PAYMENTS_APPROVED=true`. Never put secret keys in the frontend or GitHub.

Paid events enter a persistent manual-review queue. Stripe Dashboard remains the source of truth for payment, customer, refund and dispute status. The service does not ship orders or pay suppliers. Use an edge rate limiter when deploying behind a shared reverse proxy; the built-in limit uses socket IPs.

End-to-end Stripe testing requires the user's account connection and deployment. Current automated checks validate basket constraints and server-owned pricing; they do not prove a real payment flow.
