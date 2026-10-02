import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data from the server. Please check your connection and try again.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`cms-state-card ${className}`} style={{ borderColor: 'var(--cms-danger-border)', backgroundColor: '#FEF2F2' }}>
      <AlertCircle className="cms-state-icon" style={{ color: 'var(--cms-danger)' }} size={40} />
      <h4 className="cms-state-title" style={{ color: 'var(--cms-danger)' }}>{title}</h4>
      <p className="cms-state-desc" style={{ color: 'var(--cms-text-secondary)' }}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
