
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { debugWorkflow } from '@/utils/debugWorkflow';

interface DebugPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  isOpen = false,
  onClose
}) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [issue, setIssue] = useState('');
  const [solution, setSolution] = useState('');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'success' | 'failure' | 'partial' | 'unknown'>('unknown');
  
  useEffect(() => {
    if (isOpen) {
      refreshSessions();
    }
  }, [isOpen]);
  
  const refreshSessions = () => {
    const allSessions = debugWorkflow.getAllSessions();
    setSessions(
      allSessions.map(session => ({
        ...session,
        isActive: session.id === activeSessionId
      }))
    );
  };
  
  const handleStartSession = () => {
    if (!issue.trim()) return;
    const sessionId = debugWorkflow.startSession(issue);
    setActiveSessionId(sessionId);
    refreshSessions();
    setIssue('');
  };
  
  const handleLogAttempt = () => {
    if (!activeSessionId || !solution.trim()) return;
    debugWorkflow.logAttempt(activeSessionId, solution, notes);
    refreshSessions();
    setSolution('');
    setNotes('');
  };
  
  const handleUpdateOutcome = () => {
    if (!activeSessionId) return;
    debugWorkflow.updateOutcome(activeSessionId, outcome, notes);
    refreshSessions();
    setOutcome('unknown');
    setNotes('');
  };
  
  const handleResolveSession = () => {
    if (!activeSessionId) return;
    debugWorkflow.resolveSession(activeSessionId, notes);
    refreshSessions();
    setActiveSessionId(null);
    setNotes('');
  };
  
  const getOutcomeIcon = (outcomeValue: string) => {
    switch (outcomeValue) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <Card className="w-[90%] max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Debug Workflow Panel</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>X</Button>
          </div>
          <CardDescription>
            Track and manage debug sessions with up to 5 attempts per issue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start new session */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-md">New Debug Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">Issue Description</label>
                    <Textarea 
                      placeholder="Describe the issue you're debugging..."
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleStartSession}
                    disabled={!issue.trim()}
                  >
                    Start Debug Session
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Active session actions */}
            <Card className={!activeSessionId ? 'opacity-50' : ''}>
              <CardHeader className="py-3">
                <CardTitle className="text-md">
                  {activeSessionId ? 'Active Session' : 'No Active Session'}
                </CardTitle>
                {activeSessionId && (
                  <CardDescription className="text-xs font-mono">
                    {activeSessionId}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">Solution Attempt</label>
                    <Textarea 
                      placeholder="Describe your solution attempt..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      disabled={!activeSessionId}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea 
                      placeholder="Additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={!activeSessionId}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleLogAttempt}
                      disabled={!activeSessionId || !solution.trim()}
                    >
                      Log Attempt
                    </Button>
                    <Select
                      value={outcome}
                      onValueChange={(value) => 
                        setOutcome(value as 'success' | 'failure' | 'partial' | 'unknown')
                      }
                      disabled={!activeSessionId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failure">Failure</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleUpdateOutcome}
                      disabled={!activeSessionId}
                      variant="outline"
                    >
                      Update Outcome
                    </Button>
                    <Button
                      onClick={handleResolveSession}
                      disabled={!activeSessionId}
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      Resolve Issue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Session list */}
          <Card>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md">Debug Sessions</CardTitle>
                <Button variant="outline" size="sm" onClick={refreshSessions}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No debug sessions found
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {sessions.map((session) => (
                    <AccordionItem 
                      key={session.id} 
                      value={session.id}
                      className={session.isActive ? 'border-l-4 border-l-blue-500 pl-2' : ''}
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between w-full pr-4 items-center">
                          <div className="text-left">
                            <div className="font-medium">
                              {session.issue.length > 50 
                                ? `${session.issue.substring(0, 50)}...` 
                                : session.issue}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(session.startTime).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={session.resolved ? "outline" : "default"}
                              className={
                                session.resolved 
                                  ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }
                            >
                              {session.resolved ? 'Resolved' : 'Active'}
                            </Badge>
                            <Badge variant="outline">
                              {session.attempts.length} / 5 attempts
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          <div>
                            <h4 className="text-sm font-semibold">Issue:</h4>
                            <p className="text-sm">{session.issue}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Attempts:</h4>
                            {session.attempts.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No attempts logged</p>
                            ) : (
                              <div className="space-y-2">
                                {session.attempts.map((attempt: any) => (
                                  <div 
                                    key={attempt.id} 
                                    className="border rounded p-3 text-sm"
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <div className="font-medium">
                                        Attempt #{attempt.id}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {getOutcomeIcon(attempt.outcome)}
                                        <span className="capitalize text-xs">
                                          {attempt.outcome}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <strong>Solution:</strong> {attempt.solution}
                                    </div>
                                    {attempt.notes && (
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        <strong>Notes:</strong> {attempt.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {!session.isActive && !session.resolved && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveSessionId(session.id);
                                refreshSessions();
                              }}
                            >
                              Resume Session
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DebugPanel;
