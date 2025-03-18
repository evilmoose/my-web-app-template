import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Blog from './pages/Blog';
import BlogAdmin from './pages/BlogAdmin';
import BlogPost from './pages/BlogPost';
import SimpleFooter from './components/SimpleFooter';
import NormalFooter from './components/NormalFooter';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectCreate from './pages/ProjectCreate';
import ProjectEdit from './pages/ProjectEdit';

// Wrapper component to conditionally render different layouts
const AppContent = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Pages that should have normal scrolling and full footer
  const normalScrollPages = ['/', '/solutions', '/pricing', '/blog'];
  const shouldUseNormalScroll = normalScrollPages.includes(path) || path.startsWith('/blog/');
  
  return (
    <div className={shouldUseNormalScroll ? "" : "flex flex-col h-screen overflow-hidden"}>
      <Navbar />
      <main className={shouldUseNormalScroll ? "" : "flex-grow overflow-hidden"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:postId" element={<BlogPost />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog-admin" 
            element={
              <AdminRoute>
                <BlogAdmin />
              </AdminRoute>
            } 
          />
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          } />
          <Route path="/projects/new" element={
            <ProtectedRoute>
              <ProjectCreate />
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId/*" element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="/projects/:projectId/edit" element={
            <ProtectedRoute>
              <ProjectEdit />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {shouldUseNormalScroll ? <NormalFooter /> : <SimpleFooter />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
