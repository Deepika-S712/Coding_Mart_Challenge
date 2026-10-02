import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen size={44} />,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`cms-empty-state ${className}`}>
      <div className="cms-empty-icon">{icon}</div>
      <h3 className="cms-empty-title">{title}</h3>
      <p className="cms-empty-description">{description}</p>
      {actionLabel && onAction && (
        <div className="cms-empty-action">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
