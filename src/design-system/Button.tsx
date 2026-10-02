import React, { type ButtonHTMLAttributes } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const classNames = [
    'cms-btn',
    `cms-btn-${variant}`,
    `cms-btn-${size}`,
    fullWidth ? 'cms-btn-full' : '',
    isLoading ? 'cms-btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classNames} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="cms-btn-spinner" aria-hidden="true" />
      ) : (
        leftIcon && <span className="cms-btn-icon cms-btn-icon-left">{leftIcon}</span>
      )}
      <span className="cms-btn-text">{children}</span>
      {!isLoading && rightIcon && (
        <span className="cms-btn-icon cms-btn-icon-right">{rightIcon}</span>
      )}
    </button>
  );
};
