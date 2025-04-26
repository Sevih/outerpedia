'use client';

import BuffDebuffDisplay from '@/app/components/BuffDebuffDisplay';
import type { BuffDebuffDisplayProps } from '@/app/components/BuffDebuffDisplay';

export default function BuffDebuffDisplayClient(props: BuffDebuffDisplayProps) {
  return <BuffDebuffDisplay {...props} />;
}
