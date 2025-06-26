import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './contexts/AudioContext';
import { ModalProvider } from './contexts/ModalContext';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
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


function App() {
  return (
    <ModalProvider>
      <AudioProvider>
      <Router>
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
        </Routes>

        {/* Global Audio Player - appears on all pages */}
        <GlobalAudioPlayer />
      </Router>
    </AudioProvider>
    </ModalProvider>
  );
}

export default App;
