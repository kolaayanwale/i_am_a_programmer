import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bell, Users } from "lucide-react";
import Navigation from "@/components/navigation";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About Tadhkir</h1>
            <p className="text-xl text-muted-foreground">
              Gentle prayer reminders to keep your loved ones in your heart
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-primary" />
                  Gentle Prayer Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Tadhkir helps you stay connected to the memory of your loved ones through gentle, 
                  personalized prayer reminders. Set up notifications at your chosen frequency - 
                  daily, weekly, monthly, or on special dates like birthdays and anniversaries. 
                  Each reminder includes beautiful Islamic prayers with your loved one's name, 
                  encouraging moments of remembrance and spiritual connection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-primary" />
                  Memorial Pages (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Optionally, you can create memorial pages to share with other family members and 
                  friends. These dedicated spaces serve as digital tributes where loved ones can 
                  visit, leave messages, and share memories together. Memorial pages help bring 
                  families together in remembrance and create a lasting tribute that can be 
                  visited anytime for comfort and connection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Personalized Islamic Prayers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Every reminder includes authentic Islamic prayer messages that are personalized 
                  with your loved one's name and gender-appropriate language. These prayers help 
                  you remember them in a meaningful way, seeking Allah's mercy and blessings for 
                  their soul. The prayers are carefully selected from traditional Islamic supplications 
                  for the deceased.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Setting up prayer reminders is simple and meaningful:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Enter your loved one's name and details on our homepage</li>
                    <li>Choose your reminder frequency and preferred time</li>
                    <li>Provide your email to receive the gentle reminders</li>
                    <li>Optionally, create a memorial page to share with family and friends</li>
                  </ol>
                  <p className="mt-4">
                    Start remembering your loved ones in prayer today with Tadhkir's gentle, 
                    personalized reminder system.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}