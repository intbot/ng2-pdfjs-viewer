import React from 'react';
import { Analytics } from '@vercel/analytics/react';

export default function Root({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
