import React from 'react';

export const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24l0 9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.79V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"></path>
    <polyline points="2.32 6.16 12 11 21.68 6.16"></polyline>
    <line x1="12" y1="22.76" x2="12" y2="11"></line>
    <line x1="7" y1="3.5" x2="17" y2="8.5"></line>
  </svg>
);