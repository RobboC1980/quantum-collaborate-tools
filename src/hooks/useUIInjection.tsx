
import { useEffect, useState } from 'react';
import { uiInjector, injectComponent } from '@/utils/uiInjection';
import InjectedBanner from '@/components/ui/InjectedBanner';

/**
 * Hook to handle UI injection in the dashboard
 */
export const useUIInjection = () => {
  const [initialized, setInitialized] = useState(false);
  
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
          onClose: () => uiInjector.removeComponent('dashboard-welcome-banner')
        }
      );
      
      setInitialized(true);
      
      // Clean up on unmount
      return () => {
        cleanupBanner();
        uiInjector.cleanup();
      };
    }
  }, [initialized]);
  
  return {
    injectUI: (id: string, component: React.ComponentType<any>, config: any, props?: any) => 
      injectComponent(id, component, config, props),
    removeUI: (id: string) => uiInjector.removeComponent(id),
    disableInjection: () => uiInjector.setShouldInjectUI(false),
    enableInjection: () => uiInjector.setShouldInjectUI(true)
  };
};
