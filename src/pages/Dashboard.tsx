import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock,
  Compass,
  Inbox,
  Plus,
  Send,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import type { Company, Student } from '../types';
import { useStore } from '../store/AppStore';
import {
  bestStudentMatch,
  findCompany,
  firstName,
  getStudentOpenProjects,
  greeting,
  matchScore,
  profileCompleteness,
  timeAgo,
  todayLong,
} from '../lib/utils';
import { Avatar, EmptyState, MatchBadge, MatchRing, StatusBadge } from '../components/ui';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectFormModal } from '../components/ProjectFormModal';

function dateEyebrow() {
  const label = todayLong();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function Dashboard() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  return currentUser.role === 'student' ? (
    <StudentDashboard student={currentUser} />
  ) : (
    <CompanyDashboard company={currentUser} />
  );
}

function StudentDashboard({ student }: { student: Student }) {
  const { state } = useStore();

  const scored = useMemo(
    () =>
      getStudentOpenProjects(student, state.projects)
        .map((project) => ({ project, score: matchScore(student, project) }))
        .sort((a, b) => b.score - a.score),
    [state.projects, student],
  );

  const top = scored.slice(0, 3);
  const mySolutions = state.solutions
    .filter((solution) => solution.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeApplications = mySolutions.filter((solution) => solution.status !== 'discarded');
  const compatibleCount = scored.filter((item) => item.score >= 70).length;
  const completeness = profileCompleteness(student);
  const best = scored[0];

  const suggestedCompanies = Array.from(
    new Map(
      top
        .map(({ project }) =>
          findCompany(state.users, project.companyId),
        )
        .filter((company): company is Company => Boolean(company))
        .map((company) => [company.id, company]),
    ).values(),
  ).slice(0, 3);

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">{dateEyebrow()}</p>
          <h1>
            {greeting()}, {firstName(student.name)} <span className="wave">👋</span>
          </h1>
          <p className="page-subtitle">
            Tu talento tiene sitio. Esto es lo que mejor encaja contigo hoy.
          </p>
        </div>
        <div className="page-header-action">
          <Link to="/app/explorar" className="btn btn-secondary">
            <Compass size={17} /> Explorar retos
          </Link>
        </div>
      </div>

      <section className="dash-hero student-hero">
        <div className="dash-hero-bg" aria-hidden="true">
          <span className="hero-orbit" />
          <span className="hero-glow-dot" />
        </div>
        <div className="dash-hero-copy">
          <span className="hero-chip">
            <Sparkles size={14} /> Tu siguiente paso
          </span>
          <h2>Tu primer proyecto real está a un match.</h2>
          <p>
            {compatibleCount > 0 ? (
              <>
                Hemos encontrado{' '}
                <strong>
                  {compatibleCount} {compatibleCount === 1 ? 'reto' : 'retos'} muy{' '}
                  {compatibleCount === 1 ? 'compatible' : 'compatibles'}
                </strong>{' '}
                contigo. Elige uno, propone una idea y empieza a construir experiencia.
              </>
            ) : (
              <>
                Todavía no hay retos con un encaje muy alto, pero abajo tienes los que más se
                acercan a tu perfil. Complétalo o explora para encontrar tu primera oportunidad.
              </>
            )}
          </p>
          <div className="hero-action-row">
            <Link to="/app/explorar" className="btn btn-primary">
              Ver mis matches <ArrowRight size={16} />
            </Link>
            <Link to="/app/perfil" className="btn btn-white">
              Completar mi perfil
            </Link>
          </div>
        </div>

        {best && (
          <div className="student-hero-card">
            <div className="student-hero-card-top">
              <span className="hero-card-label">Mejor match de hoy</span>
              <MatchRing score={best.score} size="sm" />
            </div>
            <div className="company-mini">
              {(() => {
                const company = findCompany(state.users, best.project.companyId);
                return company ? (
                  <>
                    <Avatar user={company} size="xs" />
                    <span>{company.name}</span>
                  </>
                ) : null;
              })()}
            </div>
            <h3>{best.project.title}</h3>
            <div className="mock-tags small">
              {best.project.skills.slice(0, 3).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
            <div className="student-hero-card-foot">
              <span>{best.project.budget} · {best.project.duration}</span>
              <Link to={`/app/proyectos/${best.project.id}`} className="round-arrow">
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-icon sky">
            <Target size={20} />
          </span>
          <div>
            <strong>{compatibleCount}</strong>
            <span>retos muy compatibles</span>
          </div>
          <Link to="/app/explorar" className="stat-link" aria-label="Ver retos compatibles">
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="stat-card">
          <span className="stat-icon mint">
            <Send size={20} />
          </span>
          <div>
            <strong>{activeApplications.length}</strong>
            <span>postulaciones activas</span>
          </div>
          <Link to="/app/postulaciones" className="stat-link" aria-label="Ver postulaciones">
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="stat-card stat-card-progress">
          <span className="stat-icon lilac">
            <BadgeCheck size={20} />
          </span>
          <div>
            <strong>{completeness}%</strong>
            <span>perfil completado</span>
            <div className="mini-progress">
              <span style={{ width: `${completeness}%` }} />
            </div>
          </div>
          <Link to="/app/perfil" className="stat-link" aria-label="Editar perfil">
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="content-section">
        <div className="section-title-row">
          <div>
            <h2>Recomendados para ti</h2>
            <p>Ordenados por afinidad con tu perfil, no por fecha de publicación.</p>
          </div>
          <Link to="/app/explorar" className="text-link">
            Ver todos <ArrowRight size={15} />
          </Link>
        </div>

        {top.length ? (
          <div className="project-grid three">
            {top.map(({ project, score }) => {
              const company = findCompany(state.users, project.companyId);
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  company={company}
                  match={score}
                  solutionCount={
                    state.solutions.filter((solution) => solution.projectId === project.id)
                      .length
                  }
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Compass size={26} />}
            title="Todavía no hay retos abiertos"
            description="Estamos preparando nuevos proyectos. Mientras tanto, completa tu perfil para que el matching sea más preciso."
            action={
              <Link to="/app/perfil" className="btn btn-primary">
                Completar perfil
              </Link>
            }
          />
        )}
      </section>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Tus postulaciones</h2>
              <p>El pulso de tus soluciones enviadas.</p>
            </div>
            <Link to="/app/postulaciones" className="text-link">
              Ver todas <ArrowRight size={15} />
            </Link>
          </div>

          {mySolutions.length ? (
            <div className="activity-list">
              {mySolutions.slice(0, 3).map((solution) => {
                const project = state.projects.find((item) => item.id === solution.projectId);
                if (!project) return null;
                const company = findCompany(state.users, project.companyId);
                return (
                  <Link
                    key={solution.id}
                    to={`/app/proyectos/${project.id}`}
                    className="activity-row"
                  >
                    {company && <Avatar user={company} size="sm" />}
                    <div className="activity-copy">
                      <strong>{project.title}</strong>
                      <span>
                        {company?.name} · enviada {timeAgo(solution.createdAt)}
                      </span>
                    </div>
                    <StatusBadge status={solution.status} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Send size={24} />}
              title="Aún no has enviado ninguna solución"
              description="Encuentra un reto que te inspire y cuéntale a la empresa cómo lo abordarías."
              action={
                <Link to="/app/explorar" className="btn btn-soft btn-sm">
                  Explorar retos
                </Link>
              }
            />
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Empresas que encajan</h2>
              <p>Equipos detrás de tus mejores matches.</p>
            </div>
            <Link to="/app/comunidad" className="text-link">
              Comunidad <ArrowRight size={15} />
            </Link>
          </div>

          {suggestedCompanies.length ? (
            <div className="company-suggest-list">
              {suggestedCompanies.map((company) => {
                const openProjects = state.projects.filter(
                  (project) => project.companyId === company.id && project.status === 'open',
                ).length;
                return (
                  <Link key={company.id} to={`/app/u/${company.id}`} className="company-suggest">
                    <Avatar user={company} size="md" />
                    <div>
                      <strong>{company.name}</strong>
                      <span>{company.sector}</span>
                    </div>
                    <span className="open-count">
                      {openProjects} {openProjects === 1 ? 'reto' : 'retos'}
                    </span>
                    <ArrowRight size={15} className="chevron" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Building2 size={24} />}
              title="Descubre la comunidad"
              description="Explora empresas y estudiantes que ya forman parte de Forge."
              action={
                <Link to="/app/comunidad" className="btn btn-soft btn-sm">
                  Ir a la comunidad
                </Link>
              }
            />
          )}
        </section>
      </div>
    </>
  );
}

function CompanyDashboard({ company }: { company: Company }) {
  const { state } = useStore();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const navigate = useNavigate();

  const ownProjects = state.projects
    .filter((project) => project.companyId === company.id && !project.archived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const projectIds = new Set(ownProjects.map((project) => project.id));
  const ownSolutions = state.solutions
    .filter((solution) => projectIds.has(solution.projectId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const newSolutions = ownSolutions.filter((solution) => solution.status === 'pending').length;
  const activeProjects = ownProjects.filter((project) => project.status === 'open').length;

  const students = state.users.filter((user): user is Student => user.role === 'student');
  const talent = students
    .map((student) => ({
      student,
      score: bestStudentMatch(student, company, state.projects),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const recentSolutions = ownSolutions.slice(0, 4);

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">{dateEyebrow()}</p>
          <h1>
            Hola de nuevo, {company.name} <span className="wave">👋</span>
          </h1>
          <p className="page-subtitle">
            Un vistazo a tus retos, las soluciones recibidas y el talento que ya está llamando a
            la puerta.
          </p>
        </div>
        <div className="page-header-action">
          <button className="btn btn-primary" onClick={() => setProjectModalOpen(true)}>
            <Plus size={17} /> Publicar proyecto
          </button>
        </div>
      </div>

      <section className="dash-hero company-hero">
        <div className="dash-hero-bg" aria-hidden="true">
          <span className="hero-orbit" />
          <span className="hero-glow-dot" />
        </div>
        <div className="dash-hero-copy">
          <span className="hero-chip">
            <Sparkles size={14} /> Talento que llega con ideas
          </span>
          <h2>El siguiente gran reto puede empezar con una mirada nueva.</h2>
          <p>
            Publica lo que necesitas resolver y descubre cómo lo abordan estudiantes con
            formación, hambre y ganas de demostrar. Sin procesos interminables.
          </p>
          <div className="hero-action-row">
            <button className="btn btn-primary" onClick={() => setProjectModalOpen(true)}>
              <Plus size={16} /> Publicar un reto
            </button>
            <Link to="/app/mis-proyectos" className="btn btn-white">
              Ver mis proyectos
            </Link>
          </div>
        </div>

        <div className="company-hero-visual">
          <div className="inbox-mock">
            <div className="inbox-head">
              <span>
                <Inbox size={15} /> Soluciones recientes
              </span>
              <span className="count-pill">{newSolutions} {newSolutions === 1 ? 'nueva' : 'nuevas'}</span>
            </div>
            {recentSolutions.length ? (
              recentSolutions.slice(0, 2).map((solution) => {
                const student = state.users.find((user) => user.id === solution.studentId);
                const project = state.projects.find((item) => item.id === solution.projectId);
                if (!student || !project) return null;
                return (
                  <div key={solution.id} className="inbox-row">
                    <Avatar user={student} size="xs" />
                    <div>
                      <strong>
                        {student.role === 'student' ? `${student.name} ${student.surname}` : student.name}
                      </strong>
                      <span>{project.title}</span>
                    </div>
                    <span className="inbox-time">{timeAgo(solution.createdAt)}</span>
                  </div>
                );
              })
            ) : (
              <div className="inbox-empty">
                <Inbox size={22} />
                <span>Aún no hay soluciones. Publica un reto para empezar.</span>
              </div>
            )}
            <Link to="/app/mis-proyectos" className="inbox-foot">
              Ver todas las soluciones <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-icon sky">
            <Target size={20} />
          </span>
          <div>
            <strong>{activeProjects}</strong>
            <span>proyectos activos</span>
          </div>
          <Link to="/app/mis-proyectos" className="stat-link" aria-label="Ver proyectos">
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="stat-card">
          <span className="stat-icon mint">
            <Inbox size={20} />
          </span>
          <div>
            <strong>{ownSolutions.length}</strong>
            <span>soluciones recibidas</span>
          </div>
          <span className="stat-note">{newSolutions} {newSolutions === 1 ? 'nueva' : 'nuevas'}</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon lilac">
            <Sparkles size={20} />
          </span>
          <div>
            <strong>{talent.length ? talent[0].score : 0}%</strong>
            <span>mejor afinidad de talento</span>
          </div>
          <Link to="/app/comunidad" className="stat-link" aria-label="Ver estudiantes">
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="content-section">
        <div className="section-title-row">
          <div>
            <h2>Tus proyectos</h2>
            <p>Un vistazo rápido a los retos que tienes en marcha.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setProjectModalOpen(true)}>
            <Plus size={15} /> Añadir reto
          </button>
        </div>

        {ownProjects.length ? (
          <div className="company-projects-grid">
            {ownProjects.slice(0, 4).map((project) => {
              const solutions = state.solutions.filter(
                (solution) => solution.projectId === project.id,
              );
              const solvers = Array.from(
                new Set(solutions.map((solution) => solution.studentId)),
              )
                .map((id) => state.users.find((user) => user.id === id))
                .filter((user): user is NonNullable<typeof user> => Boolean(user))
                .slice(0, 3);
              return (
                <Link
                  key={project.id}
                  to={`/app/proyectos/${project.id}`}
                  className="company-project-card"
                >
                  <div className="company-project-top">
                    <span className="open-chip">
                      <span className="dot" /> {project.status === 'open' ? 'Abierto' : 'Cerrado'}
                    </span>
                    <span className="posted-time">{timeAgo(project.createdAt)}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="company-project-stats">
                    <span>
                      <Inbox size={14} /> {solutions.length}{' '}
                      {solutions.length === 1 ? 'solución' : 'soluciones'}
                    </span>
                    <span>
                      <Wallet size={14} /> {project.budget}
                    </span>
                    <span>
                      <Clock size={14} /> {project.duration}
                    </span>
                  </div>
                  <div className="company-project-foot">
                    {solvers.length ? (
                      <div className="mock-avatars">
                        {solvers.map((student) => (
                          <Avatar key={student.id} user={student} size="xs" />
                        ))}
                        <span className="solver-note">
                          {solvers.length} {solvers.length === 1 ? 'estudiante' : 'estudiantes'}
                        </span>
                      </div>
                    ) : (
                      <span className="solver-note">Esperando la primera solución</span>
                    )}
                    <span className="card-link">
                      Ver soluciones <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Inbox size={26} />}
            title="Todavía no has publicado ningún reto"
            description="Cuéntanos qué necesitas resolver. Un reto bien planteado atrae mejores soluciones."
            action={
              <button className="btn btn-primary" onClick={() => setProjectModalOpen(true)}>
                <Plus size={16} /> Publicar mi primer reto
              </button>
            }
          />
        )}
      </section>

      <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Actividad reciente</h2>
              <p>Lo último que ha llegado a tus retos.</p>
            </div>
            <Link to="/app/mis-proyectos" className="text-link">
              Ver todo <ArrowRight size={15} />
            </Link>
          </div>

          {recentSolutions.length ? (
            <div className="activity-list">
              {recentSolutions.map((solution) => {
                const student = state.users.find((user) => user.id === solution.studentId);
                const project = state.projects.find((item) => item.id === solution.projectId);
                if (!student || !project) return null;
                return (
                  <Link
                    key={solution.id}
                    to={`/app/proyectos/${project.id}`}
                    className="activity-row"
                  >
                    <Avatar user={student} size="sm" />
                    <div className="activity-copy">
                      <strong>{solution.title}</strong>
                      <span>
                        {student.role === 'student'
                          ? `${student.name} ${student.surname}`
                          : student.name}{' '}
                        · {timeAgo(solution.createdAt)}
                      </span>
                    </div>
                    <StatusBadge status={solution.status} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox size={24} />}
              title="Sin actividad por ahora"
              description="Cuando un estudiante envíe una solución, aparecerá aquí."
            />
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Talento que encaja</h2>
              <p>Perfiles alineados con tus retos.</p>
            </div>
            <Link to="/app/comunidad" className="text-link">
              Ver talento <ArrowRight size={15} />
            </Link>
          </div>

          <div className="talent-list">
            {talent.map(({ student, score }) => (
              <Link key={student.id} to={`/app/u/${student.id}`} className="talent-row">
                <Avatar user={student} size="sm" />
                <div className="talent-copy">
                  <strong>
                    {student.name} {student.surname}
                  </strong>
                  <span>{student.degree}</span>
                </div>
                <MatchBadge score={score} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <ProjectFormModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onCreated={(project) => navigate(`/app/proyectos/${project.id}`)}
      />
    </>
  );
}
