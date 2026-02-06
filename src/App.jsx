import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { AudioProvider } from './contexts/AudioContext';
import { ModalProvider } from './contexts/ModalContext';
import { ToastProvider } from './contexts/ToastContext';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import MobileHeader from './components/MobileHeader';
import Sidebar from './components/Sidebar';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Search from './pages/Search';
import AllBooks from './pages/AllBooks';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import Downloads from './pages/Downloads';
import AdminDashboard from './pages/Admin/Dashboard';
import UploadBook from './pages/Admin/UploadBook';
import BooksManagement from './pages/Admin/BooksManagement';
import UsersManagement from './pages/Admin/UsersManagement';
import PaymentCallback from './pages/PaymentCallback';


function GsapRouteEffects() {
  const location = useLocation();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const scrollerEl = document.querySelector('[data-scroll-container]');

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;

    if (scrollerEl) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
    }

    const scrollTween = gsap.to(scrollerEl || window, {
      duration: 0.7,
      ease: 'power2.out',
      scrollTo: { y: 0, autoKill: true },
    });

    const ctx = gsap.context(() => {
      const fadeUpElements = gsap.utils.toArray('[data-gsap="fade-up"]');

      fadeUpElements.forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              ...(scrollerEl ? { scroller: scrollerEl } : {}),
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });
    });

    ScrollTrigger.refresh();

    return () => {
      scrollTween.kill();
      ctx.revert();

      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
    };
  }, [location.pathname]);

  return null;
}


function App() {
  return (
    <ModalProvider>
      <ToastProvider>
        <AudioProvider>
        <Router>
          <GsapRouteEffects />
          {/* Global Header - appears on all pages */}
          <MobileHeader />
          
          {/* Global Sidebar - appears on all pages */}
          <Sidebar />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/books" element={<AllBooks />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/upload" element={<UploadBook />} />
            <Route path="/admin/books" element={<BooksManagement />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            {/* Main app routes */}
            <Route path="/library" element={<Library />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/settings" element={<Home />} />
            {/* Payment callback route */}
            <Route path="/payment/callback" element={<PaymentCallback />} />
          </Routes>

          {/* Global Audio Player - appears on all pages */}
          <GlobalAudioPlayer />
        </Router>
      </AudioProvider>
      </ToastProvider>
    </ModalProvider>
  );
}

export default App;
