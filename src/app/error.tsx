'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-chapchap-light dark:bg-chapchap-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">⚠️</div>
        <h1 className="text-3xl font-display font-bold text-chapchap-secondary dark:text-white mb-3">
          Une erreur s&apos;est produite
        </h1>
        <p className="text-chapchap-muted mb-8">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={reset} className="btn-primary">🔄 Réessayer</button>
          <Link href="/" className="btn-outline">🏠 Accueil</Link>
        </div>
      </div>
    </div>
  );
}
