import { Suspense } from 'react';
import FinishSignupClient from './FinishSignupClient';

export default function FinishSignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FinishSignupClient />
    </Suspense>
  );
}
