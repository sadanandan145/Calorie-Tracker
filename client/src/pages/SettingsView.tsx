import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, Save } from "lucide-react";
import { Profile } from "@shared/schema";

export default function SettingsView() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<Profile>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("profile", JSON.stringify(profile));
      setTimeout(() => setIsSaving(false), 300);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <header className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/trends")}
          className="rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
            Profile
          </p>
        </div>

        <div className="w-10" />
      </header>

      <div className="space-y-6 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Height (cm)
              </label>
              <Input
                type="number"
                placeholder="170"
                value={profile.height || ""}
                onChange={(e) => setProfile({ ...profile, height: e.target.value ? Number(e.target.value) : undefined })}
                data-testid="input-profile-height"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for BMI calculation and health assessments
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Username (optional)
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={profile.username || ""}
                onChange={(e) => setProfile({ ...profile, username: e.target.value || undefined })}
                data-testid="input-profile-username"
              />
            </div>

            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gap-2"
              data-testid="button-save-profile"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Multi-user authentication coming soon
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation("/login")}
              data-testid="button-login-page"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
