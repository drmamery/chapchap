import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';

interface MainLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
  hideFooter?: boolean;
}

export function MainLayout({ children, hideNav = false, hideFooter = false }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && <Navbar />}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <MobileNav />
    </div>
  );
}
