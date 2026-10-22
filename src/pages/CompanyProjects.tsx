import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock,
  Inbox,
  Plus,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import type { Company, Project } from '../types';
import { useStore } from '../store/AppStore';
import { deadlineLabel, timeAgo } from '../lib/utils';
import { Avatar, EmptyState, PageHeader } from '../components/ui';
import { ProjectFormModal } from '../components/ProjectFormModal';

export function CompanyProjects() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  if (currentUser.role !== 'company') return <Navigate to="/app/explorar" replace />;
  return <CompanyProjectsContent company={currentUser} />;
}

function CompanyProjectsContent({ company }: { company: Company }) {
  const { state, setProjectArchived, notify } = useStore();
  const navigate = useNavigate();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const ownProjects = state.projects
    .filter((project) => project.companyId === company.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const activeProjects = ownProjects.filter((project) => !project.archived);
  const archivedProjects = ownProjects.filter((project) => project.archived);
  const projectIds = new Set(ownProjects.map((project) => project.id));
  const ownSolutions = state.solutions.filter((solution) => projectIds.has(solution.projectId));
  const pendingSolutions = ownSolutions.filter((solution) => solution.status === 'pending').length;
  const uniqueStudents = new Set(ownSolutions.map((solution) => solution.studentId)).size;

  const toggleArchive = (project: Project) => {
    setProjectArchived(project.id, !project.archived);
    notify(
      project.archived
        ? 'Proyecto reactivado y visible de nuevo.'
        : 'Proyecto archivado. Puedes recuperarlo cuando quieras.',
      'info',
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Espacio de empresa"
        title="Tus proyectos"
        description="Todo lo que has puesto en juego y las soluciones que están llegando. Haz clic en un reto para revisarlas."
        action={
          <button className="btn btn-primary" onClick={() => setProjectModalOpen(true)}>
            <Plus size={17} /> Publicar proyecto
          </button>
        }
      />

      <section className="company-summary-row">
        <div className="summary-pill">
          <span className="stat-icon sky">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>{activeProjects.length}</strong>
            <span>proyectos activos</span>
          </div>
        </div>
        <div className="summary-pill">
          <span className="stat-icon mint">
            <Inbox size={18} />
          </span>
          <div>
            <strong>{ownSolutions.length}</strong>
            <span>soluciones recibidas</span>
          </div>
        </div>
        <div className="summary-pill">
          <span className="stat-icon lilac">
            <Users size={18} />
          </span>
          <div>
            <strong>{uniqueStudents}</strong>
            <span>estudiantes interesados</span>
          </div>
        </div>
        {pendingSolutions > 0 && (
          <div className="summary-pill highlight">
            <span className="dot" />
            <div>
              <strong>{pendingSolutions}</strong>
              <span>{pendingSolutions === 1 ? 'nueva sin revisar' : 'nuevas sin revisar'}</span>
            </div>
          </div>
        )}
      </section>

      {activeProjects.length ? (
        <div className="company-projects-grid wide">
          {activeProjects.map((project) => (
            <CompanyProjectRow
              key={project.id}
              project={project}
              solutions={state.solutions.filter(
                (solution) => solution.projectId === project.id,
              )}
              onClick={() => navigate(`/app/proyectos/${project.id}`)}
              onToggleArchive={() => toggleArchive(project)}
              users={state.users}
            />
          ))}
          <button className="new-project-tile" onClick={() => setProjectModalOpen(true)}>
            <span className="new-project-icon">
              <Plus size={24} />
            </span>
            <h3>Publicar un nuevo reto</h3>
            <p>Un problema concreto de tu equipo puede ser el primer proyecto real de alguien.</p>
            <span className="new-project-cta">
              Crear proyecto <ArrowRight size={15} />
            </span>
          </button>
        </div>
      ) : (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="Aquí empieza tu primer reto"
          description="Publica un problema real, cuenta qué buscas y deja que el talento joven te sorprenda con propuestas frescas."
          action={
            <button className="btn btn-primary" onClick={() => setProjectModalOpen(true)}>
              <Plus size={16} /> Publicar mi primer proyecto
            </button>
          }
        />
      )}

      {archivedProjects.length > 0 && (
        <section className="archive-section">
          <button
            className={`archive-toggle ${showArchived ? 'open' : ''}`}
            onClick={() => setShowArchived((value) => !value)}
            aria-expanded={showArchived}
          >
            <span>
              <Archive size={16} /> Proyectos archivados
              <span className="archive-count">{archivedProjects.length}</span>
            </span>
            <ChevronDown size={16} />
          </button>

          {showArchived && (
            <div className="archived-content">
              <div className="company-projects-grid wide">
                {archivedProjects.map((project) => (
                  <CompanyProjectRow
                    key={project.id}
                    project={project}
                    solutions={state.solutions.filter(
                      (solution) => solution.projectId === project.id,
                    )}
                    onClick={() => navigate(`/app/proyectos/${project.id}`)}
                    onToggleArchive={() => toggleArchive(project)}
                    users={state.users}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="info-banner">
        <div className="info-banner-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <strong>Un buen reto atrae buenas soluciones</strong>
          <p>
            Explica el contexto, lo que ya has probado y qué esperas aprender. Los estudiantes
            no necesitan un briefing perfecto, necesitan un problema real.
          </p>
        </div>
        <Link to="/app/comunidad" className="btn btn-white btn-sm">
          Explorar talento <ArrowRight size={15} />
        </Link>
      </section>

      <ProjectFormModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onCreated={(project) => navigate(`/app/proyectos/${project.id}`)}
      />
    </>
  );
}

function CompanyProjectRow({
  project,
  solutions,
  users,
  onClick,
  onToggleArchive,
}: {
  project: Project;
  solutions: ReturnType<typeof useStore>['state']['solutions'];
  users: ReturnType<typeof useStore>['state']['users'];
  onClick: () => void;
  onToggleArchive: () => void;
}) {
  const solvers = Array.from(new Set(solutions.map((solution) => solution.studentId)))
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));
  const pending = solutions.filter((solution) => solution.status === 'pending').length;
  const accepted = solutions.filter((solution) => solution.status === 'accepted').length;

  return (
    <div
      className={`company-project-row ${project.archived ? 'archived' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="company-project-row-main">
        <div className="company-project-top">
          <span className={`open-chip ${project.archived ? 'archived' : ''}`}>
            <span className="dot" />{' '}
            {project.archived
              ? 'Archivado'
              : project.status === 'open'
                ? 'Abierto'
                : 'Cerrado'}
          </span>
          <div className="company-project-top-right">
            <span className="posted-time">Publicado {timeAgo(project.createdAt)}</span>
            <button
              type="button"
              className="archive-mini"
              onClick={(event) => {
                event.stopPropagation();
                onToggleArchive();
              }}
              title={project.archived ? 'Reactivar proyecto' : 'Archivar proyecto'}
              aria-label={project.archived ? 'Reactivar proyecto' : 'Archivar proyecto'}
            >
              {project.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            </button>
          </div>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="area-row">
          {project.areas.map((area) => (
            <span key={area} className="area-chip area-chip-soft">
              {area}
            </span>
          ))}
        </div>
        <div className="company-project-meta">
          <span>
            <Wallet size={14} /> {project.budget}
          </span>
          <span>
            <Clock size={14} /> {project.duration}
          </span>
          <span>
            <CalendarDays size={14} /> {deadlineLabel(project.deadline)}
          </span>
        </div>
      </div>

      <div className="company-project-row-side">
        <div className="solution-count-block">
          <span className="solution-count">
            {solutions.length}
            <small>{solutions.length === 1 ? 'solución' : 'soluciones'}</small>
          </span>
          {pending > 0 && <span className="pending-tag">{pending} {pending === 1 ? 'nueva' : 'nuevas'}</span>}
          {accepted > 0 && <span className="accepted-tag">{accepted} {accepted === 1 ? 'aceptada' : 'aceptadas'}</span>}
        </div>
        <div className="solvers-line">
          {solvers.length ? (
            <>
              <div className="mock-avatars">
                {solvers.slice(0, 4).map((student) => (
                  <Avatar key={student.id} user={student} size="xs" />
                ))}
              </div>
              <span>{solvers.length} {solvers.length === 1 ? 'estudiante' : 'estudiantes'}</span>
            </>
          ) : (
            <span className="no-solutions">Aún sin propuestas</span>
          )}
        </div>
        <span className="company-project-open">
          Ver soluciones <ArrowRight size={15} />
        </span>
      </div>
    </div>
  );
}
