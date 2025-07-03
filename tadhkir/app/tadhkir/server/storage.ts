import {
  users,
  subjects,
  subscriptions,
  notificationTypes,
  notificationHistory,
  tributes,
  prayerMessages,
  type User,
  type UpsertUser,
  type Subject,
  type InsertSubject,
  type Subscription,
  type InsertSubscription,
  type NotificationType,
  type NotificationHistory,
  type InsertNotificationHistory,
  type Tribute,
  type InsertTribute,
  type PrayerMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Subject operations
  getSubjects(userId: string): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  searchSubjects(query: string): Promise<Subject[]>;
  findExistingSubject(name: string, birthday?: string, dateOfDeath?: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: number): Promise<void>;
  
  // Subscription operations
  getSubscriptions(userId: string): Promise<any[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubjectSubscriptions(subjectId: number): Promise<any[]>;
  getSubscriptionsByEmail(email: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription>;
  deleteSubscription(id: number): Promise<void>;
  deactivateAllSubscriptionsByEmail(email: string): Promise<void>;
  
  // Notification operations
  getNotificationTypes(): Promise<NotificationType[]>;
  createNotificationHistory(history: InsertNotificationHistory): Promise<NotificationHistory>;
  getRecentActivity(userId: string, limit?: number): Promise<any[]>;
  getUpcomingNotifications(userId: string, limit?: number): Promise<any[]>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalSubjects: number;
    activeSubscriptions: number;
    upcomingNotifications: number;
    thisMonth: number;
  }>;

  // Public person pages
  getPersonBySlug(slug: string): Promise<Subject | undefined>;
  getPersonTributes(subjectId: number): Promise<Tribute[]>;
  createTribute(tribute: InsertTribute): Promise<Tribute>;
  
  // Prayer messages
  getPrayerMessages(): Promise<PrayerMessage[]>;
  getRandomPrayerMessage(): Promise<PrayerMessage | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Subject operations
  async getSubjects(userId: string): Promise<Subject[]> {
    return await db
      .select()
      .from(subjects)
      .where(eq(subjects.userId, userId))
      .orderBy(desc(subjects.createdAt));
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async findExistingSubject(name: string, birthday?: string, dateOfDeath?: string): Promise<Subject | undefined> {
    const { ilike } = await import("drizzle-orm");
    
    if (birthday && dateOfDeath) {
      const [subject] = await db
        .select()
        .from(subjects)
        .where(
          and(
            ilike(subjects.name, name),
            eq(subjects.birthday, birthday),
            eq(subjects.dateOfDeath, dateOfDeath)
          )
        );
      return subject;
    } else if (birthday) {
      const [subject] = await db
        .select()
        .from(subjects)
        .where(
          and(
            ilike(subjects.name, name),
            eq(subjects.birthday, birthday)
          )
        );
      return subject;
    } else if (dateOfDeath) {
      const [subject] = await db
        .select()
        .from(subjects)
        .where(
          and(
            ilike(subjects.name, name),
            eq(subjects.dateOfDeath, dateOfDeath)
          )
        );
      return subject;
    } else {
      const [subject] = await db
        .select()
        .from(subjects)
        .where(ilike(subjects.name, name));
      return subject;
    }
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    // Capitalize the name before creating
    const capitalizedName = subject.name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    const [newSubject] = await db
      .insert(subjects)
      .values({
        ...subject,
        name: capitalizedName,
      })
      .returning();
    return newSubject;
  }

  async updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject> {
    // Capitalize the name if it's being updated
    const updateData = { ...subject };
    if (updateData.name) {
      updateData.name = updateData.name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    const [updatedSubject] = await db
      .update(subjects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(subjects.id, id))
      .returning();
    return updatedSubject;
  }

  async deleteSubject(id: number): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  async searchSubjects(query: string): Promise<Subject[]> {
    const { ilike } = await import("drizzle-orm");
    return await db
      .select()
      .from(subjects)
      .where(ilike(subjects.name, `%${query}%`))
      .limit(10);
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    try {
      console.log(`Looking up subscription ID: ${id}`);
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, id));
      console.log(`Found subscription:`, subscription);
      return subscription;
    } catch (error) {
      console.error(`Error getting subscription ${id}:`, error);
      return undefined;
    }
  }

  async getSubscriptions(userId: string): Promise<any[]> {
    return await db
      .select({
        id: subscriptions.id,
        frequency: subscriptions.frequency,
        channels: subscriptions.channels,
        isActive: subscriptions.isActive,
        nextNotificationDate: subscriptions.nextNotificationDate,
        subject: {
          id: subjects.id,
          name: subjects.name,
          relationship: subjects.relationship,
        },
        notificationType: {
          id: notificationTypes.id,
          name: notificationTypes.name,
          description: notificationTypes.description,
        },
      })
      .from(subscriptions)
      .leftJoin(subjects, eq(subscriptions.subjectId, subjects.id))
      .leftJoin(notificationTypes, eq(subscriptions.notificationTypeId, notificationTypes.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async getSubjectSubscriptions(subjectId: number): Promise<any[]> {
    return await db
      .select({
        id: subscriptions.id,
        frequency: subscriptions.frequency,
        channels: subscriptions.channels,
        isActive: subscriptions.isActive,
        nextNotificationDate: subscriptions.nextNotificationDate,
        notificationType: {
          id: notificationTypes.id,
          name: notificationTypes.name,
          description: notificationTypes.description,
        },
      })
      .from(subscriptions)
      .leftJoin(notificationTypes, eq(subscriptions.notificationTypeId, notificationTypes.id))
      .where(eq(subscriptions.subjectId, subjectId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async createSubscription(subscription: any): Promise<Subscription> {
    // Capitalize the subject name
    const processedData = {
      ...subscription,
      subjectName: subscription.subjectName ? subscription.subjectName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ') : subscription.subjectName,
    };
    
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(processedData)
      .returning();
    return newSubscription;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription> {
    try {
      console.log(`Updating subscription ${id} with data:`, subscription);
      const [updatedSubscription] = await db
        .update(subscriptions)
        .set({ ...subscription, updatedAt: new Date() })
        .where(eq(subscriptions.id, id))
        .returning();
      
      if (!updatedSubscription) {
        throw new Error(`Subscription ${id} not found`);
      }
      
      console.log(`Successfully updated subscription ${id}`);
      return updatedSubscription;
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }

  async deleteSubscription(id: number): Promise<void> {
    try {
      console.log(`Deleting subscription with ID: ${id}`);
      const result = await db.delete(subscriptions).where(eq(subscriptions.id, id));
      console.log(`Successfully deleted subscription ${id}`);
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      throw new Error(`Failed to delete subscription: ${error.message}`);
    }
  }

  async getSubscriptionsByEmail(email: string): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriberEmail, email))
      .orderBy(subscriptions.createdAt);
  }

  async deactivateAllSubscriptionsByEmail(email: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(subscriptions.subscriberEmail, email));
  }

  // Notification operations
  async getNotificationTypes(): Promise<NotificationType[]> {
    return await db.select().from(notificationTypes);
  }

  async createNotificationHistory(history: InsertNotificationHistory): Promise<NotificationHistory> {
    const [newHistory] = await db
      .insert(notificationHistory)
      .values(history)
      .returning();
    return newHistory;
  }

  async getRecentActivity(userId: string, limit = 10): Promise<any[]> {
    return await db
      .select({
        id: notificationHistory.id,
        channel: notificationHistory.channel,
        status: notificationHistory.status,
        sentAt: notificationHistory.sentAt,
        subject: {
          name: subjects.name,
        },
        notificationType: {
          name: notificationTypes.name,
        },
      })
      .from(notificationHistory)
      .leftJoin(subscriptions, eq(notificationHistory.subscriptionId, subscriptions.id))
      .leftJoin(subjects, eq(subscriptions.subjectId, subjects.id))
      .leftJoin(notificationTypes, eq(subscriptions.notificationTypeId, notificationTypes.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(notificationHistory.createdAt))
      .limit(limit);
  }

  async getUpcomingNotifications(userId: string, limit = 10): Promise<any[]> {
    return await db
      .select({
        id: subscriptions.id,
        nextNotificationDate: subscriptions.nextNotificationDate,
        channels: subscriptions.channels,
        subject: {
          id: subjects.id,
          name: subjects.name,
          profileImageUrl: subjects.profileImageUrl,
        },
        notificationType: {
          name: notificationTypes.name,
        },
      })
      .from(subscriptions)
      .leftJoin(subjects, eq(subscriptions.subjectId, subjects.id))
      .leftJoin(notificationTypes, eq(subscriptions.notificationTypeId, notificationTypes.id))
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.isActive, true)
      ))
      .orderBy(subscriptions.nextNotificationDate)
      .limit(limit);
  }

  async getDashboardStats(userId: string): Promise<{
    totalSubjects: number;
    activeSubscriptions: number;
    upcomingNotifications: number;
    thisMonth: number;
  }> {
    const [totalSubjects] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(subjects)
      .where(eq(subjects.userId, userId));

    const [activeSubscriptions] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.isActive, true)
      ));

    const [upcomingNotifications] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.isActive, true)
      ));

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [thisMonth] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notificationHistory)
      .leftJoin(subscriptions, eq(notificationHistory.subscriptionId, subscriptions.id))
      .where(and(
        eq(subscriptions.userId, userId),
        sql`${notificationHistory.createdAt} >= ${startOfMonth}`
      ));

    return {
      totalSubjects: totalSubjects.count || 0,
      activeSubscriptions: activeSubscriptions.count || 0,
      upcomingNotifications: upcomingNotifications.count || 0,
      thisMonth: thisMonth.count || 0,
    };
  }

  // Public person pages
  async getPersonBySlug(slug: string): Promise<Subject | undefined> {
    // Parse slug to get name components
    const [firstName, lastName] = slug.split("-").map(name => 
      decodeURIComponent(name || "")
    );
    const fullName = `${firstName} ${lastName}`.trim();

    // Find person by name (case-insensitive) or create if doesn't exist
    let [person] = await db
      .select()
      .from(subjects)
      .where(sql`LOWER(${subjects.name}) = LOWER(${fullName})`)
      .limit(1);

    // If person doesn't exist, create a public memorial page
    if (!person && fullName.length > 2) {
      [person] = await db
        .insert(subjects)
        .values({
          userId: "public", // Special user ID for public memorial pages
          name: fullName,
          status: "active",
        })
        .returning();
    }

    return person;
  }

  async getPersonTributes(subjectId: number): Promise<Tribute[]> {
    return await db
      .select()
      .from(tributes)
      .where(and(
        eq(tributes.subjectId, subjectId),
        eq(tributes.isApproved, true)
      ))
      .orderBy(desc(tributes.createdAt));
  }

  async createTribute(tribute: InsertTribute): Promise<Tribute> {
    const [newTribute] = await db
      .insert(tributes)
      .values({
        ...tribute,
        isApproved: true, // Auto-approve tributes for now
      })
      .returning();
    return newTribute;
  }

  async getPrayerMessages(): Promise<PrayerMessage[]> {
    return await db
      .select()
      .from(prayerMessages)
      .where(eq(prayerMessages.isActive, true));
  }

  async getRandomPrayerMessage(): Promise<PrayerMessage | undefined> {
    const messages = await this.getPrayerMessages();
    if (messages.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  // Helper function to format prayer message with person's name and gender
  formatPrayerMessage(message: string, fullName: string, gender: 'male' | 'female'): string {
    const firstName = fullName.split(' ')[0];
    const pronoun = gender === 'male' ? 'him' : 'her';
    
    return message
      .replace(/{first-name}/g, firstName)
      .replace(/{pronoun}/g, pronoun);
  }
}

export const storage = new DatabaseStorage();
