import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Lightbulb, Copy } from 'lucide-react';

// Define specific types for different kinds of suggestions
type StringSuggestion = string;
type NumberSuggestion = number;
type TagsSuggestion = string[];
type SubtaskSuggestion = Array<{ title: string; completed?: boolean }>;
type CriteriaSuggestion = string[];
type GenericSuggestion = Record<string, unknown>;

// Union type of all possible suggestion types
type SuggestionType = 
  | StringSuggestion 
  | NumberSuggestion 
  | TagsSuggestion 
  | SubtaskSuggestion 
  | CriteriaSuggestion 
  | GenericSuggestion;

interface SuggestionPanelProps {
  title: string;
  description?: string;
  suggestions: SuggestionType;
  isLoading?: boolean;
  type?: 'text' | 'list' | 'tags' | 'number' | 'criteria';
  onAccept: (suggestions: SuggestionType) => void;
  onReject: () => void;
  className?: string;
}

/**
 * A panel component to display AI-generated suggestions
 */
const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  title,
  description,
  suggestions,
  isLoading = false,
  type = 'text',
  onAccept,
  onReject,
  className = '',
}) => {
  const hasSuggestions = !isLoading && suggestions !== null && 
    (Array.isArray(suggestions) ? suggestions.length > 0 : !!suggestions);
    
  // Render the suggestions based on their type
  const renderSuggestions = (): ReactNode => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quantum-600"></div>
        </div>
      );
    }
    
    if (!hasSuggestions) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No suggestions available.
        </div>
      );
    }
    
    switch (type) {
      case 'text':
        return (
          <div className="p-4 bg-muted rounded-md">
            <p className="whitespace-pre-wrap">{String(suggestions)}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2"
              onClick={() => navigator.clipboard.writeText(String(suggestions))}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
          </div>
        );
        
      case 'list':
        if (!Array.isArray(suggestions)) return null;
        return (
          <ul className="space-y-2">
            {suggestions.map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="h-5 w-5 mr-2 flex items-center justify-center rounded-full bg-quantum-100">
                  <span className="text-xs text-quantum-600">{index + 1}</span>
                </div>
                <span>
                  {typeof item === 'string' 
                    ? item 
                    : typeof item === 'object' && item !== null && 'title' in item
                      ? (item as { title: string }).title
                      : JSON.stringify(item)}
                </span>
              </li>
            ))}
          </ul>
        );
        
      case 'tags':
        if (!Array.isArray(suggestions)) return null;
        return (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag, index) => (
              <Badge key={index} variant="secondary">{String(tag)}</Badge>
            ))}
          </div>
        );
        
      case 'number':
        return (
          <div className="flex justify-center items-center py-4">
            <div className="text-4xl font-bold text-quantum-600">{Number(suggestions)}</div>
          </div>
        );
        
      case 'criteria':
        if (!Array.isArray(suggestions)) return null;
        return (
          <ul className="space-y-2">
            {suggestions.map((criterion, index) => (
              <li key={index} className="flex items-start p-2 rounded-md bg-muted">
                <Check className="h-4 w-4 mr-2 text-quantum-500 flex-shrink-0 mt-0.5" />
                <span>{String(criterion)}</span>
              </li>
            ))}
          </ul>
        );
        
      default:
        return <pre className="text-sm overflow-auto p-4">{JSON.stringify(suggestions, null, 2)}</pre>;
    }
  };
  
  return (
    <Card className={`border-quantum-200 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-quantum-500" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      
      <CardContent>
        {renderSuggestions()}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2 border-t pt-4">
        <Button variant="ghost" size="sm" onClick={onReject}>
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => onAccept(suggestions)}
          disabled={!hasSuggestions}
        >
          <Check className="h-4 w-4 mr-2" />
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SuggestionPanel; 