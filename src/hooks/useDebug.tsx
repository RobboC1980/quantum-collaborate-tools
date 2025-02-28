
import React, { useState, useCallback } from 'react';
import { useDebugWorkflow } from '@/utils/debugWorkflow';
import DebugPanel from '@/components/debug/DebugPanel';
import { useToast } from '@/components/ui/use-toast';

/**
 * A hook that provides debugging utilities for components
 * @param componentName The name of the component for easier tracking
 */
export function useDebug(componentName: string) {
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const debugTools = useDebugWorkflow(componentName);
  const { toast } = useToast();
  
  const openDebugPanel = useCallback(() => {
    setIsDebugPanelOpen(true);
  }, []);
  
  const closeDebugPanel = useCallback(() => {
    setIsDebugPanelOpen(false);
  }, []);
  
  /**
   * Try to execute a function with automatic debug tracking
   * @param fn The function to execute
   * @param debugInfo Object containing debug information
   * @returns The result of the function
   */
  const tryExecute = async <T,>(
    fn: () => Promise<T> | T,
    debugInfo: {
      issue: string;
      solution: string;
      shouldToast?: boolean;
    }
  ): Promise<T> => {
    let result: T;
    
    debugTools.startDebugging(debugInfo.issue);
    debugTools.logAttempt(debugInfo.solution);
    
    try {
      result = await fn();
      debugTools.updateOutcome('success', 'Operation completed successfully');
      debugTools.resolveIssue('Issue resolved');
      
      if (debugInfo.shouldToast) {
        toast({
          title: "Operation Successful",
          description: debugInfo.issue,
        });
      }
      
      return result;
    } catch (error) {
      debugTools.updateOutcome('failure', 'Operation failed');
      debugTools.logError(error);
      
      console.error('Debug error:', error);
      
      if (debugInfo.shouldToast) {
        toast({
          title: "Operation Failed",
          description: `${debugInfo.issue}: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive",
        });
      }
      
      throw error; // Re-throw for further handling if needed
    }
  };
  
  /**
   * Function to wrap a component's render with debug information
   */
  const DebugWrapper: React.FC<{
    children: React.ReactNode;
    showControls?: boolean;
  }> = ({ children, showControls = false }) => {
    return (
      <>
        {children}
        {showControls && (
          <div className="fixed bottom-4 right-4 z-50">
            <button
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 shadow-md"
              onClick={openDebugPanel}
            >
              <span>🐛</span> Debug
            </button>
          </div>
        )}
        <DebugPanel isOpen={isDebugPanelOpen} onClose={closeDebugPanel} />
      </>
    );
  };
  
  return {
    ...debugTools,
    tryExecute,
    DebugWrapper,
    openDebugPanel,
    closeDebugPanel,
  };
}
