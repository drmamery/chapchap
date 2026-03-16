import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-chapchap-secondary text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-chapchap rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-display font-bold">
                Chap<span className="text-chapchap-primary">Chap</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              La première marketplace multi-vendeur de Bouaké, Côte d&apos;Ivoire. 
              Achetez et vendez en toute sécurité.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 bg-gray-700 hover:bg-chapchap-primary rounded-xl flex items-center justify-center transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 hover:bg-chapchap-primary rounded-xl flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-700 hover:bg-chapchap-primary rounded-xl flex items-center justify-center transition-colors">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Liens */}
          <div>
            <h4 className="font-display font-bold mb-4">Acheteurs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                ['Comment acheter', '/help/buy'],
                ['Paiement Mobile Money', '/help/payment'],
                ['Suivi de commande', '/track'],
                ['Retours & remboursements', '/help/returns'],
                ['Aide & FAQ', '/help'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Vendeurs</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                ['Créer une boutique', '/auth/register?role=seller'],
                ['Guide du vendeur', '/seller/guide'],
                ['Commissions & tarifs', '/seller/pricing'],
                ['Politique de vente', '/seller/policy'],
                ['Espace vendeur', '/seller/dashboard'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-chapchap-primary mt-0.5 flex-shrink-0" />
                <span>Avenue Kennedy, Bouaké<br />Côte d&apos;Ivoire</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-chapchap-primary flex-shrink-0" />
                <a href="tel:+22500000000" className="hover:text-white transition-colors">+225 XX XX XX XX</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-chapchap-primary flex-shrink-0" />
                <a href="mailto:support@chapchap.ci" className="hover:text-white transition-colors">support@chapchap.ci</a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Méthodes de paiement acceptées</p>
              <div className="flex flex-wrap gap-2">
                {['🟠 Orange Money', '🟡 MTN MoMo', '🔵 Wave', '💳 Carte'].map(m => (
                  <span key={m} className="text-xs bg-gray-700 rounded-lg px-2 py-1">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ChapChap CI — Tous droits réservés</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">CGU</Link>
            <Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
