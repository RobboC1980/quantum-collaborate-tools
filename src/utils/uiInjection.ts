import { Root, createRoot } from 'react-dom/client';
import React from 'react';

type UIComponentProps = Record<string, any>;

interface InjectionConfig {
  targetSelector: string;
  position?: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
  condition?: (target: Element) => boolean;
}

class UIInjector {
  private static instance: UIInjector;
  private injectedComponents: Map<string, Root> = new Map();
  private observer: MutationObserver | null = null;
  private shouldInjectUI: boolean = true;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): UIInjector {
    if (!UIInjector.instance) {
      UIInjector.instance = new UIInjector();
    }
    return UIInjector.instance;
  }

  /**
   * Initialize the mutation observer to watch for DOM changes
   * @param rootSelector The root element to observe
   */
  public initObserver(rootSelector: string = 'body'): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    const targetNode = document.querySelector(rootSelector);
    if (!targetNode) {
      console.error(`Target node not found: ${rootSelector}`);
      return;
    }

    const config = { childList: true, subtree: true };

    this.observer = new MutationObserver((mutations) => {
      if (!this.shouldInjectUI) return;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.checkAndInjectComponents();
        }
      });
    });

    this.observer.observe(targetNode, config);
    console.log('UI Injector: Observer initialized');
  }

  /**
   * Enable or disable UI injection
   * @param value Whether UI should be injected
   */
  public setShouldInjectUI(value: boolean): void {
    this.shouldInjectUI = value;
    console.log(`UI Injector: Injection ${value ? 'enabled' : 'disabled'}`);
  }

  /**
   * Register a component to be injected when the target element is found
   * @param id Unique identifier for this injection
   * @param component React component to inject
   * @param config Injection configuration
   * @param props Props to pass to the component
   */
  public registerComponent(
    id: string,
    component: React.ComponentType<UIComponentProps>,
    config: InjectionConfig,
    props: UIComponentProps = {}
  ): void {
    // Store the component info for later injection
    this.injectedComponents.set(id, null as unknown as Root);
    
    // Try to inject immediately in case the target already exists
    this.injectComponent(id, component, config, props);
    
    console.log(`UI Injector: Component registered - ${id}`);
  }

  /**
   * Remove a previously injected component
   * @param id The id of the component to remove
   */
  public removeComponent(id: string): void {
    const root = this.injectedComponents.get(id);
    if (root) {
      try {
        // Use requestAnimationFrame to safely schedule unmounting outside of React's rendering cycle
        requestAnimationFrame(() => {
          try {
            root.unmount();
            console.log(`UI Injector: Component unmounted - ${id}`);
          } catch (e) {
            console.error(`Error unmounting component ${id}:`, e);
          } finally {
            this.injectedComponents.delete(id);
          }
        });
      } catch (e) {
        console.error(`Error scheduling unmount for component ${id}:`, e);
        this.injectedComponents.delete(id);
      }
    } else {
      this.injectedComponents.delete(id);
    }
  }

  /**
   * Clean up all injected components and disconnect the observer
   */
  public cleanup(): void {
    // Disconnect observer first
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    // Schedule unmounting in the next animation frame to avoid conflicts with React rendering
    requestAnimationFrame(() => {
      // Unmount all roots
      this.injectedComponents.forEach((root, id) => {
        if (root) {
          try {
            root.unmount();
          } catch (e) {
            console.error(`Error unmounting component ${id}:`, e);
          }
        }
      });
      
      this.injectedComponents.clear();
      console.log('UI Injector: Cleanup complete');
    });
  }

  /**
   * Check and inject all registered components if their targets exist
   */
  private checkAndInjectComponents(): void {
    if (!this.shouldInjectUI) return;
    
    this.injectedComponents.forEach((root, id) => {
      if (!root) {
        // If the component hasn't been injected yet, try to inject it
        const component = this.getStoredComponent(id);
        if (component) {
          const { component: Comp, config, props } = component;
          this.injectComponent(id, Comp, config, props);
        }
      }
    });
  }

  /**
   * Inject a React component into the DOM
   */
  private injectComponent(
    id: string,
    Component: React.ComponentType<UIComponentProps>,
    config: InjectionConfig,
    props: UIComponentProps
  ): void {
    if (!this.shouldInjectUI) return;
    
    const targets = document.querySelectorAll(config.targetSelector);
    if (!targets || targets.length === 0) return;
    
    // Find the first target that meets the condition (if provided)
    let targetEl: Element | null = null;
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      if (!config.condition || config.condition(target)) {
        targetEl = target;
        break;
      }
    }
    
    if (!targetEl) return;
    
    // Check if we already have a root for this ID
    const existingRoot = this.injectedComponents.get(id);
    if (existingRoot) return;
    
    // Create container and inject it
    const position = config.position || 'beforeend';
    const containerId = `ui-injector-${id}`;
    let containerEl = document.getElementById(containerId);
    
    if (!containerEl) {
      containerEl = document.createElement('div');
      containerEl.id = containerId;
      
      // Insert the container at the specified position
      targetEl.insertAdjacentElement(position, containerEl);
    }
    
    // Create and store the root
    const root = createRoot(containerEl);
    this.injectedComponents.set(id, root);
    
    // Render the component
    root.render(React.createElement(Component, props));
    console.log(`UI Injector: Component injected - ${id}`);
  }

  /**
   * Get a stored component by ID
   * This is a placeholder - in a real implementation, you'd store
   * component definitions along with their IDs
   */
  private getStoredComponent(id: string): { 
    component: React.ComponentType<UIComponentProps>, 
    config: InjectionConfig, 
    props: UIComponentProps 
  } | null {
    // This would fetch from your components registry
    // For now, we'll return null as this is just an example
    return null;
  }
}

// Export a singleton instance
export const uiInjector = UIInjector.getInstance();

// Helper function to inject a component
export function injectComponent<P extends UIComponentProps>(
  id: string,
  component: React.ComponentType<P>,
  config: InjectionConfig,
  props?: P
) {
  uiInjector.registerComponent(id, component, config, props || {} as P);
  return () => uiInjector.removeComponent(id);
}

// Example usage:
// const cleanup = injectComponent(
//   'notification-banner',
//   NotificationBanner,
//   { targetSelector: '.dashboard-header', position: 'afterbegin' },
//   { message: 'This is an injected notification' }
// );
