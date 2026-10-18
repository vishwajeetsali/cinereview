import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import FeedPage from './pages/FeedPage';
import AuthCallback from './pages/AuthCallback';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';
import DiscoverPage from './pages/DiscoverPage';
import PersonPage from './pages/PersonPage'
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'
import GenrePage from './pages/GenrePage';
import WatchlistPage from './pages/WatchlistPage';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion'

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/genre/:genreId" element={<GenrePage />} />
        <Route path="/movie/:tmdbId" element={<MovieDetail />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/user/:userId" element={<PublicProfile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/feed" element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>} />
        <Route path="/discover/:category" element={<DiscoverPage />} />
        <Route path="/watchlist" element={
          <ProtectedRoute>
            <WatchlistPage />
          </ProtectedRoute>
        } />
        <Route path="/person/:personId" element={<PersonPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const { authLoading } = useAuth();

  if (authLoading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-rose-500 animate-spin" />
    </div>
  );

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Toaster
        position="top-center"  // ← center looks more cinematic
        toastOptions={{
          duration: 3000,
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #3f3f46'
          },
          success: {
            iconTheme: {
              primary: '#e11d48',  // rose-600
              secondary: '#fff'
            }
          }
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App