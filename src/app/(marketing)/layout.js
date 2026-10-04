import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
