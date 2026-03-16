import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// ─── Lazy-loaded pages (code-split) ───
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Communities = lazy(() => import('./pages/Communities'));
const CommunityDetails = lazy(() => import('./pages/CommunityDetails'));
const CommunityChat = lazy(() => import('./pages/CommunityChat'));
const CommunityDashboard = lazy(() => import('./pages/CommunityDashboard'));
const CommunityMembers = lazy(() => import('./pages/CommunityMembers'));
const CreateCommunity = lazy(() => import('./pages/CreateCommunity'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const Resources = lazy(() => import('./pages/Resources'));
const ResourceDetails = lazy(() => import('./pages/ResourceDetails'));
const CreateResource = lazy(() => import('./pages/CreateResource'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const CommunityMap = lazy(() => import('./pages/CommunityMap'));
const Newsletter = lazy(() => import('./pages/Newsletter'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Help = lazy(() => import('./pages/Help'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const Feed = lazy(() => import('./pages/Feed'));
const UserPublicProfile = lazy(() => import('./pages/UserPublicProfile'));
const MyNetwork = lazy(() => import('./pages/MyNetwork'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/communities/:id" element={<CommunityDetails />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
                <Route path="/map" element={<CommunityMap />} />
                <Route path="/newsletter" element={<Newsletter />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<Help />} />
                <Route path="/guidelines" element={<Guidelines />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/create-community" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
                <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
                <Route path="/create-resource" element={<ProtectedRoute><CreateResource /></ProtectedRoute>} />
                <Route path="/communities/:id/chat" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />
                <Route path="/communities/:id/dashboard" element={<ProtectedRoute><CommunityDashboard /></ProtectedRoute>} />
                <Route path="/communities/:id/members" element={<ProtectedRoute><CommunityMembers /></ProtectedRoute>} />
                <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/network" element={<ProtectedRoute><MyNetwork /></ProtectedRoute>} />
                <Route path="/users/:id" element={<UserPublicProfile />} />

                {/* 404 */}
                <Route path="*" element={
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
                    <h1 style={{ fontSize: '5rem', fontWeight: '800', color: '#4f46e5', marginBottom: '0.5rem' }}>404</h1>
                    <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1.5rem' }}>Page not found</p>
                    <a href="/" style={{ background: '#4f46e5', color: '#fff', padding: '0.7rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Go Home</a>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
