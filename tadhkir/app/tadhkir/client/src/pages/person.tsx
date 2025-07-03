import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navigation from "@/components/navigation";
import SetupRemindersModal from "@/components/setup-reminders-modal";
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Share2, 
  MessageSquare, 
  Users, 
  Mail, 
  Phone, 
  Bell 
} from "lucide-react";

interface Person {
  id: number;
  userId: string;
  name: string;
  relationship?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  dateOfDeath?: string;
  profileImageUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Tribute {
  id: number;
  message: string;
  authorName: string;
  createdAt: string;
  isAnonymous: boolean;
}

export default function PersonPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [newTribute, setNewTribute] = useState({
    message: "",
    authorName: "",
    isAnonymous: false,
  });
  
  const [subscription, setSubscription] = useState({
    frequency: "",
    timeOfDay: "",
    specificTime: "",
    dayOfWeek: "",
    dayOfMonth: new Date().getDate(),
    email: true,
    sms: false,
    push: false,
    userEmail: "",
  });

  // Fetch person data
  const { data: person, isLoading: personLoading, error: personError } = useQuery<Person>({
    queryKey: [`/api/people/${slug}`],
    enabled: !!slug,
  });

  // Fetch tributes
  const { data: tributes = [], isLoading: tributesLoading } = useQuery<Tribute[]>({
    queryKey: [`/api/people/${slug}/tributes`],
    enabled: !!slug,
  });

  // Create tribute mutation
  const createTributeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/people/${slug}/tributes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/people/${slug}/tributes`] });
      setNewTribute({ message: "", authorName: "", isAnonymous: false });
      toast({
        title: "Tribute posted",
        description: "Your tribute has been shared successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Tribute posting error:", error);
      toast({
        title: "Error posting tribute",
        description: error.message || "Failed to post tribute. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const slug = person?.name.toLowerCase().replace(/\s+/g, '-');
      const response = await apiRequest('POST', `/api/people/${slug}/subscribe`, data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubscribeDialogOpen(false);
      setSubscription({
        frequency: "",
        timeOfDay: "",
        specificTime: "",
        dayOfWeek: "",
        dayOfMonth: new Date().getDate(),
        email: true,
        sms: false,
        push: false,
        userEmail: "",
      });
      toast({
        title: "Subscription created",
        description: "You'll receive prayer reminders according to your preferences.",
      });
    },
    onError: (error: any) => {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitTribute = () => {
    if (!newTribute.message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a tribute message",
        variant: "destructive",
      });
      return;
    }

    if (!newTribute.isAnonymous && !newTribute.authorName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name or choose to post anonymously",
        variant: "destructive",
      });
      return;
    }

    createTributeMutation.mutate({
      message: newTribute.message,
      authorName: newTribute.isAnonymous ? "Anonymous" : newTribute.authorName,
      isAnonymous: newTribute.isAnonymous,
    });
  };

  if (personLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading memorial page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (personError || !person) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Memorial Page Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The memorial page you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/">Return Home</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fullName = person?.name || "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Person Header with Subscribe Button */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mx-auto mb-6">
            {person?.profileImageUrl ? (
              <img 
                src={person.profileImageUrl} 
                alt={person.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-300">
                {person?.name?.split(' ').map(name => name[0]).join('')}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">{person?.name}</h1>
          {person?.birthday && (
            <p className="text-lg text-muted-foreground mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Born {new Date(person.birthday).toLocaleDateString()}
            </p>
          )}
          {person?.dateOfDeath && (
            <p className="text-lg text-muted-foreground mb-2">
              Passed away {new Date(person.dateOfDeath).toLocaleDateString()}
            </p>
          )}
          
          <div className="flex flex-wrap justify-center gap-2 mt-4 mb-6">
            {person?.relationship && (
              <Badge variant="secondary">
                {person.relationship}
              </Badge>
            )}
            {person?.email && (
              <Badge variant="outline">
                <Mail className="h-3 w-3 mr-1" />
                {person.email}
              </Badge>
            )}
          </div>

          {/* Subscribe Button */}
          <Button 
            variant="default" 
            size="lg"
            onClick={() => setShowRemindersModal(true)}
            className="mb-8"
          >
            <Bell className="h-4 w-4 mr-2" />
            Set Up Prayer Reminders
          </Button>
        </div>

        {/* Subscribe Dialog */}
        <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Subscribe to Remember {fullName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={subscription.userEmail}
                      onChange={(e) => setSubscription({...subscription, userEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Reminder Frequency
                    </label>
                    <Select
                      value={subscription.frequency}
                      onValueChange={(value) =>
                        setSubscription({ ...subscription, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Every 3 months</SelectItem>
                        <SelectItem value="annually">Yearly</SelectItem>
                        <SelectItem value="birthday">On Birthday</SelectItem>
                        <SelectItem value="death_anniversary">On Death Anniversary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time of Day Selection */}
                  {(subscription.frequency === "daily" || subscription.frequency === "weekly" || subscription.frequency === "monthly") && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Time of Day
                      </label>
                      <Select
                        value={subscription.timeOfDay}
                        onValueChange={(value) =>
                          setSubscription({ ...subscription, timeOfDay: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose time of day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
                          <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                          <SelectItem value="specific_time">Specific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Specific Time Input */}
                  {subscription.timeOfDay === "specific_time" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Specific Time (24-hour format)
                      </label>
                      <Input
                        type="time"
                        value={subscription.specificTime}
                        onChange={(e) =>
                          setSubscription({ ...subscription, specificTime: e.target.value })
                        }
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Day of Week Selection for Weekly */}
                  {subscription.frequency === "weekly" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Day of Week
                      </label>
                      <Select
                        value={subscription.dayOfWeek}
                        onValueChange={(value) =>
                          setSubscription({ ...subscription, dayOfWeek: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Choose day (default: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })})`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunday">Sunday</SelectItem>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Day of Month Selection for Monthly/Quarterly/Annually */}
                  {(subscription.frequency === "monthly" || subscription.frequency === "quarterly" || subscription.frequency === "annually") && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Day of Month
                      </label>
                      <Select
                        value={subscription.dayOfMonth.toString()}
                        onValueChange={(value) =>
                          setSubscription({ ...subscription, dayOfMonth: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Choose day (default: ${new Date().getDate()})`} />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day === 1 ? "1st" : day === 2 ? "2nd" : day === 3 ? "3rd" : `${day}th`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Notification Methods
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email"
                          checked={subscription.email}
                          onCheckedChange={(checked) =>
                            setSubscription({
                              ...subscription,
                              email: checked as boolean,
                            })
                          }
                        />
                        <label htmlFor="email" className="text-sm">
                          Email notifications
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sms"
                          checked={subscription.sms}
                          onCheckedChange={(checked) =>
                            setSubscription({
                              ...subscription,
                              sms: checked as boolean,
                            })
                          }
                        />
                        <label htmlFor="sms" className="text-sm">
                          SMS notifications
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="push"
                          checked={subscription.push}
                          onCheckedChange={(checked) =>
                            setSubscription({
                              ...subscription,
                              push: checked as boolean,
                            })
                          }
                        />
                        <label htmlFor="push" className="text-sm">
                          Push notifications
                        </label>
                      </div>
                    </div>
                  </div>



                  {/* Subscription Summary */}
                  {subscription.frequency && subscription.userEmail && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Subscription Summary:</strong> You will receive prayer reminders to remember {fullName} by{" "}
                        {[
                          subscription.email && "email",
                          subscription.sms && "SMS", 
                          subscription.push && "push notification"
                        ].filter(Boolean).join(" and ")},{" "}
                        {subscription.frequency === "daily" && "daily"}
                        {subscription.frequency === "weekly" && `weekly${subscription.dayOfWeek ? ` on ${subscription.dayOfWeek.charAt(0).toUpperCase() + subscription.dayOfWeek.slice(1)}s` : ""}`}
                        {subscription.frequency === "monthly" && `monthly${subscription.dayOfMonth ? ` on the ${subscription.dayOfMonth === 1 ? "1st" : subscription.dayOfMonth === 2 ? "2nd" : subscription.dayOfMonth === 3 ? "3rd" : `${subscription.dayOfMonth}th`}` : ""}`}
                        {subscription.frequency === "quarterly" && `every 3 months${subscription.dayOfMonth ? ` on the ${subscription.dayOfMonth === 1 ? "1st" : subscription.dayOfMonth === 2 ? "2nd" : subscription.dayOfMonth === 3 ? "3rd" : `${subscription.dayOfMonth}th`}` : ""}`}
                        {subscription.frequency === "annually" && `annually${subscription.dayOfMonth ? ` on the ${subscription.dayOfMonth === 1 ? "1st" : subscription.dayOfMonth === 2 ? "2nd" : subscription.dayOfMonth === 3 ? "3rd" : `${subscription.dayOfMonth}th`}` : ""}`}
                        {subscription.frequency === "birthday" && `on ${person?.birthday ? new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "their birthday"}`}
                        {subscription.frequency === "death_anniversary" && `on ${person?.dateOfDeath ? new Date(person.dateOfDeath).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "their death anniversary"}`}
                        {subscription.timeOfDay && subscription.frequency !== "birthday" && subscription.frequency !== "death_anniversary" && (
                          <>
                            {" at "}
                            {subscription.timeOfDay === "morning" && "8:00 AM"}
                            {subscription.timeOfDay === "afternoon" && "2:00 PM"}
                            {subscription.timeOfDay === "evening" && "6:00 PM"}
                            {subscription.timeOfDay === "specific_time" && subscription.specificTime && 
                              new Date(`2000-01-01T${subscription.specificTime}`).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true 
                              })
                            }
                          </>
                        )}.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubscribeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (!subscription.userEmail) {
                          toast({
                            title: "Email required",
                            description: "Please enter your email address",
                            variant: "destructive",
                          });
                          return;
                        }

                        if (!subscription.frequency) {
                          toast({
                            title: "Frequency required",
                            description: "Please select a reminder frequency",
                            variant: "destructive",
                          });
                          return;
                        }

                        createSubscriptionMutation.mutate({
                          email: subscription.userEmail,
                          frequency: subscription.frequency,
                          timeOfDay: subscription.timeOfDay || undefined,
                          specificTime: subscription.specificTime || undefined,
                          dayOfWeek: subscription.dayOfWeek || undefined,
                          dayOfMonth: subscription.dayOfMonth || undefined,
                          notificationMethods: {
                            email: subscription.email,
                            sms: subscription.sms,
                            push: subscription.push,
                          },
                        });
                      }}
                      disabled={createSubscriptionMutation.isPending}
                    >
                      {createSubscriptionMutation.isPending ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tributes Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Tributes & Memories
                  <Badge variant="secondary">{Array.isArray(tributes) ? tributes.length : 0}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Tribute Form */}
                <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  <Textarea
                    placeholder={`Share a memory or tribute for ${fullName}...`}
                    value={newTribute.message}
                    onChange={(e) => setNewTribute({ ...newTribute, message: e.target.value })}
                    className="min-h-[100px]"
                  />
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={newTribute.isAnonymous}
                        onCheckedChange={(checked) =>
                          setNewTribute({ ...newTribute, isAnonymous: checked as boolean })
                        }
                      />
                      <label htmlFor="anonymous" className="text-sm">
                        Post anonymously
                      </label>
                    </div>
                    
                    {!newTribute.isAnonymous && (
                      <Input
                        placeholder="Your name"
                        value={newTribute.authorName}
                        onChange={(e) => setNewTribute({ ...newTribute, authorName: e.target.value })}
                        className="max-w-xs"
                      />
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSubmitTribute}
                    disabled={createTributeMutation.isPending}
                  >
                    {createTributeMutation.isPending ? "Posting..." : "Post Tribute"}
                  </Button>
                </div>

                {/* Tributes List */}
                <div className="space-y-4">
                  {tributesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading tributes...</p>
                    </div>
                  ) : Array.isArray(tributes) && tributes.length > 0 ? (
                    tributes.map((tribute: Tribute) => (
                      <div key={tribute.id} className="border-l-4 border-primary pl-4 py-2">
                        <p className="text-foreground mb-2">{tribute.message}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>— {tribute.authorName}</span>
                          <span>{new Date(tribute.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No tributes yet. Be the first to share a memory.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Memorial Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Memorial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(person.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                    {person.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="font-medium">Tributes:</span> {Array.isArray(tributes) ? tributes.length : 0}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Subscribers:</span> 0
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SetupRemindersModal
        isOpen={showRemindersModal}
        onClose={() => setShowRemindersModal(false)}
        initialSubjectName={person?.name || ""}
      />
    </div>
  );
}