'use client';

import { use } from 'react';
import { BookPayment } from '@/page-components/Booking';
import { PageWrapper } from '@/components/PageWrapper';

export default function BookPaymentPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  
  return (
    <PageWrapper>
      <BookPayment tripId={tripId} />
    </PageWrapper>
  );
}
