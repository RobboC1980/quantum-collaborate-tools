import React from "react";
import { Construction } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <Construction className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Under Construction</AlertTitle>
          <AlertDescription className="text-amber-700">
            This page is currently under development. The settings functionality 
            will be available in a future update.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <SettingsPlaceholder 
              title="Account Settings" 
              description="Manage your account settings and profile information."
              items={[
                "Update profile information",
                "Change email address",
                "Manage account preferences",
                "Link external accounts"
              ]}
            />
          </TabsContent>

          <TabsContent value="appearance">
            <SettingsPlaceholder 
              title="Appearance Settings" 
              description="Customize the appearance of the application."
              items={[
                "Theme selection",
                "Color schemes",
                "Font size and type",
                "Layout options"
              ]}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <SettingsPlaceholder 
              title="Notification Settings" 
              description="Manage how and when you receive notifications."
              items={[
                "Email notifications",
                "Browser notifications",
                "Notification frequency",
                "Mute specific notifications"
              ]}
            />
          </TabsContent>

          <TabsContent value="security">
            <SettingsPlaceholder 
              title="Security Settings" 
              description="Manage your security settings and preferences."
              items={[
                "Change password",
                "Two-factor authentication",
                "Session management",
                "Login history"
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

type SettingsPlaceholderProps = {
  title: string;
  description: string;
  items: string[];
};

const SettingsPlaceholder: React.FC<SettingsPlaceholderProps> = ({ 
  title, 
  description,
  items
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 flex items-center"
            >
              <div className="h-4 w-4 mr-3 rounded-full bg-gray-300" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-300 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-20 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings; 