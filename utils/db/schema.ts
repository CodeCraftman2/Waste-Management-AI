import { integer, varchar, pgTable, serial, text, timestamp, jsonb, boolean, decimal } from "drizzle-orm/pg-core";

// Users table
export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// UserSettings table
export const UserSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull().unique(),
  // Notification settings
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  reportNotifications: boolean("report_notifications").notNull().default(true),
  collectionNotifications: boolean("collection_notifications").notNull().default(false),
  leaderboardNotifications: boolean("leaderboard_notifications").notNull().default(true),
  // Privacy settings
  profileVisible: boolean("profile_visible").notNull().default(true),
  showLocation: boolean("show_location").notNull().default(false),
  showStats: boolean("show_stats").notNull().default(true),
  // Profile settings
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reports table
export const Reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  location: text("location").notNull(),
  wasteType: varchar("waste_type", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default("pending"),
  aiAnalysis: jsonb("ai_analysis"),
  status: varchar("status", { length: 255 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  collectorId: integer("collector_id").references(() => Users.id),
});

// Rewards table
export const Rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  description: text("description"),
  name: varchar("name", { length: 255 }).notNull(),
  collectionInfo: text("collection_info").notNull(),
});

// CollectedWastes table
export const CollectedWastes = pgTable("collected_wastes", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => Reports.id).notNull(),
  collectorId: integer("collector_id").references(() => Users.id).notNull(),
  collectionDate: timestamp("collection_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("collected"),
});

// Notifications table
export const Notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions table
export const Transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'earned_report', 'earned_collect', 'redeemed'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

// SolanaTransactions table
export const SolanaTransactions = pgTable("solana_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id).notNull(),
  transactionHash: varchar("transaction_hash", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'reward_payout', 'transfer_in', 'transfer_out', 'staking_reward'
  amount: decimal("amount", { precision: 18, scale: 9 }).notNull(), // SOL amount with 9 decimal places
  usdValue: decimal("usd_value", { precision: 10, scale: 2 }).notNull(), // USD value at time of transaction
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // 'pending', 'confirmed', 'failed'
  fromAddress: varchar("from_address", { length: 255 }),
  toAddress: varchar("to_address", { length: 255 }),
  blockNumber: integer("block_number"),
  gasFee: decimal("gas_fee", { precision: 18, scale: 9 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});