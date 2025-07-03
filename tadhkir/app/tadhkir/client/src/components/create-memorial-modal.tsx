import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, Shield, Users, Clock } from "lucide-react";

interface CreateMemorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriberEmail?: string;
  subjectName?: string;
}

export default function CreateMemorialModal({ 
  isOpen, 
  onClose, 
  subscriberEmail = "",
  subjectName = "" 
}: CreateMemorialModalProps) {
  const [email, setEmail] = useState(subscriberEmail);
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  const handleSendMagicLink = () => {
    // TODO: Implement magic link functionality
    console.log("Sending magic link to:", email);
    // For now, just close the modal
    onClose();
  };

  const handlePasskey = () => {
    // TODO: Implement passkey authentication
    console.log("Using passkey authentication");
    onClose();
  };

  const handleFederatedSignIn = (provider: string) => {
    // TODO: Implement federated sign in
    console.log("Signing in with:", provider);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Memorial Page</DialogTitle>
          <DialogDescription>
            Create a beautiful memorial page to honor your loved one's memory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Memorial Page Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Memorial Pages
              </CardTitle>
              <CardDescription className="text-sm">
                Create a beautiful, lasting tribute that honors {subjectName}'s memory and allows others to share stories and remembrances.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>Share memories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span>Private & secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>Always accessible</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-muted-foreground" />
                  <span>Honor legacy</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Authentication disabled message */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Memorial page creation is currently disabled for development.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Authentication Options (Hidden for now) */}
          {false && (
            <>
              {!showAuthOptions ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => setShowAuthOptions(true)}
                    className="w-full"
                    disabled={!email}
                  >
                    Continue
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    Sign in to create your memorial page
                  </div>

                  {/* Magic Link */}
                  <Button 
                    onClick={handleSendMagicLink}
                    variant="outline"
                    className="w-full"
                  >
                    Send Magic Link to {email}
                  </Button>

                  {/* Passkey */}
                  <Button 
                    onClick={handlePasskey}
                    variant="outline"
                    className="w-full"
                  >
                    Use Passkey
                  </Button>

                  <Separator />

                  {/* Federated Sign In */}
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleFederatedSignIn("google")}
                      variant="outline"
                      className="w-full"
                    >
                      Continue with Google
                    </Button>
                    <Button 
                      onClick={() => handleFederatedSignIn("apple")}
                      variant="outline"
                      className="w-full"
                    >
                      Continue with Apple
                    </Button>
                    <Button 
                      onClick={() => handleFederatedSignIn("facebook")}
                      variant="outline"
                      className="w-full"
                    >
                      Continue with Facebook
                    </Button>
                  </div>

                  <Button 
                    onClick={() => setShowAuthOptions(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    Back
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
