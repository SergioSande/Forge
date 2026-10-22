import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness,
  ChevronDown,
  Compass,
  FolderKanban,
  Heart,
  Home,
  Inbox,
  LogOut,
  Menu,
  RotateCcw,
  Send,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../store/AppStore';
import { Avatar, Logo, Modal } from './ui';
import { firstName } from '../lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function AppLayout() {
  const { state, currentUser, logout, resetDemo, notify } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMenuOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!currentUser) return null;

  const isCompany = currentUser.role === 'company';
  const studentOffersPending =
    currentUser.role === 'student'
      ? state.offers.filter(
          (offer) =>
            offer.studentId === currentUser.id && offer.status === 'pending',
        ).length
      : 0;
  const companyProjectIds = new Set(
    state.projects
      .filter((project) => project.companyId === currentUser.id)
      .map((project) => project.id),
  );
  const pendingSolutions =
    currentUser.role === 'company'
      ? state.solutions.filter(
          (solution) =>
            companyProjectIds.has(solution.projectId) &&
            solution.status === 'pending',
        ).length
      : 0;
  const pendingCompanyOffers =
    currentUser.role === 'company'
      ? state.offers.filter(
          (offer) =>
            offer.companyId === currentUser.id && offer.status === 'pending',
        ).length
      : 0;
  const favoritesCount =
    currentUser.role === 'company'
      ? state.favorites.filter(
          (favorite) => favorite.companyId === currentUser.id,
        ).length
      : 0;

  const navGroups: NavGroup[] = isCompany
    ? [
        {
          label: 'Principal',
          items: [
            { to: '/app', label: 'Inicio', icon: Home },
            { to: '/app/mis-proyectos', label: 'Mis proyectos', icon: FolderKanban },
          ],
        },
        {
          label: 'Gestión',
          items: [
            {
              to: '/app/soluciones',
              label: 'Soluciones',
              icon: Inbox,
              badge: pendingSolutions,
            },
            {
              to: '/app/ofertas',
              label: 'Ofertas',
              icon: BriefcaseBusiness,
              badge: pendingCompanyOffers,
            },
            {
              to: '/app/favoritos',
              label: 'Favoritos',
              icon: Heart,
              badge: favoritesCount,
            },
          ],
        },
        {
          label: 'Comunidad',
          items: [
            { to: '/app/comunidad', label: 'Comunidad', icon: Users },
            { to: '/app/perfil', label: 'Mi perfil', icon: UserRound },
          ],
        },
      ]
    : [
        {
          label: 'Principal',
          items: [
            { to: '/app', label: 'Inicio', icon: Home },
            { to: '/app/explorar', label: 'Explorar retos', icon: Compass },
          ],
        },
        {
          label: 'Tu espacio',
          items: [
            { to: '/app/mis-proyectos', label: 'Mis proyectos', icon: FolderKanban },
            {
              to: '/app/postulaciones',
              label: 'Mis postulaciones',
              icon: Send,
            },
            {
              to: '/app/ofertas',
              label: 'Mis ofertas',
              icon: BriefcaseBusiness,
              badge: studentOffersPending,
            },
          ],
        },
        {
          label: 'Comunidad',
          items: [
            { to: '/app/comunidad', label: 'Comunidad', icon: Users },
            { to: '/app/perfil', label: 'Mi perfil', icon: UserRound },
          ],
        },
      ];

  const isActive = (to: string) => {
    if (to === '/app') return location.pathname === '/app';
    if (to === '/app/explorar') {
      return (
        location.pathname.startsWith('/app/explorar') ||
        (currentUser.role === 'student' &&
          location.pathname.startsWith('/app/proyectos'))
      );
    }
    if (to === '/app/mis-proyectos') {
      return (
        location.pathname.startsWith('/app/mis-proyectos') ||
        (currentUser.role === 'company' &&
          location.pathname.startsWith('/app/proyectos'))
      );
    }
    return location.pathname.startsWith(to);
  };

  const displayName = isCompany ? currentUser.name : `${currentUser.name} ${currentUser.surname}`;

  const handleLogout = () => {
    setMenuOpen(false);
    navigate('/');
    logout();
    notify('Has cerrado sesión. ¡Hasta pronto!', 'info');
  };

  const handleReset = () => {
    resetDemo();
    setResetOpen(false);
    setMenuOpen(false);
    navigate('/');
    notify('Datos de demostración restablecidos.', 'info');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="mobile-menu-trigger"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={19} />
          </button>
          <Logo small to="/app" />
          <div className="topbar-context">
            <span className="workspace-dot" />
            {isCompany ? 'Espacio de empresa' : 'Espacio de estudiante'}
          </div>

          <div className="topbar-right" ref={menuRef}>
            <div className="profile-wrap">
              <button
                className={`profile-trigger ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <Avatar user={currentUser} size="sm" />
                <span className="profile-trigger-text">
                  <strong>{isCompany ? displayName : firstName(displayName)}</strong>
                  <small>{isCompany ? 'Empresa' : 'Estudiante'}</small>
                </span>
                <ChevronDown size={16} className="chev" />
              </button>

              {menuOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu-head">
                    <Avatar user={currentUser} size="md" />
                    <div>
                      <strong>{displayName}</strong>
                      <span>{currentUser.email}</span>
                    </div>
                  </div>
                  <div className="menu-sep" />
                  <Link to="/app/perfil" className="menu-item" role="menuitem">
                    <UserRound size={17} />
                    Mi perfil
                  </Link>
                  <Link to="/app/comunidad" className="menu-item" role="menuitem">
                    <Users size={17} />
                    Comunidad Forge
                  </Link>
                  <div className="menu-sep" />
                  <button
                    className="menu-item menu-item-muted"
                    onClick={() => {
                      setResetOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    <RotateCcw size={17} />
                    Reiniciar demo
                  </button>
                  <button className="menu-item menu-item-danger" onClick={handleLogout}>
                    <LogOut size={17} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div
          className="mobile-drawer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMobileNavOpen(false);
          }}
        >
          <aside className="mobile-drawer" aria-label="Menú de navegación">
            <div className="mobile-drawer-head">
              <Logo small to="/app" />
              <button
                className="icon-btn"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Cerrar menú"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mobile-drawer-user">
              <Avatar user={currentUser} size="md" />
              <div>
                <strong>{displayName}</strong>
                <span>{isCompany ? 'Cuenta de empresa' : 'Cuenta de estudiante'}</span>
              </div>
            </div>

            <nav className="side-nav mobile-drawer-nav">
              {navGroups.map((group) => (
                <div className="side-nav-group" key={group.label}>
                  <span className="side-nav-label">{group.label}</span>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`side-nav-link ${isActive(item.to) ? 'active' : ''}`}
                      >
                        <Icon size={17} />
                        <span>{item.label}</span>
                        {item.badge ? (
                          <span className="side-nav-badge">{item.badge}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="mobile-drawer-footer">
              <Link
                to="/app/perfil"
                className="btn btn-secondary btn-block btn-sm"
                onClick={() => setMobileNavOpen(false)}
              >
                <UserRound size={15} /> Mi perfil
              </Link>
              <button className="btn btn-ghost btn-block btn-sm" onClick={handleLogout}>
                <LogOut size={15} /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="app-body">
        <aside className="app-sidebar">
          <div className="sidebar-inner">
            <div className="sidebar-workspace">
              <span className="sidebar-workspace-label">
                {isCompany ? 'Tu empresa' : 'Tu espacio'}
              </span>
              <strong>{isCompany ? currentUser.name : firstName(currentUser.name)}</strong>
              <span className="sidebar-workspace-role">
                {isCompany ? 'Empresa' : 'Estudiante'}
              </span>
            </div>

            <nav className="side-nav" aria-label="Navegación principal">
              {navGroups.map((group) => (
                <div className="side-nav-group" key={group.label}>
                  <span className="side-nav-label">{group.label}</span>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`side-nav-link ${isActive(item.to) ? 'active' : ''}`}
                      >
                        <Icon size={17} />
                        <span>{item.label}</span>
                        {item.badge ? (
                          <span className="side-nav-badge">{item.badge}</span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <Link to="/app/perfil" className="sidebar-profile-card">
              <Avatar user={currentUser} size="sm" />
              <div>
                <strong>{isCompany ? displayName : firstName(displayName)}</strong>
                <span>{isCompany ? 'Cuenta de empresa' : 'Ver mi perfil'}</span>
              </div>
              <UserRound size={15} />
            </Link>
          </div>
        </aside>

        <main className="app-main">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="app-footer">
        <div className="page-container app-footer-inner">
          <span>Forge — talento emergente, proyectos reales.</span>
          <span>Hecho para aprender haciendo.</span>
        </div>
      </footer>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reiniciar la demo"
        subtitle="Volverás a los datos originales y se cerrará tu sesión."
        size="sm"
        footer={
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setResetOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleReset}>
              Sí, reiniciar
            </button>
          </div>
        }
      >
        <p className="modal-text">
          Se eliminarán las cuentas, proyectos y soluciones que hayas creado en este navegador. La
          experiencia de bienvenida volverá a aparecer.
        </p>
      </Modal>
    </div>
  );
}
