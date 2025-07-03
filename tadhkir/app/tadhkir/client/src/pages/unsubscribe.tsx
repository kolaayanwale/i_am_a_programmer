import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { formatNextReminder } from "@/lib/dateUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Trash2, Mail, Calendar, Clock } from "lucide-react";
import Navigation from "@/components/navigation";

interface Subscription {
  id: number;
  subjectName: string;
  subjectGender: string;
  subscriberEmail: string;
  frequency: string;
  timeOfDay?: string;
  specificTime?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  channels: string[];
  isActive: boolean;
  nextNotificationDate: string;
  createdAt: string;
}

export default function Unsubscribe() {
  const [location] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  // Get email from URL path or query parameters
  const [email, setEmail] = useState<string | null>(null);
  
  useEffect(() => {
    // First try path parameter, then query parameter
    let emailParam = params.email;
    if (!emailParam) {
      const urlParams = new URLSearchParams(window.location.search);
      emailParam = urlParams.get('email');
    }
    if (emailParam) {
      emailParam = decodeURIComponent(emailParam);
    }
    setEmail(emailParam);
    console.log('Email extracted from URL:', emailParam);
  }, [location, params]);

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/by-email', email],
    queryFn: () => fetch(`/api/subscriptions/by-email/${email}`).then(res => res.json()),
    enabled: !!email,
  });

  const toggleSubscriptionMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      console.log(`Attempting to update subscription ${id} to ${isActive ? 'active' : 'inactive'}`);
      return await apiRequest("PATCH", `/api/subscriptions/${id}`, { isActive });
    },
    onSuccess: (data, variables) => {
      console.log(`Successfully updated subscription ${variables.id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/by-email', email] });
      toast({
        title: "Updated",
        description: "Subscription status updated successfully.",
      });
    },
    onError: (error, variables) => {
      console.error(`Failed to update subscription ${variables.id}:`, error);
      toast({
        title: "Error",
        description: "Failed to update subscription status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Attempting to delete subscription ${id}`);
      return await apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: (data, variables) => {
      console.log(`Successfully deleted subscription ${variables}`);
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/by-email', email] });
      toast({
        title: "Deleted",
        description: "Subscription deleted successfully.",
      });
    },
    onError: (error, variables) => {
      console.error(`Failed to delete subscription ${variables}:`, error);
      toast({
        title: "Error",
        description: "Failed to delete subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unsubscribeAllMutation = useMutation({
    mutationFn: async () => {
      console.log(`Attempting to unsubscribe all for email: ${email}`);
      return await apiRequest("POST", "/api/subscriptions/unsubscribe-all", { email });
    },
    onSuccess: () => {
      console.log(`Successfully unsubscribed all for email: ${email}`);
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/by-email', email] });
      toast({
        title: "Unsubscribed",
        description: "All subscriptions have been deactivated.",
      });
    },
    onError: (error) => {
      console.error(`Failed to unsubscribe all for email ${email}:`, error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe from all reminders. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatFrequency = (subscription: Subscription) => {
    const { frequency, timeOfDay, specificTime, dayOfWeek, dayOfMonth } = subscription;
    
    let freqText = frequency;
    if (dayOfWeek !== null && (frequency === 'weekly' || frequency === 'monthly' || frequency === 'quarterly' || frequency === 'annual')) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      freqText += ` on ${days[dayOfWeek]}`;
    }
    if (dayOfMonth && (frequency === 'monthly' || frequency === 'quarterly' || frequency === 'annual')) {
      freqText += ` on the ${dayOfMonth}${dayOfMonth === 1 ? 'st' : dayOfMonth === 2 ? 'nd' : dayOfMonth === 3 ? 'rd' : 'th'}`;
    }
    
    if (specificTime) {
      freqText += ` at ${specificTime}`;
    } else if (timeOfDay) {
      freqText += ` in the ${timeOfDay}`;
    }
    
    return freqText;
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This unsubscribe link is missing the email parameter.
              <br />
              <small>Debug info: location="{location}", href="{typeof window !== 'undefined' ? window.location.href : 'N/A'}"</small>
            </CardDescription>
          </CardHeader>
        </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Loading your subscription preferences.
            </CardDescription>
          </CardHeader>
        </Card>
        </div>
      </div>
    );
  }

  const activeSubscriptions = subscriptions?.filter((sub: Subscription) => sub.isActive) || [];
  const inactiveSubscriptions = subscriptions?.filter((sub: Subscription) => !sub.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Prayer Reminders</h1>
          <p className="text-gray-600">
            Manage your subscription preferences for <strong>{email}</strong>
          </p>
        </div>

        {subscriptions && subscriptions.length > 0 ? (
          <div className="space-y-6">
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Active Prayer Reminders ({activeSubscriptions.length})
                  </CardTitle>
                  <CardDescription>
                    These reminders are currently active and will be sent according to your schedule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeSubscriptions.map((subscription: Subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{subscription.subjectName}</h3>
                          <Badge variant="secondary">
                            {subscription.subjectGender}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatFrequency(subscription)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Next reminder: {formatNextReminder(subscription.nextNotificationDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label htmlFor={`toggle-${subscription.id}`} className="text-sm">
                            Active
                          </label>
                          <Switch
                            id={`toggle-${subscription.id}`}
                            checked={subscription.isActive}
                            onCheckedChange={(checked) =>
                              toggleSubscriptionMutation.mutate({
                                id: subscription.id,
                                isActive: checked,
                              })
                            }
                            disabled={toggleSubscriptionMutation.isPending}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubscriptionMutation.mutate(subscription.id)}
                          disabled={deleteSubscriptionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {activeSubscriptions.length > 1 && (
                    <>
                      <Separator />
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          onClick={() => unsubscribeAllMutation.mutate()}
                          disabled={unsubscribeAllMutation.isPending}
                        >
                          Unsubscribe from All Reminders
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Inactive Subscriptions */}
            {inactiveSubscriptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-600">
                    Inactive Reminders ({inactiveSubscriptions.length})
                  </CardTitle>
                  <CardDescription>
                    These reminders are paused. You can reactivate them at any time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inactiveSubscriptions.map((subscription: Subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-600">{subscription.subjectName}</h3>
                          <Badge variant="secondary">
                            {subscription.subjectGender}
                          </Badge>
                          <Badge variant="outline">
                            {formatFrequency(subscription)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Paused since: {new Date(subscription.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label htmlFor={`toggle-${subscription.id}`} className="text-sm">
                            Active
                          </label>
                          <Switch
                            id={`toggle-${subscription.id}`}
                            checked={subscription.isActive}
                            onCheckedChange={(checked) =>
                              toggleSubscriptionMutation.mutate({
                                id: subscription.id,
                                isActive: checked,
                              })
                            }
                            disabled={toggleSubscriptionMutation.isPending}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubscriptionMutation.mutate(subscription.id)}
                          disabled={deleteSubscriptionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Subscriptions Found</CardTitle>
              <CardDescription>
                We couldn't find any prayer reminder subscriptions for {email}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/'}>
                Set Up Prayer Reminders
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}