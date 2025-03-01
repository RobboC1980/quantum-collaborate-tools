import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIAssistButtonProps {
  onClick: () => void;
  tooltip: string;
  variant?: 'default' | 'secondary' | 'ghost' | 'outline';
  size?: 'icon' | 'sm' | 'default' | 'lg'; 
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A button component for AI-assisted features
 */
const AIAssistButton: React.FC<AIAssistButtonProps> = ({
  onClick,
  tooltip,
  variant = 'outline',
  size = 'default',
  isLoading = false,
  disabled = false,
  className = '',
  children
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={`relative ${className}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2 text-quantum-500" />
            )}
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AIAssistButton; 