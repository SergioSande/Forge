import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store/AppStore';
import { Field, Logo } from '../components/ui';
import { DEMO_COMPANY_EMAIL, DEMO_PASSWORD, DEMO_STUDENT_EMAIL } from '../lib/constants';

export function Login() {
  const { login, notify, currentUser } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) navigate('/app', { replace: true });
  }, [currentUser, navigate]);

  const doLogin = (loginEmail: string, loginPassword: string) => {
    setError('');
    setSubmitting(true);
    const result = login(loginEmail, loginPassword);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo iniciar sesión.');
      return;
    }
    notify(`Hola de nuevo, ${result.user?.name}. Nos alegra verte por aquí.`, 'success');
    navigate('/app');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Escribe tu email para continuar.');
      return;
    }
    if (!password) {
      setError('Escribe tu contraseña para continuar.');
      return;
    }
    doLogin(email, password);
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo />
        <div className="auth-header-links">
          <Link to="/" className="text-link muted">
            Volver al inicio
          </Link>
          <Link to="/registro" className="btn btn-secondary btn-sm">
            Crear cuenta
          </Link>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-layout login-layout">
          <aside className="auth-aside login-aside">
            <div className="auth-aside-bg" aria-hidden="true">
              <span className="aside-glow glow-a" />
              <span className="aside-glow glow-b" />
              <span className="aside-grid" />
            </div>
            <div className="auth-aside-content">
              <span className="eyebrow-pill on-blue">
                <Sparkles size={14} /> Talento que se demuestra
              </span>
              <h1>La experiencia no se espera. Se empieza.</h1>
              <p>
                Vuelve a tus retos, revisa tus soluciones y sigue construyendo eso que un día
                contarás en una entrevista.
              </p>

              <div className="auth-quote">
                <div className="quote-mark">“</div>
                <p>
                  Entré sin experiencia y salí con un proyecto real en el portfolio. Lo más valioso
                  fue que alguien confiara en mí antes de tener un CV largo.
                </p>
                <div className="quote-author">
                  <span className="quote-avatar">LF</span>
                  <div>
                    <strong>Lucía Ferrer</strong>
                    <span>Estudiante de IA · UPM</span>
                  </div>
                </div>
              </div>

              <div className="aside-proof">
                <div className="mini-proof">
                  <strong>96%</strong>
                  <span>de match medio en los retos recomendados</span>
                </div>
                <div className="mini-proof">
                  <strong>120+</strong>
                  <span>proyectos que ya se convirtieron en experiencia</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="auth-card">
            <div className="auth-card-head">
              <span className="auth-kicker">Bienvenido de nuevo</span>
              <h2>Entra en Forge</h2>
              <p>Tu siguiente proyecto puede estar a un clic.</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form className="stack-form" onSubmit={handleSubmit} noValidate>
              <Field label="Email" required>
                <div className="input-with-icon">
                  <Mail size={17} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError('');
                    }}
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                </div>
              </Field>
              <Field label="Contraseña" required>
                <div className="input-with-icon has-action">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError('');
                    }}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={submitting}>
                Iniciar sesión <ArrowRight size={17} />
              </button>
            </form>

            <div className="demo-access">
              <div className="demo-divider">
                <span>o entra directo con una cuenta demo</span>
              </div>
              <div className="demo-grid">
                <button
                  className="demo-card"
                  onClick={() => doLogin(DEMO_STUDENT_EMAIL, DEMO_PASSWORD)}
                  disabled={submitting}
                >
                  <span className="demo-icon student">
                    <GraduationCap size={20} />
                  </span>
                  <span>
                    <strong>Estudiante demo</strong>
                    <small>Lucía · Grado en IA</small>
                  </span>
                </button>
                <button
                  className="demo-card"
                  onClick={() => doLogin(DEMO_COMPANY_EMAIL, DEMO_PASSWORD)}
                  disabled={submitting}
                >
                  <span className="demo-icon company">
                    <Building2 size={20} />
                  </span>
                  <span>
                    <strong>Empresa demo</strong>
                    <small>Nebula Labs · Energía</small>
                  </span>
                </button>
              </div>
              <p className="demo-hint">
                Cuentas de prueba listas para explorar la app sin registrarte.
              </p>
            </div>

            <p className="auth-foot">
              ¿Todavía no tienes cuenta? <Link to="/registro">Crea tu perfil en Forge</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
