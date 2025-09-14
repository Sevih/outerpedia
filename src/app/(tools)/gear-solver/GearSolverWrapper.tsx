'use client';
import dynamic from 'next/dynamic';

const GearSolverClient = dynamic(() => import('./gearSolverClient'), { ssr: false });

export default function GearSolverWrapper() {
  return <GearSolverClient />;
}
