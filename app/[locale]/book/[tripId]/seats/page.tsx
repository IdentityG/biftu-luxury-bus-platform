'use client';

import { use } from 'react';
import { BookSeats } from '@/page-components/Booking';
import { PageWrapper } from '@/components/PageWrapper';

export default function BookSeatsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  
  return (
    <PageWrapper>
      <BookSeats tripId={tripId} />
    </PageWrapper>
  );
}
