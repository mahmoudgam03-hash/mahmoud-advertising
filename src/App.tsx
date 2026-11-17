import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AboutPage } from './pages/AboutPage';
import { QuotePage } from './pages/QuotePage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { StudioPage } from './pages/StudioPage';
import { WelcomeModal } from './components/WelcomeModal';

function PageSwitch() {
  const { route } = useApp();

  switch (route) {
    case '/services':
      return <ServicesPage />;
    case '/portfolio':
      return <PortfolioPage />;
    case '/about':
      return <AboutPage />;
    case '/quote':
      return <QuotePage />;
    case '/contact':
      return <ContactPage />;
    case '/admin':
      return <AdminPage />;
    case '/privacy':
      return <PrivacyPage />;
    case '/terms':
      return <TermsPage />;
    case '/studio':
      return <StudioPage />;
    case '/':
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#0A0B0E] text-[#F4F4F6]">
        <WelcomeModal />
        <Navbar />
        <main className="flex-1">
          <PageSwitch />
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}
