export const UPSERT_PRODUCT = {
  postgres: `INSERT INTO products (id, name, category, price, stock, image, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         price = EXCLUDED.price,
         stock = EXCLUDED.stock,
         image = EXCLUDED.image,
         description = EXCLUDED.description`,
  mysql: `INSERT INTO products (id, name, category, price, stock, image, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         category = VALUES(category),
         price = VALUES(price),
         stock = VALUES(stock),
         image = VALUES(image),
         description = VALUES(description)`,
};

export const UPSERT_ORDER = {
  postgres: `INSERT INTO orders (id, placed_at, customer_name, customer_email, customer_address, subtotal, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         placed_at = EXCLUDED.placed_at,
         customer_name = EXCLUDED.customer_name,
         customer_email = EXCLUDED.customer_email,
         customer_address = EXCLUDED.customer_address,
         subtotal = EXCLUDED.subtotal,
         items = EXCLUDED.items`,
  mysql: `INSERT INTO orders (id, placed_at, customer_name, customer_email, customer_address, subtotal, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON DUPLICATE KEY UPDATE
         placed_at = VALUES(placed_at),
         customer_name = VALUES(customer_name),
         customer_email = VALUES(customer_email),
         customer_address = VALUES(customer_address),
         subtotal = VALUES(subtotal),
         items = VALUES(items)`,
};
