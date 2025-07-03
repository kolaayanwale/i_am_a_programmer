import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { subjects } from "@shared/schema";
import { eq } from "drizzle-orm";
import { insertSubjectSchema, insertSubscriptionSchema, insertTributeSchema, prayerMessages } from "@shared/schema";
import { z } from "zod";
import { sendPrayerReminder } from "./emailService";
import { sendTestReminderToSubscription } from "./emailScheduler";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Person creation with uniqueness validation
  app.post('/api/persons/create', async (req, res) => {
    try {
      const { firstName, lastName, birthday, dateOfDeath } = req.body;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      // Check for existing person with same name
      const existingPerson = await storage.findExistingSubject(fullName, birthday, dateOfDeath);
      
      if (existingPerson) {
        // Return existing person's slug
        const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return res.json({ 
          exists: true, 
          slug: slug,
          person: existingPerson 
        });
      }

      // Create new person entry (minimal for public memorial pages)
      const newPerson = await storage.createSubject({
        userId: 'public', // Use 'public' for non-authenticated users
        name: fullName,
        birthday: birthday || null,
        dateOfDeath: dateOfDeath || null,
      });

      const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      res.json({ 
        exists: false, 
        slug: slug,
        person: newPerson 
      });
    } catch (error) {
      console.error("Error creating person:", error);
      res.status(500).json({ message: "Failed to create person" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/recent-activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentActivity(userId, limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  app.get('/api/dashboard/upcoming-notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const notifications = await storage.getUpcomingNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching upcoming notifications:", error);
      res.status(500).json({ message: "Failed to fetch upcoming notifications" });
    }
  });

  // Subject routes
  app.get('/api/subjects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subjects = await storage.getSubjects(userId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get('/api/subjects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const subject = await storage.getSubject(id);
      
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      // Check if user owns this subject
      if (subject.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.post('/api/subjects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subjectData = insertSubjectSchema.parse({
        ...req.body,
        userId,
      });

      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.put('/api/subjects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if subject exists and user owns it
      const existingSubject = await storage.getSubject(id);
      if (!existingSubject || existingSubject.userId !== userId) {
        return res.status(404).json({ message: "Subject not found" });
      }

      const subjectData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(id, subjectData);
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete('/api/subjects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if subject exists and user owns it
      const existingSubject = await storage.getSubject(id);
      if (!existingSubject || existingSubject.userId !== userId) {
        return res.status(404).json({ message: "Subject not found" });
      }

      await storage.deleteSubject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Subscription routes
  app.get('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Get subscriptions by email (for unsubscribe page)
  app.get('/api/subscriptions/by-email/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const subscriptions = await storage.getSubscriptionsByEmail(email);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions by email:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Update subscription status
  app.patch('/api/subscriptions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }
      
      const updates = req.body;
      const subscription = await storage.updateSubscription(id, updates);
      res.json(subscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ 
        message: "Failed to update subscription",
        error: error.message 
      });
    }
  });

  // Delete subscription
  app.delete('/api/subscriptions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      await storage.deleteSubscription(id);
      res.json({ message: "Subscription deleted successfully" });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ 
        message: "Failed to delete subscription",
        error: error.message 
      });
    }
  });

  // Unsubscribe all for email
  app.post('/api/subscriptions/unsubscribe-all', async (req, res) => {
    try {
      const { email } = req.body;
      await storage.deactivateAllSubscriptionsByEmail(email);
      res.json({ message: "All subscriptions deactivated successfully" });
    } catch (error) {
      console.error("Error unsubscribing all:", error);
      res.status(500).json({ message: "Failed to unsubscribe from all reminders" });
    }
  });

  app.get('/api/subjects/:id/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const subjectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if subject exists and user owns it
      const subject = await storage.getSubject(subjectId);
      if (!subject || subject.userId !== userId) {
        return res.status(404).json({ message: "Subject not found" });
      }

      const subscriptions = await storage.getSubjectSubscriptions(subjectId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subject subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subject subscriptions" });
    }
  });

  app.post('/api/subscriptions', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || 'anonymous';
      
      // Calculate next notification date based on frequency using local time
      const calculateNextNotification = (frequency: string, timeOfDay?: string, specificTime?: string, dateOfBirth?: string, dateOfDeath?: string) => {
        // Get current local time (assumes server is running in user's timezone)
        const now = new Date();
        let nextDate = new Date();
        
        switch (frequency) {
          case 'daily':
            // For daily reminders, schedule for today if before the reminder time, otherwise tomorrow
            const targetHour = timeOfDay === 'morning' ? 9 : timeOfDay === 'afternoon' ? 14 : timeOfDay === 'evening' ? 19 : 9;
            
            // Create target time for today
            const todayTarget = new Date();
            todayTarget.setHours(targetHour, 0, 0, 0);
            
            // If target time hasn't passed today, schedule for today; otherwise tomorrow
            if (todayTarget > now) {
              nextDate = todayTarget;
            } else {
              nextDate = new Date(todayTarget);
              nextDate.setDate(nextDate.getDate() + 1);
            }
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'quarterly':
            nextDate.setMonth(nextDate.getMonth() + 3);
            break;
          case 'annually':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          case 'birthday':
            if (dateOfBirth) {
              const birthDate = new Date(dateOfBirth);
              nextDate = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
              // If birthday already passed this year, set for next year
              if (nextDate <= now) {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
              }
            } else {
              nextDate.setDate(nextDate.getDate() + 1); // Fallback to daily
            }
            break;
          case 'death_anniversary':
            if (dateOfDeath) {
              const deathDate = new Date(dateOfDeath);
              nextDate = new Date(now.getFullYear(), deathDate.getMonth(), deathDate.getDate());
              // If anniversary already passed this year, set for next year
              if (nextDate <= now) {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
              }
            } else {
              nextDate.setDate(nextDate.getDate() + 1); // Fallback to daily
            }
            break;
          default:
            nextDate.setDate(nextDate.getDate() + 1); // Default to daily
        }
        
        // Set time based on timeOfDay preference
        // Create the time string in ISO format but without timezone info to store as intended local time
        if (specificTime) {
          const [hours, minutes] = specificTime.split(':').map(Number);
          const year = nextDate.getFullYear();
          const month = String(nextDate.getMonth() + 1).padStart(2, '0');
          const day = String(nextDate.getDate()).padStart(2, '0');
          const hourStr = String(hours).padStart(2, '0');
          const minStr = String(minutes).padStart(2, '0');
          // Create a date string that represents the local time the user wants
          const dateStr = `${year}-${month}-${day}T${hourStr}:${minStr}:00`;
          nextDate = new Date(dateStr);
        } else {
          let hour;
          switch (timeOfDay) {
            case 'morning':
              hour = 8;
              break;
            case 'afternoon':
              hour = 14;
              break;
            case 'evening':
              hour = 18;
              break;
            default:
              hour = 9; // Default to 9 AM
          }
          const year = nextDate.getFullYear();
          const month = String(nextDate.getMonth() + 1).padStart(2, '0');
          const day = String(nextDate.getDate()).padStart(2, '0');
          const hourStr = String(hour).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}T${hourStr}:00:00`;
          nextDate = new Date(dateStr);
        }
        
        return nextDate;
      };

      // Create subscription without requiring existing subject for new flow
      const subjectName = req.body.subjectFirstName && req.body.subjectLastName 
        ? `${req.body.subjectFirstName} ${req.body.subjectLastName}`
        : req.body.subjectName || null;
      
      const subscriptionData = {
        userId,
        subjectId: null,
        subjectName,
        subjectGender: req.body.subjectGender || 'male',
        subjectDateOfBirth: req.body.subjectDateOfBirth || null,
        subjectDateOfDeath: req.body.subjectDateOfDeath || null,
        subscriberEmail: req.body.subscriberEmail,
        subscriberPhone: req.body.subscriberPhone || null,
        notificationTypeId: req.body.notificationTypeId || 1,
        frequency: req.body.frequency,
        timeOfDay: req.body.timeOfDay || null,
        specificTime: req.body.specificTime || null,
        dayOfWeek: req.body.dayOfWeek || null,
        dayOfMonth: req.body.dayOfMonth || null,
        channels: req.body.channels || ['email'],
        reminderMessage: null,
        isActive: true,
        nextNotificationDate: calculateNextNotification(req.body.frequency, req.body.timeOfDay, req.body.specificTime, req.body.subjectDateOfBirth, req.body.subjectDateOfDeath),
      };

      const subscription = await storage.createSubscription(subscriptionData);
      
      // Send welcome email with first prayer reminder
      try {
        console.log(`Sending welcome email to ${subscription.subscriberEmail} for ${subscription.subjectName}`);
        
        const prayerMessage = await storage.getRandomPrayerMessage();
        let message = prayerMessage?.message || "May Allah grant them peace and mercy. Ameen.";
        
        // Use the new formatting system with gender-aware pronouns
        if (subscription.subjectName && prayerMessage) {
          message = storage.formatPrayerMessage(
            prayerMessage.message,
            subscription.subjectName,
            subscription.subjectGender as 'male' | 'female' || 'male'
          );
        }

        const emailSent = await sendPrayerReminder(
          subscription.subscriberEmail,
          subscription.subjectName,
          message,
          subscription.subjectGender as 'male' | 'female' || 'male'
        );
        
        console.log(`Welcome email sent to ${subscription.subscriberEmail}: ${emailSent}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail the subscription creation if email fails
      }
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.put('/api/subscriptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if subscription exists and user owns it
      const userSubscriptions = await storage.getSubscriptions(userId);
      const existingSubscription = userSubscriptions.find(sub => sub.id === id);
      
      if (!existingSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      const subscriptionData = insertSubscriptionSchema.partial().parse(req.body);
      const subscription = await storage.updateSubscription(id, subscriptionData);
      res.json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete('/api/subscriptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if subscription exists and user owns it
      const userSubscriptions = await storage.getSubscriptions(userId);
      const existingSubscription = userSubscriptions.find(sub => sub.id === id);
      
      if (!existingSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      await storage.deleteSubscription(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Notification types
  app.get('/api/notification-types', isAuthenticated, async (req: any, res) => {
    try {
      const types = await storage.getNotificationTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching notification types:", error);
      res.status(500).json({ message: "Failed to fetch notification types" });
    }
  });

  // Search for people by name (public endpoint)
  app.get('/api/search/people', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }

      const searchResults = await storage.searchSubjects(query.trim());
      res.json(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search people" });
    }
  });

  // Public person pages (no authentication required)
  app.get('/api/people/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Convert slug back to name for lookup
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Find person by name
      const [person] = await db.select().from(subjects).where(eq(subjects.name, name));
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }

      res.json(person);
    } catch (error) {
      console.error("Error fetching person:", error);
      res.status(500).json({ message: "Failed to fetch person" });
    }
  });

  app.get('/api/people/:slug/tributes', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Convert slug back to name for lookup
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Find person by name
      const [person] = await db.select().from(subjects).where(eq(subjects.name, name));
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }

      const tributes = await storage.getPersonTributes(person.id);
      res.json(tributes);
    } catch (error) {
      console.error("Error fetching tributes:", error);
      res.status(500).json({ message: "Failed to fetch tributes" });
    }
  });

  app.post('/api/people/:slug/tributes', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Convert slug back to name for lookup
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Find person by name
      const [person] = await db.select().from(subjects).where(eq(subjects.name, name));
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }

      const tributeData = insertTributeSchema.parse({
        ...req.body,
        subjectId: person.id,
      });

      const tribute = await storage.createTribute(tributeData);
      res.status(201).json(tribute);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating tribute:", error);
      res.status(500).json({ message: "Failed to create tribute" });
    }
  });

  // Function to generate personalized prayer message
  const generatePersonalizedPrayerMessage = (template: string, personName: string) => {
    const firstName = personName.split(' ')[0];
    
    // Simple pronoun mapping - you can expand this for more sophisticated gender detection
    const pronouns = {
      'him': 'him',
      'his': 'his',
      'he': 'he'
    };
    
    return template
      .replace(/\{first-name\}/g, firstName)
      .replace(/\{first name or pronoun\}/g, firstName)
      .replace(/\{first-name or pronoun\}/g, firstName);
  };

  // Subscribe to memorial page reminders (temporary public route for testing)
  app.post('/api/people/:slug/subscribe', async (req: any, res) => {
    try {
      const { slug } = req.params;
      const person = await storage.getPersonBySlug(slug);
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }

      // Get a random prayer message from the database
      const randomPrayerMessage = await storage.getRandomPrayerMessage();
      let reminderMessage = `Remember to pray for ${person.name}`;
      
      if (randomPrayerMessage) {
        reminderMessage = generatePersonalizedPrayerMessage(randomPrayerMessage.message, person.name);
      }

      // For testing - use a temporary user ID
      const tempUserId = req.body.email || "temp-user-" + Date.now();

      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        userId: tempUserId,
        subjectId: person.id,
        reminderMessage,
      });

      const subscription = await storage.createSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Send reminder to specific subscription for testing
  app.post('/api/send-reminder/:subscriptionId', async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.subscriptionId);
      
      if (isNaN(subscriptionId)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const emailSent = await sendTestReminderToSubscription(subscriptionId);
      
      if (emailSent) {
        res.json({ 
          success: true, 
          message: `Prayer reminder sent for subscription ${subscriptionId}` 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to send reminder email" 
        });
      }
    } catch (error) {
      console.error("Send reminder error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send reminder" 
      });
    }
  });

  // Test email endpoint for immediate testing
  app.post('/api/test-email', async (req, res) => {
    try {
      const { email, personName, prayerMessage } = req.body;
      
      if (!email || !personName || !prayerMessage) {
        return res.status(400).json({ 
          message: "Missing required fields: email, personName, prayerMessage" 
        });
      }

      console.log(`Attempting to send test email to: ${email}`);
      const emailSent = await sendPrayerReminder(email, personName, prayerMessage);
      
      if (emailSent) {
        res.json({ 
          success: true, 
          message: `Test prayer reminder sent to ${email}` 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to send email. Check SendGrid configuration and sender verification." 
        });
      }
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send test email" 
      });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}
