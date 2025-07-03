import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  date,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subjects table - people that users create pages for
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  relationship: varchar("relationship"),
  email: varchar("email"),
  phone: varchar("phone"),
  birthday: date("birthday"),
  dateOfDeath: date("date_of_death"),
  profileImageUrl: varchar("profile_image_url"),
  status: varchar("status").notNull().default("active"), // active, paused, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification types and frequencies
export const notificationTypes = pgTable("notification_types", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(), // birthday, weekly, monthly, custom
  description: text("description"),
});

// Subscriptions - user subscriptions to subject notifications
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  subjectId: integer("subject_id").references(() => subjects.id),
  subjectName: varchar("subject_name", { length: 255 }),
  subjectGender: varchar("subject_gender", { length: 10 }).default("male"),
  subjectDateOfBirth: varchar("subject_date_of_birth", { length: 10 }),
  subjectDateOfDeath: varchar("subject_date_of_death", { length: 10 }),
  subscriberEmail: varchar("subscriber_email", { length: 255 }),
  subscriberPhone: varchar("subscriber_phone", { length: 20 }),
  notificationTypeId: serial("notification_type_id").notNull(),
  frequency: varchar("frequency").notNull(), // daily, weekly, monthly, quarterly, annually, birthday, death_anniversary
  timeOfDay: varchar("time_of_day"), // morning, afternoon, evening, specific_time
  specificTime: varchar("specific_time"), // HH:MM format for specific times
  dayOfWeek: varchar("day_of_week"), // For weekly: monday, tuesday, etc.
  dayOfMonth: integer("day_of_month"), // For monthly/quarterly/annually: 1-31
  channels: text("channels").array(), // email, sms, push
  reminderMessage: text("reminder_message"), // Personalized prayer message
  isActive: boolean("is_active").notNull().default(true),
  nextNotificationDate: timestamp("next_notification_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification history
export const notificationHistory = pgTable("notification_history", {
  id: serial("id").primaryKey(),
  subscriptionId: serial("subscription_id").notNull(),
  channel: varchar("channel").notNull(), // email, sms, push
  status: varchar("status").notNull(), // sent, failed, pending
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tributes - messages left on memorial pages
export const tributes = pgTable("tributes", {
  id: serial("id").primaryKey(),
  subjectId: serial("subject_id").notNull(),
  message: text("message").notNull(),
  authorName: varchar("author_name").notNull(),
  authorEmail: varchar("author_email"),
  isAnonymous: boolean("is_anonymous").default(false),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer messages table - standardized prayer messages for subscriptions
export const prayerMessages = pgTable("prayer_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subjects: many(subjects),
  subscriptions: many(subscriptions),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(users, {
    fields: [subjects.userId],
    references: [users.id],
  }),
  subscriptions: many(subscriptions),
  tributes: many(tributes),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [subscriptions.subjectId],
    references: [subjects.id],
  }),
  notificationType: one(notificationTypes, {
    fields: [subscriptions.notificationTypeId],
    references: [notificationTypes.id],
  }),
  history: many(notificationHistory),
}));

export const notificationHistoryRelations = relations(notificationHistory, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [notificationHistory.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const tributesRelations = relations(tributes, ({ one }) => ({
  subject: one(subjects, {
    fields: [tributes.subjectId],
    references: [subjects.id],
  }),
}));

// Insert schemas
export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).transform((data) => ({
  ...data,
  name: data.name ? data.name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ') : data.name,
}));

const baseSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  nextNotificationDate: true,
}).extend({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'birthday', 'death_anniversary']),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'specific_time']).optional(),
  specificTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  dayOfMonth: z.number().min(1).max(31).optional()
});

export const insertSubscriptionSchema = baseSubscriptionSchema.transform((data) => ({
  ...data,
  subjectName: data.subjectName ? data.subjectName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ') : data.subjectName,
}));

export const insertNotificationHistorySchema = createInsertSchema(notificationHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTributeSchema = createInsertSchema(tributes).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type NotificationType = typeof notificationTypes.$inferSelect;
export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type InsertNotificationHistory = z.infer<typeof insertNotificationHistorySchema>;
export type Tribute = typeof tributes.$inferSelect;
export type InsertTribute = z.infer<typeof insertTributeSchema>;
export type PrayerMessage = typeof prayerMessages.$inferSelect;
export type InsertPrayerMessage = typeof prayerMessages.$inferInsert;
