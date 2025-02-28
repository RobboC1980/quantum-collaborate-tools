import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ROUTES from "@/constants/routes";

// List of routes that exist in the application but are not yet implemented
const UNDER_CONSTRUCTION_ROUTES = [
  ROUTES.DASHBOARD.SETTINGS,
  ROUTES.DASHBOARD.REPORTS
];

const NotFound = () => {
  const location = useLocation();
  const [isUnderConstruction, setIsUnderConstruction] = useState(false);
  const currentPath = location.pathname;

  useEffect(() => {
    // Check if the current path is in the list of under construction routes
    const isUnderConstruction = UNDER_CONSTRUCTION_ROUTES.includes(currentPath);
    setIsUnderConstruction(isUnderConstruction);

    // Log the error with appropriate context
    console.error(
      isUnderConstruction 
        ? `404 Error: User attempted to access route that's under construction: ${currentPath}`
        : `404 Error: User attempted to access non-existent route: ${currentPath}`
    );

    // Optional: Send error to monitoring service
    // Example: sendToErrorMonitoring({ type: '404', path: currentPath, isUnderConstruction });
  }, [currentPath]);

  // Determine where to redirect the user based on current path
  const getRedirectPath = () => {
    if (currentPath.includes('/dashboard')) {
      return ROUTES.DASHBOARD.HOME;
    }
    if (currentPath.includes('/admin')) {
      return ROUTES.ADMIN.HOME;
    }
    return ROUTES.PUBLIC.HOME;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            {isUnderConstruction ? (
              <Construction className="h-8 w-8 text-amber-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <CardTitle className="text-2xl">
                {isUnderConstruction ? "Under Construction" : "Page Not Found"}
              </CardTitle>
              <CardDescription>
                {isUnderConstruction 
                  ? "This feature is coming soon"
                  : "The page you're looking for doesn't exist"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-gray-100 rounded-md overflow-x-auto">
              <code className="text-sm text-gray-800">{currentPath}</code>
            </div>
            
            <p className="text-gray-600">
              {isUnderConstruction 
                ? "We're working hard to implement this feature. Please check back later."
                : "The page you were trying to view does not exist. It might have been moved, deleted, or you might have mistyped the URL."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link to={getRedirectPath()}>
              Return to {currentPath.includes('/admin') ? 'Admin' : 'Dashboard'}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;
