import { useEffect, type ReactNode } from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useStore } from './store/AppStore';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Explore } from './pages/Explore';
import { CompanyProjects } from './pages/CompanyProjects';
import { StudentProjects } from './pages/StudentProjects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Applications } from './pages/Applications';
import { Community } from './pages/Community';
import { Offers } from './pages/Offers';
import { CompanySolutions } from './pages/CompanySolutions';
import { Favorites } from './pages/Favorites';
import { MyProfile, UserProfile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { AppLayout } from './components/Layout';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProjectsByRole() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  return currentUser.role === 'student' ? <StudentProjects /> : <CompanyProjects />;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="explorar" element={<Explore />} />
          <Route path="mis-proyectos" element={<ProjectsByRole />} />
          <Route path="postulaciones" element={<Applications />} />
          <Route path="ofertas" element={<Offers />} />
          <Route path="soluciones" element={<CompanySolutions />} />
          <Route path="favoritos" element={<Favorites />} />
          <Route path="proyectos/:id" element={<ProjectDetail />} />
          <Route path="comunidad" element={<Community />} />
          <Route path="perfil" element={<MyProfile />} />
          <Route path="u/:userId" element={<UserProfile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
