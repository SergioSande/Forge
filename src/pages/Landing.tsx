import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Search,
  Send,
  Sparkles,
  Star,
  UserRound,
  Zap,
} from 'lucide-react';
import { useStore } from '../store/AppStore';
import { ProjectCard } from '../components/ProjectCard';
import { Logo } from '../components/ui';
import { WelcomeModal } from '../components/WelcomeModal';
import { WELCOME_KEY } from '../lib/constants';
import { findCompany } from '../lib/utils';
import type { Role } from '../types';

export function Landing() {
  const { state, currentUser } = useStore();
  const navigate = useNavigate();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    if (currentUser) return;
    if (localStorage.getItem(WELCOME_KEY)) return;
    const timer = window.setTimeout(() => setWelcomeOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, [currentUser]);

  const markWelcomeSeen = () => {
    localStorage.setItem(WELCOME_KEY, '1');
    setWelcomeOpen(false);
  };

  const chooseRole = (role: Role) => {
    markWelcomeSeen();
    navigate(`/registro?rol=${role === 'student' ? 'estudiante' : 'empresa'}`);
  };

  const startAs = (role: Role) => {
    if (currentUser) {
      navigate('/app');
      return;
    }
    navigate(`/registro?rol=${role === 'student' ? 'estudiante' : 'empresa'}`);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const featured = state.projects
    .filter((project) => project.status === 'open' && !project.archived)
    .slice(0, 3);

  const companyNames = state.users
    .filter((user) => user.role === 'company')
    .slice(0, 6);

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Logo />
          <nav className="landing-nav" aria-label="Secciones">
            <button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button>
            <button onClick={() => scrollTo('estudiantes')}>Para estudiantes</button>
            <button onClick={() => scrollTo('empresas')}>Para empresas</button>
          </nav>
          <div className="landing-header-actions">
            {currentUser ? (
              <Link to="/app" className="btn btn-primary btn-sm">
                Ir a mi panel <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="btn btn-primary btn-sm">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-bg" aria-hidden="true">
            <span className="hero-blob blob-one" />
            <span className="hero-blob blob-two" />
            <span className="hero-grid" />
          </div>
          <div className="landing-container hero-inner">
            <div className="hero-copy">
              <span className="eyebrow-pill">
                <Sparkles size={14} /> Talento emergente · Proyectos reales
              </span>
              <h1>
                Tu primera experiencia empieza con un <span className="highlight">proyecto real</span>.
              </h1>
              <p className="hero-lead">
                Forge conecta a estudiantes sin experiencia laboral con empresas que necesitan
                ideas frescas. Tú pones el talento, ellas el reto. El resultado se llama
                experiencia.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => startAs('student')}>
                  <GraduationCap size={19} />
                  Busco mi primera oportunidad
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => startAs('company')}>
                  <Building2 size={19} />
                  Busco talento para mi reto
                </button>
              </div>
              <div className="hero-trust">
                <div className="avatar-stack" aria-hidden="true">
                  <span style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>LF</span>
                  <span style={{ background: 'linear-gradient(135deg,#38bdf8,#0284c7)' }}>MR</span>
                  <span style={{ background: 'linear-gradient(135deg,#818cf8,#4f46e5)' }}>AS</span>
                  <span style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>DN</span>
                </div>
                <div>
                  <div className="trust-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={13} fill="currentColor" />
                    ))}
                    <strong>4,9</strong>
                  </div>
                  <span>+600 estudiantes ya están forjando su futuro</span>
                </div>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="visual-glow" />
              <div className="orbit-ring orbit-ring-one" />
              <div className="orbit-ring orbit-ring-two" />

              <div className="mock-card mock-main">
                <div className="mock-card-head">
                  <div className="mock-company">
                    <span className="mock-logo">N</span>
                    <span>Nebula Labs</span>
                  </div>
                  <span className="match-badge match-high">
                    <Sparkles size={13} /> 96% match
                  </span>
                </div>
                <div className="mock-category">Energía solar · Data & IA</div>
                <h3>Detector de anomalías para parques solares</h3>
                <p>Anticipa caídas de rendimiento antes de que cuesten dinero.</p>
                <div className="mock-tags">
                  <span>Python</span>
                  <span>Machine Learning</span>
                  <span>Híbrido</span>
                </div>
                <div className="mock-meta">
                  <span>1.200 €</span>
                  <span>·</span>
                  <span>8 semanas</span>
                  <span>·</span>
                  <span>24 días restantes</span>
                </div>
                <div className="mock-card-foot">
                  <div className="mock-avatars">
                    <span style={{ background: 'linear-gradient(135deg,#818cf8,#4f46e5)' }}>IF</span>
                    <span style={{ background: 'linear-gradient(135deg,#22d3ee,#0891b2)' }}>HP</span>
                    <span style={{ background: 'linear-gradient(135deg,#60a5fa,#2563eb)' }}>LF</span>
                  </div>
                  <span>3 soluciones recibidas</span>
                  <span className="mock-arrow">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>

              <div className="mock-card mock-float mock-profile">
                <div className="mock-profile-top">
                  <span className="float-avatar">LF</span>
                  <div>
                    <strong>Lucía Ferrer</strong>
                    <span>Grado en IA · UPM</span>
                  </div>
                  <span className="float-match">96%</span>
                </div>
                <div className="mock-tags small">
                  <span>Python</span>
                  <span>ML</span>
                  <span>React</span>
                </div>
              </div>

              <div className="mock-card mock-float mock-sent">
                <span className="sent-icon">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <strong>Solución enviada</strong>
                  <span>hace 2 minutos</span>
                </div>
              </div>

              <div className="mock-card mock-float mock-new">
                <span className="new-ring">92%</span>
                <div>
                  <strong>Nuevo match</strong>
                  <span>Quantum Works</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="logos-band">
          <div className="landing-container">
            <p>Equipos que ya buscan talento en Forge</p>
            <div className="logo-cloud">
              {companyNames.map((company) => (
                <span key={company.id} className="company-wordmark">
                  <span className="wordmark-dot" />
                  {company.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block" id="como-funciona">
          <div className="landing-container">
            <div className="section-heading centered">
              <span className="eyebrow-pill soft">
                <Zap size={14} /> Cómo funciona
              </span>
              <h2>De «no tengo experiencia» a «mira lo que hice».</h2>
              <p>
                Un puente directo entre lo que estás aprendiendo y los problemas que las empresas
                necesitan resolver. Sin procesos eternos, sin experiencia previa.
              </p>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <span className="step-number">01</span>
                <span className="step-icon">
                  <UserRound size={24} />
                </span>
                <h3>Crea tu perfil</h3>
                <p>
                  Cuéntanos qué estudias, qué sabes hacer, dónde estás y qué te gustaría probar.
                  Un perfil completo abre más puertas.
                </p>
              </div>
              <div className="step-card">
                <span className="step-number">02</span>
                <span className="step-icon">
                  <Search size={24} />
                </span>
                <h3>Encuentra tu match</h3>
                <p>
                  Cruzamos tus habilidades e intereses con retos reales. Cada proyecto llega con
                  un porcentaje de afinidad para que sepas por dónde empezar.
                </p>
              </div>
              <div className="step-card">
                <span className="step-number">03</span>
                <span className="step-icon">
                  <Send size={24} />
                </span>
                <h3>Demuestra lo que sabes</h3>
                <p>
                  Envía una solución, recibe feedback y consigue una experiencia que puedas
                  enseñar. La empresa decide con tu trabajo delante.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="featured-section">
          <div className="landing-container">
            <div className="section-heading split">
              <div>
                <span className="eyebrow-pill soft">
                  <Sparkles size={14} /> Retos abiertos
                </span>
                <h2>Problemas reales. Mentes con ganas.</h2>
                <p>Estos son algunos de los retos que buscan solución ahora mismo.</p>
              </div>
              <Link to="/login" className="text-link">
                Ver todos los retos <ArrowRight size={16} />
              </Link>
            </div>

            <div className="project-grid">
              {featured.map((project) => {
                const company = findCompany(state.users, project.companyId);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    company={company}
                    landing
                    solutionCount={
                      state.solutions.filter(
                        (solution) => solution.projectId === project.id,
                      ).length
                    }
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="audiences-section">
          <div className="landing-container">
            <div className="audience-grid">
              <div className="audience-card audience-student" id="estudiantes">
                <span className="eyebrow-pill soft">
                  <GraduationCap size={14} /> Para estudiantes
                </span>
                <h2>Tu primer proyecto no se espera. Se construye.</h2>
                <p>
                  Da igual que no tengas experiencia laboral. Aquí lo que cuenta es cómo piensas y
                  lo que eres capaz de crear cuando alguien te da la oportunidad.
                </p>
                <ul className="check-list">
                  <li>
                    <CheckCircle2 size={18} /> Retos reales de empresas, con contexto y feedback.
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> Matching por habilidades e intereses, no por CV.
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> Un perfil que demuestra lo que ya sabes hacer.
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> Experiencia y una red de contactos desde el primer día.
                  </li>
                </ul>
                <button className="btn btn-primary" onClick={() => startAs('student')}>
                  Crear mi perfil de estudiante <ArrowRight size={16} />
                </button>
              </div>

              <div className="audience-card audience-company" id="empresas">
                <span className="eyebrow-pill on-blue">
                  <Building2 size={14} /> Para empresas
                </span>
                <h2>Ideas nuevas para problemas que llevan tiempo esperando.</h2>
                <p>
                  Publica un reto concreto y descubre cómo lo abordan mentes que vienen sin los
                  vicios de «siempre se ha hecho así».
                </p>
                <ul className="check-list light">
                  <li>
                    <CheckCircle2 size={18} /> Talento junior con ganas de demostrar y aprender.
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> Soluciones frescas en semanas, no en meses.
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> Publica gratis y decide con propuestas delante.
                  </li>
                  <li>
                    <CheckCircle2 size={18} /> Un canal nuevo para descubrir perfiles que encajan.
                  </li>
                </ul>
                <button className="btn btn-white" onClick={() => startAs('company')}>
                  Publicar mi primer reto <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="landing-container stats-inner">
            <div className="stat-block">
              <strong>600+</strong>
              <span>estudiantes con ganas</span>
            </div>
            <div className="stat-block">
              <strong>35</strong>
              <span>empresas publicando retos</span>
            </div>
            <div className="stat-block">
              <strong>120+</strong>
              <span>retos convertidos en experiencia</span>
            </div>
            <div className="stat-block">
              <strong>94%</strong>
              <span>volvería a repetir</span>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="landing-container">
            <div className="final-cta-card">
              <div>
                <span className="eyebrow-pill soft">
                  <Sparkles size={14} /> Menos «sin experiencia», más «mira lo que hice»
                </span>
                <h2>Forja tu siguiente paso.</h2>
                <p>
                  Tanto si buscas tu primera oportunidad como si buscas a la persona que la va a
                  aprovechar: aquí empieza.
                </p>
              </div>
              <div className="final-cta-actions">
                <button className="btn btn-primary btn-lg" onClick={() => startAs('student')}>
                  Soy estudiante
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => startAs('company')}>
                  Soy empresa
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-brand">
            <Logo small />
            <p>Talento emergente, proyectos reales. Aprender haciendo, desde el primer día.</p>
          </div>
          <div className="footer-links">
            <button onClick={() => scrollTo('como-funciona')}>Cómo funciona</button>
            <button onClick={() => scrollTo('estudiantes')}>Estudiantes</button>
            <button onClick={() => scrollTo('empresas')}>Empresas</button>
            <Link to="/login">Iniciar sesión</Link>
          </div>
          <div className="footer-meta">
            <span>© 2026 Forge</span>
            <span>Hecho para aprender haciendo.</span>
          </div>
        </div>
      </footer>

      <WelcomeModal
        open={welcomeOpen}
        onClose={() => {
          markWelcomeSeen();
        }}
        onChooseRole={chooseRole}
      />
    </div>
  );
}
