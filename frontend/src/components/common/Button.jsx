import React from 'react';

export default function Button({ children, className = '', variant = 'primary', href, ...rest }) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 focus:ring-secondary',
    accent: 'bg-accent text-white hover:bg-opacity-90 focus:ring-accent',
    neutral: 'bg-surface text-text-main hover:bg-gray-50 border border-gray-200 focus:ring-gray-200',
    ghost: 'bg-transparent text-text-main hover:bg-gray-50 focus:ring-gray-200',
  };

  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;

  // If href is provided, render as anchor tag
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
