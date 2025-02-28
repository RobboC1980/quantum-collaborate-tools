import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * A component that conditionally renders content based on user permissions
 * 
 * @param permission - The permission required to view the content
 * @param children - The content to render if the user has the required permission
 * @param fallback - Optional content to render if the user doesn't have the required permission
 * @param showLoading - Whether to show a loading skeleton while checking permissions
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
  showLoading = true
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkPermission = async () => {
      try {
        const result = await hasPermission(permission);
        if (isMounted) {
          setHasAccess(result);
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        if (isMounted) {
          setHasAccess(false);
        }
      }
    };

    checkPermission();
    
    return () => {
      isMounted = false;
    };
  }, [permission, hasPermission]);

  if (hasAccess === null) {
    return showLoading ? (
      <div className="w-full">
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ) : null;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * A component that renders content if the user has any of the specified permissions
 */
export function AnyPermissionGuard({
  permissions,
  children,
  fallback = null,
  showLoading = true
}: Omit<PermissionGuardProps, 'permission'> & { permissions: string[] }) {
  const { hasPermission } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkPermissions = async () => {
      try {
        const results = await Promise.all(
          permissions.map(permission => hasPermission(permission))
        );
        if (isMounted) {
          setHasAccess(results.some(result => result));
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        if (isMounted) {
          setHasAccess(false);
        }
      }
    };

    checkPermissions();
    
    return () => {
      isMounted = false;
    };
  }, [permissions, hasPermission]);

  if (hasAccess === null) {
    return showLoading ? (
      <div className="w-full">
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ) : null;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
} 