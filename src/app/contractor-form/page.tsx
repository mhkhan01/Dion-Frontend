'use client';

import { Suspense } from 'react';
import ContractorForm from '@/components/ContractorForm';

export default function ContractorFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-booking-teal"></div>
      </div>
    }>
      <ContractorForm />
    </Suspense>
  );
}
