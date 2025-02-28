
import React, { useState } from 'react';
import { useDebug } from '@/hooks/useDebug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bug, CheckCircle, Terminal, XCircle } from 'lucide-react';

interface BuildError {
  id: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stack?: string;
  timestamp: Date;
}

const BuildDebugger: React.FC = () => {
  const {
    startDebugging,
    logAttempt,
    updateOutcome,
    logError,
    resolveIssue,
    DebugWrapper,
    openDebugPanel
  } = useDebug('BuildDebugger');
  
  const { toast } = useToast();
  const [buildErrors, setBuildErrors] = useState<BuildError[]>([]);
  const [currentError, setCurrentError] = useState<BuildError | null>(null);
  const [solution, setSolution] = useState('');
  
  // Simulate a build error
  const simulateBuildError = () => {
    const errorTypes = [
      'Module not found',
      'Syntax error',
      'Type error',
      'Import error',
      'Dependency conflict',
      'Memory limit exceeded',
      'Webpack compilation failed',
      'ESLint error',
      'Runtime error',
      'Invalid hook call'
    ];
    
    const files = [
      'src/components/App.tsx',
      'src/utils/helpers.ts',
      'src/context/AuthContext.tsx',
      'src/hooks/useData.ts',
      'src/pages/Dashboard.tsx'
    ];
    
    const randomError = {
      id: `error-${Date.now()}`,
      message: `${errorTypes[Math.floor(Math.random() * errorTypes.length)]}: Unexpected token`,
      file: files[Math.floor(Math.random() * files.length)],
      line: Math.floor(Math.random() * 100) + 1,
      column: Math.floor(Math.random() * 80) + 1,
      stack: `Error: Unexpected token\n    at Module.${files[Math.floor(Math.random() * files.length)]}:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 80) + 1}`,
      timestamp: new Date()
    };
    
    setBuildErrors(prev => [...prev, randomError]);
    setCurrentError(randomError);
    
    toast({
      title: "Build Error Detected",
      description: randomError.message,
      variant: "destructive",
    });
    
    // Start debugging session automatically
    startDebugging(`Build error: ${randomError.message} in ${randomError.file}`);
  };
  
  const handleAttemptFix = () => {
    if (!currentError || !solution.trim()) return;
    
    logAttempt(solution, `Attempted fix for ${currentError.message} in ${currentError.file}`);
    
    // Simulate success/failure (random for demonstration)
    const isSuccessful = Math.random() > 0.3;
    
    if (isSuccessful) {
      updateOutcome('success', 'Build succeeded after fix');
      resolveIssue('Error fixed successfully');
      
      // Update our error list
      setBuildErrors(prev => 
        prev.filter(error => error.id !== currentError.id)
      );
      
      toast({
        title: "Fix Applied Successfully",
        description: `The build error has been resolved.`,
      });
      
      setCurrentError(null);
      setSolution('');
    } else {
      updateOutcome('failure', 'Fix attempt failed, error persists');
      logError(`Fix attempt failed: ${solution}`);
      
      toast({
        title: "Fix Attempt Failed",
        description: "The error persists. Try another approach.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DebugWrapper showControls>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Build Debugger</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={openDebugPanel}
            >
              <Terminal size={16} />
              Debug Panel
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
              onClick={simulateBuildError}
            >
              <Bug size={16} />
              Simulate Error
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">Build Errors</h3>
            <Badge variant="outline" className={buildErrors.length > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}>
              {buildErrors.length > 0 ? `${buildErrors.length} Errors` : "No Errors"}
            </Badge>
          </div>
          
          {buildErrors.length === 0 ? (
            <div className="border rounded-md p-8 flex items-center justify-center bg-green-50">
              <div className="text-center">
                <CheckCircle size={40} className="mx-auto mb-2 text-green-500" />
                <p className="text-lg font-medium text-green-700">Build Successful</p>
                <p className="text-sm text-green-600">No errors detected in your application</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Error</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildErrors.map(error => (
                    <TableRow key={error.id} className={currentError?.id === error.id ? "bg-amber-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                          <span className="text-sm">{error.message}</span>
                        </div>
                      </TableCell>
                      <TableCell>{error.file}</TableCell>
                      <TableCell>Line {error.line}, Col {error.column}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Error Details</DialogTitle>
                              <DialogDescription>
                                Full information about the build error
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-4">
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Message</h4>
                                <p className="text-sm">{error.message}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Location</h4>
                                <p className="text-sm">{error.file}:{error.line}:{error.column}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Stack Trace</h4>
                                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
                                  {error.stack}
                                </pre>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold mb-1">Timestamp</h4>
                                <p className="text-sm">{error.timestamp.toLocaleString()}</p>
                              </div>
                              <Button
                                className="w-full mt-2"
                                onClick={() => setCurrentError(error)}
                              >
                                Debug This Error
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            
              {currentError && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Debugging: {currentError.message}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Proposed Solution
                      </label>
                      <Textarea
                        placeholder="Describe your fix for this error..."
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleAttemptFix}
                      disabled={!solution.trim()}
                    >
                      Apply Fix Attempt
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DebugWrapper>
  );
};

export default BuildDebugger;
