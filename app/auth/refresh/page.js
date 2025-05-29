import { Suspense } from 'react';
import RefreshClient from './RefreshClient';

export default function RefreshPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RefreshClient />
    </Suspense>
  );
} 