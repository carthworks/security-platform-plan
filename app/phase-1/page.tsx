'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Phase1Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/sprints');
  }, [router]);
  return null;
}
