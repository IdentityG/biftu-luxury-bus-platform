'use client';

import { use } from 'react';
import { BookPassengers } from '@/page-components/Booking';
import { PageWrapper } from '@/components/PageWrapper';

export default function BookPassengersPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  
  return (
    <PageWrapper>
      <BookPassengers tripId={tripId} />
    </PageWrapper>
  );
}
