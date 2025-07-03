import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Clock, Mail, Bell } from "lucide-react";
import Navigation from "@/components/navigation";
import SetupRemindersModal from "@/components/setup-reminders-modal";

export default function Landing() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleSetupReminders = () => {
    if (firstName.trim() && lastName.trim()) {
      const name = `${firstName.trim()} ${lastName.trim()}`;
      setFullName(name);
      setShowRemindersModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Remember
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Set up gentle prayer reminders for your loved ones who've returned to Allah
              </p>
            </div>

            {/* Main Action Card */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Set Up Prayer Reminders</CardTitle>
                <CardDescription className="text-center">
                  Receive gentle reminders to pray for your loved ones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSetupReminders}
                  className="w-full"
                  disabled={!firstName.trim() || !lastName.trim()}
                  type="button"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Set Up Reminders
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sample Prayers Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Sample Prayer Messages
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Beautiful Islamic prayers to remember your loved ones
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-3 py-6">
                <div className="text-xl font-arabic text-gray-900 dark:text-white mb-2">
                  اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ
                </div>
                <div className="text-lg italic text-gray-600 dark:text-gray-300">
                  "O Allah, forgive him, have mercy on him, grant him peace, and pardon him."
                </div>
              </div>

              <div className="text-center space-y-3 py-6">
                <div className="text-xl font-arabic text-gray-900 dark:text-white mb-2">
                  اللَّهُمَّ اجْعَلْ قَبْرَهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ
                </div>
                <div className="text-lg italic text-gray-600 dark:text-gray-300">
                  "O Allah, make his grave a garden from the gardens of Paradise."
                </div>
              </div>

              <div className="text-center space-y-3 py-6">
                <div className="text-xl font-arabic text-gray-900 dark:text-white mb-2">
                  اللَّهُمَّ نَوِّرْ لَهُ قَبْرَهُ وَوَسِّعْ مُدْخَلَهُ
                </div>
                <div className="text-lg italic text-gray-600 dark:text-gray-300">
                  "O Allah, illuminate his grave and expand his entrance."
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Flexible Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose from daily, weekly, monthly reminders, or special dates like birthdays and anniversaries.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Multiple Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Receive reminders via email, SMS, or push notifications based on your preference.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Islamic Prayers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Beautiful Islamic prayer messages included with each reminder to honor your loved ones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


      <SetupRemindersModal
        isOpen={showRemindersModal}
        onClose={() => {
          setShowRemindersModal(false);
          setFullName("");
        }}
        initialSubjectName={fullName}
      />
    </div>
  );
}