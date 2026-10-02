import React from 'react';
import './Badge.css';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const classNames = [
    'cms-badge',
    `cms-badge-${variant}`,
    `cms-badge-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      {dot && <span className="cms-badge-dot" />}
      {children}
    </span>
  );
};
