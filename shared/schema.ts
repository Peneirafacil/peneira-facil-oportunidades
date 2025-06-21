import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player profiles (extended user information)
export const playerProfiles = pgTable("player_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  position: varchar("position", { length: 50 }),
  modality: varchar("modality", { length: 20 }), // Campo/Futsal
  state: varchar("state", { length: 2 }),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Club history for players
export const clubHistory = pgTable("club_history", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => playerProfiles.id),
  clubName: varchar("club_name", { length: 100 }).notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  level: varchar("level", { length: 20 }).notNull(), // Base/Amador/Profissional
  createdAt: timestamp("created_at").defaultNow(),
});

// Video portfolio for players
export const videoPortfolio = pgTable("video_portfolio", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => playerProfiles.id),
  title: varchar("title", { length: 100 }),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  platform: varchar("platform", { length: 20 }), // YouTube/Instagram/TikTok
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tryout events
export const tryouts = pgTable("tryouts", {
  id: serial("id").primaryKey(),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  venue: varchar("venue", { length: 200 }),
  ageMinimum: integer("age_minimum"),
  ageMaximum: integer("age_maximum"),
  modality: varchar("modality", { length: 20 }).notNull(), // Campo/Futsal
  contactInfo: text("contact_info"),
  requiredDocuments: text("required_documents"),
  organizerDetails: text("organizer_details"),
  status: varchar("status", { length: 20 }).default("active"), // active/cancelled/completed
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tryout registrations
export const tryoutRegistrations = pgTable("tryout_registrations", {
  id: serial("id").primaryKey(),
  tryoutId: integer("tryout_id").notNull().references(() => tryouts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("registered"), // registered/attended/not_attended
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull(), // active/pending/expired
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  nextBillingDate: date("next_billing_date"),
  lastPaymentDate: date("last_payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment history
export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // success/failed/pending
  transactionId: varchar("transaction_id", { length: 100 }),
  paidAt: timestamp("paid_at").defaultNow(),
});

// Comments on tryouts
export const tryoutComments = pgTable("tryout_comments", {
  id: serial("id").primaryKey(),
  tryoutId: integer("tryout_id").notNull().references(() => tryouts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For replies
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences for notifications
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  notifyByRegion: boolean("notify_by_region").default(true),
  notifyByModality: boolean("notify_by_modality").default(true),
  notifyByAge: boolean("notify_by_age").default(true),
  preferredRegions: jsonb("preferred_regions"), // Array of states/cities
  preferredModalities: jsonb("preferred_modalities"), // Array of modalities
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(playerProfiles, { fields: [users.id], references: [playerProfiles.userId] }),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  tryouts: many(tryouts),
  registrations: many(tryoutRegistrations),
  comments: many(tryoutComments),
  preferences: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
}));

export const playerProfileRelations = relations(playerProfiles, ({ one, many }) => ({
  user: one(users, { fields: [playerProfiles.userId], references: [users.id] }),
  clubHistory: many(clubHistory),
  videos: many(videoPortfolio),
}));

export const tryoutRelations = relations(tryouts, ({ one, many }) => ({
  organizer: one(users, { fields: [tryouts.organizerId], references: [users.id] }),
  registrations: many(tryoutRegistrations),
  comments: many(tryoutComments),
}));

export const subscriptionRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  payments: many(paymentHistory),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertPlayerProfileSchema = createInsertSchema(playerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTryoutSchema = createInsertSchema(tryouts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClubHistorySchema = createInsertSchema(clubHistory).omit({ id: true, createdAt: true });
export const insertVideoPortfolioSchema = createInsertSchema(videoPortfolio).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTryoutRegistrationSchema = createInsertSchema(tryoutRegistrations).omit({ id: true, registeredAt: true });
export const insertTryoutCommentSchema = createInsertSchema(tryoutComments).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type InsertPlayerProfile = z.infer<typeof insertPlayerProfileSchema>;
export type Tryout = typeof tryouts.$inferSelect;
export type InsertTryout = z.infer<typeof insertTryoutSchema>;
export type ClubHistory = typeof clubHistory.$inferSelect;
export type InsertClubHistory = z.infer<typeof insertClubHistorySchema>;
export type VideoPortfolio = typeof videoPortfolio.$inferSelect;
export type InsertVideoPortfolio = z.infer<typeof insertVideoPortfolioSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type TryoutRegistration = typeof tryoutRegistrations.$inferSelect;
export type InsertTryoutRegistration = z.infer<typeof insertTryoutRegistrationSchema>;
export type TryoutComment = typeof tryoutComments.$inferSelect;
export type InsertTryoutComment = z.infer<typeof insertTryoutCommentSchema>;
