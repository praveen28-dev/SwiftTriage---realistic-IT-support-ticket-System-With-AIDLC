/**
 * Drizzle ORM Schema Definition
 * Enterprise ITSM Database Schema
 */

import { pgTable, uuid, text, varchar, integer, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Users Table (CRIT-01: database-backed auth with hashed passwords) ────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('end_user'), // 'end_user' | 'it_staff' | 'ADMIN'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Customers Table
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  logoUrl: text('logo_url'),
  tier: varchar('tier', { length: 50 }).default('Standard'), // Standard, Premium, Enterprise
  annualRevenue: decimal('annual_revenue', { precision: 15, scale: 2 }),
  clientId: varchar('client_id', { length: 100 }),
  territory: varchar('territory', { length: 100 }),
  primaryContact: varchar('primary_contact', { length: 255 }),
  cdiRating: integer('cdi_rating').default(0), // Customer Satisfaction Index 0-100
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tickets Table (Enhanced)
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id),
  submittedBy: varchar('submitted_by', { length: 255 }).notNull().default('anonymous'), // CRIT-02: track submitter identity
  userInput: text('user_input').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  urgencyScore: integer('urgency_score').notNull(),
  aiSummary: text('ai_summary').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  assignedTo: varchar('assigned_to', { length: 255 }),
  tags: text('tags'), // JSON array of tags
  priority: varchar('priority', { length: 20 }).default('Medium'), // Low, Medium, High, Critical
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Products Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sku: varchar('sku', { length: 100 }),
  category: varchar('category', { length: 100 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Customer Products (Many-to-Many)
export const customerProducts = pgTable('customer_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').default(1),
  purchaseDate: timestamp('purchase_date').notNull().defaultNow(),
});

// Activities Table
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id),
  ticketId: uuid('ticket_id').references(() => tickets.id),
  activityType: varchar('activity_type', { length: 50 }).notNull(), // Call, Email, Meeting, Note
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description'),
  performedBy: varchar('performed_by', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// SLA Policies Table
export const slaPolicies = pgTable('sla_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 20 }).notNull(),
  responseTime: integer('response_time').notNull(), // in minutes
  resolutionTime: integer('resolution_time').notNull(), // in minutes
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  tickets: many(tickets),
  activities: many(activities),
  products: many(customerProducts),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
  activities: many(activities),
}));

export const productsRelations = relations(products, ({ many }) => ({
  customers: many(customerProducts),
}));

export const customerProductsRelations = relations(customerProducts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerProducts.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [customerProducts.productId],
    references: [products.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  customer: one(customers, {
    fields: [activities.customerId],
    references: [customers.id],
  }),
  ticket: one(tickets, {
    fields: [activities.ticketId],
    references: [tickets.id],
  }),
}));

// Widget Configurations Table
export const widgetConfigs = pgTable('widget_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  widgetType: varchar('widget_type', { length: 100 }).notNull(), // 'tickets_by_status', 'tickets_by_tech_group', etc.
  title: varchar('title', { length: 255 }).notNull(),
  gridPosition: integer('grid_position').notNull(), // Position in dashboard grid
  gridColumn: integer('grid_column').default(1), // Column span (1-3)
  gridRow: integer('grid_row').default(1), // Row span
  queryConfig: text('query_config'), // JSON string with widget-specific filters
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Export inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type CustomerProduct = typeof customerProducts.$inferSelect;
export type NewCustomerProduct = typeof customerProducts.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type SLAPolicy = typeof slaPolicies.$inferSelect;
export type NewSLAPolicy = typeof slaPolicies.$inferInsert;
export type WidgetConfig = typeof widgetConfigs.$inferSelect;
export type NewWidgetConfig = typeof widgetConfigs.$inferInsert;
