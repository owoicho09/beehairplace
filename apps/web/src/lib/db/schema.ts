import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),
    description: text("description"),
    basePrice: numeric("base_price", { precision: 12, scale: 2 }),
    hasVariants: boolean("has_variants").notNull().default(false),
    availability: text("availability", {
      enum: ["in_stock", "out_of_stock"],
    })
      .notNull()
      .default("in_stock"),
    publishStatus: text("publish_status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    index("products_category_publish_idx").on(
      table.categoryId,
      table.publishStatus,
    ),
    index("products_publish_featured_idx").on(
      table.publishStatus,
      table.isFeatured,
    ),
    index("products_publish_bestseller_idx").on(
      table.publishStatus,
      table.isBestSeller,
    ),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    availability: text("availability", {
      enum: ["in_stock", "out_of_stock"],
    })
      .notNull()
      .default("in_stock"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("product_variants_product_idx").on(table.productId)],
);

export const productMedia = pgTable(
  "product_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Nullable: store-level media (hero/store video) isn't attached to any
    // product but still goes through the same upload/transcode pipeline.
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "cascade",
    }),
    kind: text("kind", { enum: ["video", "photo"] }).notNull(),
    role: text("role", { enum: ["primary", "gallery", "store"] })
      .notNull()
      .default("gallery"),
    status: text("status", {
      enum: ["pending", "processing", "ready", "failed"],
    })
      .notNull()
      .default("pending"),
    rawPath: text("raw_path").notNull(),
    processedUrl: text("processed_url"),
    posterUrl: text("poster_url"),
    width: integer("width"),
    height: integer("height"),
    durationSeconds: numeric("duration_seconds", { precision: 8, scale: 2 }),
    errorMessage: text("error_message"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("product_media_product_idx").on(table.productId),
    index("product_media_status_idx").on(table.status),
  ],
);

export const storeSettings = pgTable("store_settings", {
  id: integer("id").primaryKey().default(1),
  storeName: text("store_name").notNull().default("Bee Hairplace"),
  address: text("address"),
  phone: text("phone"),
  whatsappNumber: text("whatsapp_number"),
  openingHours: text("opening_hours"),
  heroMediaId: uuid("hero_media_id").references(() => productMedia.id, {
    onDelete: "set null",
  }),
  storeVideoMediaId: uuid("store_video_media_id").references(
    () => productMedia.id,
    { onDelete: "set null" },
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const deliverySettings = pgTable("delivery_settings", {
  id: integer("id").primaryKey().default(1),
  flatFee: numeric("flat_fee", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  freeDeliveryThreshold: numeric("free_delivery_threshold", {
    precision: 12,
    scale: 2,
  }),
  zoneFees: jsonb("zone_fees")
    .$type<{ zone: string; fee: number }[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    fulfilmentMethod: text("fulfilment_method", {
      enum: ["delivery", "pickup"],
    }).notNull(),
    deliveryAddress: jsonb("delivery_address").$type<{
      address: string;
      city?: string;
      zone?: string;
      notes?: string;
    } | null>(),
    deliveryFee: numeric("delivery_fee", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("NGN"),
    paymentStatus: text("payment_status", {
      enum: ["pending", "paid", "failed"],
    })
      .notNull()
      .default("pending"),
    fulfilmentStatus: text("fulfilment_status", {
      enum: [
        "processing",
        "ready_for_pickup",
        "out_for_delivery",
        "completed",
        "cancelled",
      ],
    })
      .notNull()
      .default("processing"),
    paystackReference: text("paystack_reference").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    index("orders_payment_fulfilment_idx").on(
      table.paymentStatus,
      table.fulfilmentStatus,
    ),
    index("orders_created_idx").on(table.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    variantLabelSnapshot: text("variant_label_snapshot"),
    unitPriceSnapshot: numeric("unit_price_snapshot", {
      precision: 12,
      scale: 2,
    }).notNull(),
    quantity: integer("quantity").notNull(),
    posterUrlSnapshot: text("poster_url_snapshot"),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// -- Relations --

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  media: many(productMedia),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
);

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

export const storeSettingsRelations = relations(storeSettings, ({ one }) => ({
  heroMedia: one(productMedia, {
    fields: [storeSettings.heroMediaId],
    references: [productMedia.id],
  }),
  storeVideoMedia: one(productMedia, {
    fields: [storeSettings.storeVideoMediaId],
    references: [productMedia.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
