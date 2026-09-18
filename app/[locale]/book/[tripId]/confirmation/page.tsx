'use client';

import { use } from 'react';
import { BookConfirmation } from '@/page-components/Booking';
import { PageWrapper } from '@/components/PageWrapper';

export default function BookConfirmationPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  
  return (
    <PageWrapper>
      <BookConfirmation tripId={tripId} />
    </PageWrapper>
  );
}
