import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertSubscriptionSchema } from "@shared/schema";
import CreateMemorialModal from "./create-memorial-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Users, Calendar, Settings as SettingsIcon, Cake } from "lucide-react";

const addSubscriptionSchema = z.object({
  notificationTypeId: z.number().min(1, "Notification type is required"),
  frequency: z.string().min(1, "Frequency is required"),
  channels: z.array(z.string()).min(1, "At least one channel is required"),
});

const addSubscriptionSchema = insertSubscriptionSchema.pick({
  subjectName: true,
  subjectGender: true,
  subjectDateOfBirth: true,
  subjectDateOfDeath: true,
  subscriberEmail: true,
  subscriberPhone: true,
  frequency: true,
  timeOfDay: true,
  dayOfWeek: true,
  dayOfMonth: true,
  monthOfYear: true,
  quarterOfYear: true,
}).extend({
  notificationTypeId: z.number().default(1),
});

type AddSubscriptionForm = z.infer<typeof addSubscriptionSchema>;

interface SubjectDetailModalProps {
  subject: {
    id: number;
    name: string;
    relationship?: string;
    profileImageUrl?: string;
    status: string;
    email?: string;
    phone?: string;
    birthday?: string;
    dateOfDeath?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function SubjectDetailModal({ subject, isOpen, onClose }: SubjectDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: subscriptions } = useQuery({
    queryKey: ["/api/subjects", subject.id, "subscriptions"],
    enabled: isOpen,
  });

  const { data: notificationTypes } = useQuery({
    queryKey: ["/api/notification-types"],
    enabled: isOpen,
  });

  const form = useForm<AddSubscriptionForm>({
    resolver: zodResolver(addSubscriptionSchema),
    defaultValues: {
      notificationTypeId: 0,
      frequency: "",
      channels: [],
    },
  });

  const addSubscriptionMutation = useMutation({
    mutationFn: async (data: AddSubscriptionForm) => {
      return await apiRequest("POST", "/api/subscriptions", {
        ...data,
        subjectId: subject.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", subject.id, "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Subscription added successfully",
      });
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add subscription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddSubscriptionForm) => {
    addSubscriptionMutation.mutate(data);
  };

  const getNotificationTypeIcon = (typeName: string) => {
    switch (typeName?.toLowerCase()) {
      case 'birthday':
        return <Cake className="text-amber-600 text-sm" />;
      case 'weekly':
      case 'monthly':
        return <Calendar className="text-primary text-sm" />;
      default:
        return <Calendar className="text-primary text-sm" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {subject.profileImageUrl ? (
                <img 
                  src={subject.profileImageUrl} 
                  alt={subject.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">{subject.name}</DialogTitle>
              <DialogDescription>{subject.relationship || 'No relationship set'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-medium mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                  <p className="text-foreground">{subject.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                  <p className="text-foreground">{subject.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Birthday</label>
                  <p className="text-foreground">
                    {subject.birthday 
                      ? new Date(subject.birthday).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                  <Badge variant={subject.status === 'active' ? 'default' : 'secondary'}>
                    {subject.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Active Subscriptions Preview */}
            <div>
              <h4 className="text-lg font-medium mb-4">Active Subscriptions</h4>
              <div className="space-y-3">
                {subscriptions && subscriptions.length > 0 ? (
                  subscriptions.slice(0, 3).map((subscription: any) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {getNotificationTypeIcon(subscription.notificationType?.name)}
                        </div>
                        <div>
                          <p className="font-medium">{subscription.notificationType?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.frequency} • {subscription.channels?.join(', ')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                        {subscription.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p>No subscriptions yet</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            {/* Existing Subscriptions */}
            <div>
              <h4 className="text-lg font-medium mb-4">All Subscriptions</h4>
              <div className="space-y-3">
                {subscriptions && subscriptions.length > 0 ? (
                  subscriptions.map((subscription: any) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {getNotificationTypeIcon(subscription.notificationType?.name)}
                        </div>
                        <div>
                          <p className="font-medium">{subscription.notificationType?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.frequency} • {subscription.channels?.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                          {subscription.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p>No subscriptions yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Add New Subscription */}
            <div>
              <h4 className="text-lg font-medium mb-4">Add New Subscription</h4>
              <div className="border border-border rounded-lg p-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="notificationTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification Type</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {notificationTypes?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="channels"
                      render={() => (
                        <FormItem>
                          <FormLabel>Notification Channels</FormLabel>
                          <div className="flex space-x-4">
                            {['email', 'sms', 'push'].map((channel) => (
                              <FormField
                                key={channel}
                                control={form.control}
                                name="channels"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(channel)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, channel])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== channel
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={addSubscriptionMutation.isPending}
                      >
                        {addSubscriptionMutation.isPending ? "Adding..." : "Add Subscription"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p>Notification history coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
