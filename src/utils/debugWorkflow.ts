
/**
 * Debugging Workflow Utility
 * 
 * This utility provides a structured approach to debugging build issues
 * in Lovable applications. It tracks attempts, logs outcomes, and helps
 * maintain a consistent debugging process.
 */

import React from 'react';

type DebugAttempt = {
  id: number;
  timestamp: Date;
  issue: string;
  solution: string;
  outcome: 'success' | 'failure' | 'partial' | 'unknown';
  notes: string;
};

type DebugSession = {
  id: string;
  startTime: Date;
  endTime?: Date;
  issue: string;
  attempts: DebugAttempt[];
  resolved: boolean;
  errorLogs?: string[];
};

class DebugWorkflow {
  private static instance: DebugWorkflow;
  private sessions: Map<string, DebugSession> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  
  private constructor() {
    // Private constructor for singleton pattern
    console.log('Debug Workflow initialized');
  }
  
  public static getInstance(): DebugWorkflow {
    if (!DebugWorkflow.instance) {
      DebugWorkflow.instance = new DebugWorkflow();
    }
    return DebugWorkflow.instance;
  }
  
  /**
   * Start a new debugging session
   * @param issue Description of the issue being debugged
   * @returns The session ID
   */
  public startSession(issue: string): string {
    const sessionId = `debug-session-${Date.now()}`;
    const newSession: DebugSession = {
      id: sessionId,
      startTime: new Date(),
      issue,
      attempts: [],
      resolved: false,
      errorLogs: []
    };
    
    this.sessions.set(sessionId, newSession);
    console.log(`Debug session started: ${sessionId} for issue: ${issue}`);
    return sessionId;
  }
  
  /**
   * Log an attempt to resolve the issue
   * @param sessionId The session ID
   * @param solution Description of the attempted solution
   * @param notes Any additional notes about the attempt
   * @returns true if the attempt was logged, false if the session has reached max attempts
   */
  public logAttempt(
    sessionId: string, 
    solution: string, 
    notes: string = ''
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Debug session not found: ${sessionId}`);
      return false;
    }
    
    if (session.attempts.length >= this.MAX_ATTEMPTS) {
      console.warn(`Maximum attempts (${this.MAX_ATTEMPTS}) reached for session: ${sessionId}`);
      return false;
    }
    
    const attemptId = session.attempts.length + 1;
    const attempt: DebugAttempt = {
      id: attemptId,
      timestamp: new Date(),
      issue: session.issue,
      solution,
      outcome: 'unknown',
      notes
    };
    
    session.attempts.push(attempt);
    console.log(`Attempt ${attemptId} logged for session ${sessionId}: ${solution}`);
    return true;
  }
  
  /**
   * Update the outcome of the last attempt
   * @param sessionId The session ID
   * @param outcome The outcome of the attempt
   * @param notes Any additional notes about the outcome
   */
  public updateOutcome(
    sessionId: string, 
    outcome: 'success' | 'failure' | 'partial' | 'unknown', 
    notes: string = ''
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Debug session not found: ${sessionId}`);
      return;
    }
    
    if (session.attempts.length === 0) {
      console.error(`No attempts found for session: ${sessionId}`);
      return;
    }
    
    const lastAttempt = session.attempts[session.attempts.length - 1];
    lastAttempt.outcome = outcome;
    if (notes) {
      lastAttempt.notes += `\nOutcome: ${notes}`;
    }
    
    console.log(`Updated outcome for attempt ${lastAttempt.id}: ${outcome}`);
    
    if (outcome === 'success') {
      this.resolveSession(sessionId, `Issue resolved with attempt ${lastAttempt.id}`);
    }
  }
  
  /**
   * Log an error message to the current session
   * @param sessionId The session ID
   * @param error The error message or object
   */
  public logError(sessionId: string, error: any): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Debug session not found: ${sessionId}`);
      return;
    }
    
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}\n${error.stack}`
      : String(error);
    
    if (!session.errorLogs) {
      session.errorLogs = [];
    }
    
    session.errorLogs.push(errorMessage);
    console.error(`Error logged for session ${sessionId}:`, error);
  }
  
  /**
   * Mark a session as resolved
   * @param sessionId The session ID
   * @param notes Any notes about the resolution
   */
  public resolveSession(sessionId: string, notes: string = ''): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Debug session not found: ${sessionId}`);
      return;
    }
    
    session.resolved = true;
    session.endTime = new Date();
    
    const lastAttempt = session.attempts[session.attempts.length - 1];
    if (lastAttempt) {
      lastAttempt.notes += `\nResolution: ${notes}`;
    }
    
    console.log(`Debug session ${sessionId} marked as resolved: ${notes}`);
    this.exportSessionSummary(sessionId);
  }
  
  /**
   * Export a summary of the session
   * @param sessionId The session ID
   * @returns A summary object of the session
   */
  public exportSessionSummary(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Debug session not found: ${sessionId}`);
      return null;
    }
    
    const duration = session.endTime 
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
      : (new Date().getTime() - session.startTime.getTime()) / 1000;
    
    const summary = {
      sessionId: session.id,
      issue: session.issue,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
      duration: `${duration.toFixed(2)} seconds`,
      attempts: session.attempts.length,
      resolved: session.resolved,
      attemptDetails: session.attempts.map(attempt => ({
        id: attempt.id,
        solution: attempt.solution,
        outcome: attempt.outcome,
        notes: attempt.notes
      })),
      errorLogs: session.errorLogs || []
    };
    
    console.log('Debug Session Summary:', summary);
    return summary;
  }
  
  /**
   * Get all sessions
   * @returns An array of all debug sessions
   */
  public getAllSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }
  
  /**
   * Get a specific session
   * @param sessionId The session ID
   * @returns The debug session or undefined if not found
   */
  public getSession(sessionId: string): DebugSession | undefined {
    return this.sessions.get(sessionId);
  }
  
  /**
   * Clear all sessions
   */
  public clearAllSessions(): void {
    this.sessions.clear();
    console.log('All debug sessions cleared');
  }
}

export const debugWorkflow = DebugWorkflow.getInstance();

/**
 * Hook to create a debug workflow for a specific component or feature
 * @param componentName The name of the component or feature
 * @returns Debug workflow methods scoped to the component
 */
export function useDebugWorkflow(componentName: string) {
  const sessionIdRef = React.useRef<string | null>(null);
  
  const startDebugging = (issue: string) => {
    sessionIdRef.current = debugWorkflow.startSession(`[${componentName}] ${issue}`);
    return sessionIdRef.current;
  };
  
  const logAttempt = (solution: string, notes?: string) => {
    if (!sessionIdRef.current) {
      console.error('No active debug session. Call startDebugging first.');
      return false;
    }
    return debugWorkflow.logAttempt(sessionIdRef.current, solution, notes);
  };
  
  const updateOutcome = (
    outcome: 'success' | 'failure' | 'partial' | 'unknown', 
    notes?: string
  ) => {
    if (!sessionIdRef.current) {
      console.error('No active debug session. Call startDebugging first.');
      return;
    }
    debugWorkflow.updateOutcome(sessionIdRef.current, outcome, notes);
  };
  
  const logError = (error: any) => {
    if (!sessionIdRef.current) {
      console.error('No active debug session. Call startDebugging first.');
      return;
    }
    debugWorkflow.logError(sessionIdRef.current, error);
  };
  
  const resolveIssue = (notes?: string) => {
    if (!sessionIdRef.current) {
      console.error('No active debug session. Call startDebugging first.');
      return;
    }
    debugWorkflow.resolveSession(sessionIdRef.current, notes);
    sessionIdRef.current = null;
  };
  
  return {
    startDebugging,
    logAttempt,
    updateOutcome,
    logError,
    resolveIssue,
    getSummary: () => sessionIdRef.current 
      ? debugWorkflow.exportSessionSummary(sessionIdRef.current)
      : null
  };
}
