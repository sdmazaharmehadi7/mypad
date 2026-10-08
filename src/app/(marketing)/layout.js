import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnsureLightMode from '@/components/EnsureLightMode';

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col justify-between">
      <EnsureLightMode />
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col justify-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
