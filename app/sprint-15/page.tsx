'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Sprint15Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/sprints');
  }, [router]);
  return null;
}
