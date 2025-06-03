import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-3 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-3 ${className}`}>
    {children}
  </div>
);
