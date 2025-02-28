import React from "react";
import { Construction, ChartBar, BarChart, PieChart, LineChart } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Reports</h1>
        </div>

        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <Construction className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Under Construction</AlertTitle>
          <AlertDescription className="text-amber-700">
            This page is currently under development. The reporting functionality 
            will be available in a future update.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="project" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="project">Project</TabsTrigger>
            <TabsTrigger value="sprint">Sprint</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="project">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ReportPlaceholder 
                title="Project Progress" 
                description="Overview of project completion status"
                icon={<BarChart className="h-10 w-10 text-blue-500 opacity-80" />}
              />
              <ReportPlaceholder 
                title="Task Distribution" 
                description="Breakdown of tasks by status and assignee"
                icon={<PieChart className="h-10 w-10 text-green-500 opacity-80" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="sprint">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ReportPlaceholder 
                title="Sprint Velocity" 
                description="Team velocity over time across sprints"
                icon={<LineChart className="h-10 w-10 text-purple-500 opacity-80" />}
              />
              <ReportPlaceholder 
                title="Sprint Burndown" 
                description="Progress tracking for the current sprint"
                icon={<ChartBar className="h-10 w-10 text-orange-500 opacity-80" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ReportPlaceholder 
                title="Team Workload" 
                description="Current workload distribution across team members"
                icon={<BarChart className="h-10 w-10 text-indigo-500 opacity-80" />}
              />
              <ReportPlaceholder 
                title="Team Performance" 
                description="Productivity and efficiency metrics"
                icon={<LineChart className="h-10 w-10 text-teal-500 opacity-80" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
                <CardDescription>
                  Create and view custom reports with specific metrics and filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-md bg-gray-50">
                  <Construction className="h-8 w-8 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Custom Report Builder</h3>
                  <p className="text-gray-500 text-center mb-4">
                    The custom report builder is coming soon. You'll be able to create reports 
                    with your own metrics and filters.
                  </p>
                  <div className="h-8 w-32 bg-gray-300 rounded" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

type ReportPlaceholderProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const ReportPlaceholder: React.FC<ReportPlaceholderProps> = ({ 
  title, 
  description,
  icon
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-md bg-gray-50">
          {icon}
          <div className="mt-4 w-3/4 h-32 bg-gray-200 rounded-md flex items-center justify-center">
            <p className="text-gray-400 text-sm">Chart visualization coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Reports; 