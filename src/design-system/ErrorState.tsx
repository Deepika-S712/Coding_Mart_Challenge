import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import './ErrorState.css';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'We encountered a connection issue while fetching records from the college server. Please try again.',
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  return (
    <div className={`cms-error-state ${className}`}>
      <div className="cms-error-icon">
        <AlertTriangle size={44} />
      </div>
      <h3 className="cms-error-title">{title}</h3>
      <p className="cms-error-message">{message}</p>
      {onRetry && (
        <div className="cms-error-action">
          <Button
            variant="primary"
            leftIcon={<RefreshCw size={16} />}
            isLoading={isRetrying}
            onClick={onRetry}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
