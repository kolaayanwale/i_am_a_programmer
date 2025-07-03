import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Calendar, Clock, Mail, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertSubscriptionSchema } from "@shared/schema";
import CreateMemorialModal from "./create-memorial-modal";

const setupRemindersSchema = z.object({
  subjectFirstName: z.string().min(1, "First name is required"),
  subjectLastName: z.string().min(1, "Last name is required"),
  subjectGender: z.enum(["male", "female"]).default("male"),
  subjectDateOfBirth: z.string().optional(),
  subjectDateOfDeath: z.string().optional(),
  subscriberEmail: z.string().email("Valid email required"),
  subscriberPhone: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'birthday', 'death_anniversary']),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'specific_time']).optional(),
  specificTime: z.string().optional(),
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.number().optional(),
  channels: z.array(z.string()).min(1, "Select at least one channel"),
  notificationTypeId: z.number().default(1),
}).refine((data) => {
  // Only validate specificTime format if timeOfDay is 'specific_time' and specificTime is provided
  if (data.timeOfDay === 'specific_time' && data.specificTime) {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.specificTime);
  }
  return true;
}, {
  message: "Specific time must be in HH:MM format",
  path: ["specificTime"],
});

type SetupRemindersForm = z.infer<typeof setupRemindersSchema>;

interface SetupRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectName?: string;
}

export default function SetupRemindersModal({ 
  isOpen, 
  onClose, 
  initialSubjectName = "" 
}: SetupRemindersModalProps) {
  const [showMemorialModal, setShowMemorialModal] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();



  const form = useForm<SetupRemindersForm>({
    resolver: zodResolver(setupRemindersSchema),
    defaultValues: {
      subjectFirstName: initialSubjectName ? initialSubjectName.split(' ')[0] || "" : "",
      subjectLastName: initialSubjectName ? initialSubjectName.split(' ').slice(1).join(' ') || "" : "",
      subjectGender: "male",
      subjectDateOfBirth: "",
      subjectDateOfDeath: "",
      notificationTypeId: 1,
      subscriberEmail: "",
      subscriberPhone: "",
      frequency: "weekly",
      timeOfDay: "morning",
      specificTime: "",
      dayOfWeek: undefined,
      dayOfMonth: undefined,
      channels: ["email"],
    },
  });

  // Update form when initialSubjectName changes
  useEffect(() => {
    if (initialSubjectName) {
      const nameParts = initialSubjectName.split(' ');
      form.setValue("subjectFirstName", nameParts[0] || "");
      form.setValue("subjectLastName", nameParts.slice(1).join(' ') || "");
    }
  }, [initialSubjectName, form]);

  const watchedValues = form.watch();
  const hasDateOfBirth = !!watchedValues.subjectDateOfBirth;
  const hasDateOfDeath = !!watchedValues.subjectDateOfDeath;

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: SetupRemindersForm) => {
      const requestData = {
        ...data,
        subjectName: `${data.subjectFirstName} ${data.subjectLastName}`.trim(),
      };
      return await apiRequest("POST", "/api/subscriptions", requestData);
    },
    onSuccess: (response) => {
      toast({
        title: "Subscription created successfully",
        description: "You'll receive prayer reminders as scheduled.",
      });
      setSubscriberEmail(form.getValues("subscriberEmail"));
      form.reset();
      onClose();
      setShowMemorialModal(true);
    },
    onError: (error) => {
      console.error("Subscription creation error:", error);
      toast({
        title: "Failed to create subscription",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SetupRemindersForm) => {
    createSubscriptionMutation.mutate(data);
  };

  const handleMemorialCreation = () => {
    setShowMemorialModal(true);
    onClose();
  };

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annually", label: "Annually" },
    ...(hasDateOfBirth ? [{ value: "birthday", label: "Birthday" }] : []),
    ...(hasDateOfDeath ? [{ value: "death_anniversary", label: "Death Anniversary" }] : []),
  ];




  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Set Up Prayer Reminders
            </DialogTitle>
            <DialogDescription>
              Configure when and how you'd like to receive prayer reminders for your loved one.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Subject Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Person Information</CardTitle>
                  <CardDescription>
                    Tell us about the person you'd like to remember in prayers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subjectFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subjectLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Gender Toggle */}
                  <FormField
                    control={form.control}
                    name="subjectGender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="subjectGender">Gender</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2" role="radiogroup" aria-labelledby="subjectGender-label">
                            <input
                              type="hidden"
                              id="subjectGender"
                              name="subjectGender"
                              value={field.value}
                            />
                            <Button
                              type="button"
                              variant={field.value === "male" ? "default" : "outline"}
                              onClick={() => field.onChange("male")}
                              className="flex-1"
                              role="radio"
                              aria-checked={field.value === "male"}
                            >
                              Male
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "female" ? "default" : "outline"}
                              onClick={() => field.onChange("female")}
                              className="flex-1"
                              role="radio"
                              aria-checked={field.value === "female"}
                            >
                              Female
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subjectDateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subjectDateOfDeath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Death</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Contact Information</CardTitle>
                  <CardDescription>
                    We'll send prayer reminders to these contact methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subscriberEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriberPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Reminder Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Reminder Schedule</CardTitle>
                  <CardDescription>
                    Choose when and how often you'd like to receive prayer reminders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {frequencyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="timeOfDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Day</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="morning">Morning (9:00 AM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
                            <SelectItem value="evening">Evening (7:00 PM)</SelectItem>
                            <SelectItem value="specific_time">Specific Time</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedValues.timeOfDay === "specific_time" && (
                    <FormField
                      control={form.control}
                      name="specificTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="channels"
                    render={() => (
                      <FormItem>
                        <FormLabel>Notification Methods *</FormLabel>
                        <div className="space-y-2">
                          <FormField
                            control={form.control}
                            name="channels"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("email")}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, "email"]);
                                      } else {
                                        field.onChange(current.filter(v => v !== "email"));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <FormLabel>Email</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="channels"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes("sms")}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, "sms"]);
                                      } else {
                                        field.onChange(current.filter(v => v !== "sms"));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="h-4 w-4" />
                                  <FormLabel>SMS (Coming Soon)</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createSubscriptionMutation.isPending}

                >
                  {createSubscriptionMutation.isPending ? "Setting Up..." : "Subscribe to Reminders"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CreateMemorialModal
        isOpen={showMemorialModal}
        onClose={() => {
          setShowMemorialModal(false);
          onClose();
        }}
        subscriberEmail={subscriberEmail}
        subjectName={form.getValues("subjectName")}
      />
    </>
  );
}