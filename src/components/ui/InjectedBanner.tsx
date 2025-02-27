
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface InjectedBannerProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

const InjectedBanner: React.FC<InjectedBannerProps> = ({ 
  message, 
  type = 'info', 
  onClose 
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <Card className={`mb-4 border ${getTypeStyles()}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <p>{message}</p>
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InjectedBanner;
