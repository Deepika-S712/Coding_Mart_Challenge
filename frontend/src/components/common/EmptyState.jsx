import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records available for this view at this time.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`cms-state-card ${className}`}>
      <Icon className="cms-state-icon" size={40} />
      <h4 className="cms-state-title">{title}</h4>
      <p className="cms-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
