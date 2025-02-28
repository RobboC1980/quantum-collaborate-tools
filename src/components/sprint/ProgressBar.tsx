import React from 'react';

type ProgressBarProps = {
  value: number;
  maxValue: number;
  color: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  height?: 'sm' | 'md' | 'lg';
};

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  maxValue, 
  color,
  height = 'sm'
}) => {
  // Calculate percentage with validation
  const percentage = maxValue > 0 ? Math.min(100, Math.max(0, (value / maxValue) * 100)) : 0;
  
  // Set the width with CSS variable instead of inline style
  // This addresses the linting warning while still allowing dynamic values
  
  // Color class mapping
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500'
  };
  
  // Background color mapping
  const bgColorClasses = {
    blue: 'bg-blue-200',
    purple: 'bg-purple-200',
    green: 'bg-green-200',
    red: 'bg-red-200',
    orange: 'bg-orange-200'
  };
  
  // Height mapping
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  return (
    <div className={`w-full ${heightClasses[height]} ${bgColorClasses[color]} rounded-full overflow-hidden`}>
      <div 
        className={`${heightClasses[height]} ${colorClasses[color]} rounded-full progress-bar`} 
        style={{ width: `${percentage}%` }}
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      />
    </div>
  );
};

export default ProgressBar; 