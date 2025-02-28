import { useEffect, useState, useRef } from 'react';
import { uiInjector, injectComponent } from '@/utils/uiInjection';
import InjectedBanner from '@/components/ui/InjectedBanner';

/**
 * Hook to handle UI injection in the dashboard
 */
export const useUIInjection = () => {
  const [initialized, setInitialized] = useState(false);
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  
  // Set up UI injection on mount
  useEffect(() => {
    if (!initialized) {
      console.log('Initializing UI injector');
      
      // Initialize the observer
      uiInjector.initObserver('#root');
      
      // Enable UI injection
      uiInjector.setShouldInjectUI(true);
      
      // Example: Inject a welcome banner at the top of the dashboard
      const cleanupBanner = injectComponent(
        'dashboard-welcome-banner',
        InjectedBanner,
        { 
          targetSelector: 'main', 
          position: 'afterbegin',
          condition: (target) => target.classList.contains('col-span-12')
        },
        { 
          message: 'Welcome to your dashboard! Here you can manage your sprints, stories, and tasks.',
          type: 'info',
          onClose: () => {
            // Store this in a state or ref instead of calling directly
            // to avoid race conditions during component unmounting
            cleanupFunctionsRef.current.push(() => uiInjector.removeComponent('dashboard-welcome-banner'));
          }
        }
      );
      
      cleanupFunctionsRef.current.push(cleanupBanner);
      setInitialized(true);
    }
    
    // Clean up on unmount
    return () => {
      console.log('UI injection cleanup triggered by component unmount');
      
      // Execute all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        if (typeof cleanup === 'function') {
          try {
            cleanup();
          } catch (e) {
            console.error('Error during UI injection cleanup:', e);
          }
        }
      });
      
      // Final cleanup
      uiInjector.cleanup();
    };
  }, [initialized]);
  
  const injectUI = (id: string, component: React.ComponentType<any>, config: any, props?: any) => {
    const cleanup = injectComponent(id, component, config, props);
    cleanupFunctionsRef.current.push(cleanup);
    return cleanup;
  };
  
  const removeUI = (id: string) => {
    // Schedule removal for the next frame to avoid race conditions
    setTimeout(() => uiInjector.removeComponent(id), 0);
  };
  
  return {
    injectUI,
    removeUI,
    disableInjection: () => uiInjector.setShouldInjectUI(false),
    enableInjection: () => uiInjector.setShouldInjectUI(true)
  };
};
