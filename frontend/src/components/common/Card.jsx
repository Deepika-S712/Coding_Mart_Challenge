import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = 'p-5',
  headerClassName = 'px-5 py-4 border-b border-[#E2E8F0]',
  footer,
  footerClassName = 'px-5 py-3 bg-slate-50 border-t border-[#E2E8F0]',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-[#E2E8F0] shadow-sm transition-shadow ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between ${headerClassName}`}>
          <div>
            {title && <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && <div className={footerClassName}>{footer}</div>}
    </div>
  );
};

export default Card;
