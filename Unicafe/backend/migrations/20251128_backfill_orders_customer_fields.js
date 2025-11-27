// Migration intentionally disabled.
// The project maintains customer information via joins to `users` and
// does not add denormalized `orders.customer_name` / `orders.customer_email` columns.
// This file remains as a no-op to avoid accidental schema changes.

console.log('NO-OP: backfill_orders_customer_fields - migration disabled');
process.exit(0);
