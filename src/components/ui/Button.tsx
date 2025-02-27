
import React from 'react';
import { cn } from '@/lib/utils';
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '@/components/ui/button';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'quantum';
  size?: 'default' | 'sm' | 'lg' | 'icon'; // Removed 'xl' as it's not supported in the base component
  children: React.ReactNode;
  icon?: React.ReactNode;
  withArrow?: boolean;
  className?: string;
}

const Button = ({
  variant = 'default',
  size = 'default',
  children,
  icon,
  withArrow = false,
  className,
  ...props
}: ButtonProps) => {
  // Convert our custom 'quantum' variant to use the default variant with custom styling
  const resolvedVariant = variant === 'quantum' ? 'default' : variant;
  
  return (
    <ShadcnButton
      variant={resolvedVariant as ShadcnButtonProps['variant']}
      size={size}
      className={cn(
        'font-medium transition-all duration-300 ease-in-out',
        size === 'lg' && 'text-lg py-6 px-8', // Apply larger text and padding for 'lg' size
        variant === 'quantum' && 'bg-quantum-600 hover:bg-quantum-700 text-white shadow-lg hover:shadow-xl',
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {withArrow && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      )}
    </ShadcnButton>
  );
};

export default Button;
