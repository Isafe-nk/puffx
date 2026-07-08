import React from 'react';
import { Loader2 } from 'lucide-react';

/** Neutral full-height spinner shown while a lazy route chunk resolves. */
export default function PageLoader() {
  return (
    <div className="flex-1 min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="w-5 h-5 text-[#A2A3A5] animate-spin" />
    </div>
  );
}
