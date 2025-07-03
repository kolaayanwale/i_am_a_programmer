import { storage } from "./storage";
import { sendPrayerReminder } from "./emailService";

// Simple scheduler for testing email functionality
export async function sendScheduledReminders(): Promise<void> {
  console.log("Checking for scheduled reminders...");
  
  try {
    // Get all active subscriptions (simplified for testing)
    const testSubscriptions = await storage.getSubscriptions("test");
    
    for (const subscription of testSubscriptions) {
      // For testing, send to daily subscriptions immediately
      if (subscription.frequency === "daily") {
        const success = await sendPrayerReminder(
          subscription.userId, 
          "Test Person", 
          subscription.reminderMessage || "Test prayer message"
        );
        
        if (success) {
          console.log(`Reminder sent to ${subscription.userId}`);
        } else {
          console.log(`Failed to send reminder to ${subscription.userId}`);
        }
      }
    }
  } catch (error) {
    console.error("Error in scheduled reminders:", error);
  }
}

// Manual trigger endpoint for testing
export async function sendTestReminderToSubscription(subscriptionId: number): Promise<boolean> {
  try {
    console.log(`Attempting to send test reminder for subscription ID: ${subscriptionId}`);
    
    const subscription = await storage.getSubscription(subscriptionId);
    if (!subscription) {
      console.error(`Subscription ${subscriptionId} not found`);
      return false;
    }

    console.log(`Found subscription:`, {
      id: subscription.id,
      email: subscription.subscriberEmail,
      name: subscription.subjectName,
      gender: subscription.subjectGender
    });

    if (!subscription.subscriberEmail) {
      console.error(`No email address for subscription ${subscriptionId}`);
      return false;
    }

    // Get a random prayer message and personalize it
    const prayerMessage = await storage.getRandomPrayerMessage();
    let message = prayerMessage?.message || "May Allah grant them peace and mercy. Ameen.";
    
    // Use the new formatting system with gender-aware pronouns
    if (subscription.subjectName && prayerMessage) {
      message = storage.formatPrayerMessage(
        prayerMessage.message,
        subscription.subjectName,
        (subscription.subjectGender as 'male' | 'female') || 'male'
      );
    }

    console.log(`Sending test reminder to ${subscription.subscriberEmail} for ${subscription.subjectName}`);
    console.log(`Personalized prayer message: ${message}`);
    
    const result = await sendPrayerReminder(
      subscription.subscriberEmail,
      subscription.subjectName || "your loved one",
      message,
      (subscription.subjectGender as 'male' | 'female') || 'male'
    );
    
    console.log(`Email send result: ${result}`);
    return result;
  } catch (error) {
    console.error("Error sending test reminder:", error);
    console.error("Full error:", error);
    return false;
  }
}