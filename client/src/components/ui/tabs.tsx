import React, { useState } from 'react';

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultValue, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
    {children}
  </div>
);

export const TabsTrigger: React.FC<{ 
  value: string; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ value, children, className = '', onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm ${className}`}
  >
    {children}
  </button>
);

export const TabsContent: React.FC<{ 
  value: string; 
  children: React.ReactNode; 
  className?: string;
}> = ({ value, children, className = '' }) => (
  <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${className}`}>
    {children}
  </div>
); 