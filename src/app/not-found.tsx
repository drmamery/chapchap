import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-chapchap-light dark:bg-chapchap-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-display font-bold text-chapchap-secondary dark:text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-chapchap-muted text-lg mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary btn-lg">
            🏠 Retour à l&apos;accueil
          </Link>
          <Link href="/products" className="btn-outline btn-lg">
            🛍️ Voir les produits
          </Link>
        </div>
        <p className="mt-8 text-sm text-chapchap-muted">
          Besoin d&apos;aide ? <Link href="/help" className="text-chapchap-primary hover:underline">Contactez-nous</Link>
        </p>
      </div>
    </div>
  );
}
