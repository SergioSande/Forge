import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { Logo } from '../components/ui';

export function NotFound() {
  const { currentUser } = useStore();

  return (
    <div className="notfound-page">
      <header className="auth-header">
        <Logo />
        <div className="auth-header-links">
          <Link to="/" className="btn btn-ghost btn-sm">
            Volver al inicio
          </Link>
          {currentUser ? (
            <Link to="/app" className="btn btn-primary btn-sm">
              Ir a mi panel
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <main className="notfound-main">
        <div className="notfound-visual" aria-hidden="true">
          <span className="notfound-orbit orbit-one" />
          <span className="notfound-orbit orbit-two" />
          <span className="notfound-spark">
            <Sparkles size={26} />
          </span>
          <strong>404</strong>
        </div>
        <span className="eyebrow-pill soft">
          <Compass size={14} /> Página no encontrada
        </span>
        <h1>Esta página todavía no se ha forjado.</h1>
        <p>
          El enlace puede estar mal escrito o la página puede haberse movido. Volvamos a un lugar
          conocido y sigamos construyendo.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
          <Link
            to={currentUser ? '/app' : '/login'}
            className="btn btn-secondary"
          >
            {currentUser ? 'Ir a mi panel' : 'Explorar Forge'} <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
