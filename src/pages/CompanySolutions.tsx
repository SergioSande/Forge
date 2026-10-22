import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  FolderKanban,
  Inbox,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { Company, SolutionStatus, Student } from '../types';
import { useStore } from '../store/AppStore';
import { matchScore, timeAgo } from '../lib/utils';
import {
  Avatar,
  EmptyState,
  MatchBadge,
  PageHeader,
  StatusBadge,
} from '../components/ui';

type Filter = 'all' | SolutionStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Nuevas' },
  { id: 'shortlisted', label: 'Preseleccionadas' },
  { id: 'accepted', label: 'Aceptadas' },
  { id: 'discarded', label: 'Descartadas' },
];

export function CompanySolutions() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  if (currentUser.role !== 'company') return <Navigate to="/app/mis-proyectos" replace />;
  return <CompanySolutionsContent company={currentUser} />;
}

function CompanySolutionsContent({ company }: { company: Company }) {
  const { state } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  const ownProjects = state.projects.filter((project) => project.companyId === company.id);
  const projectIds = new Set(ownProjects.map((project) => project.id));
  const ownSolutions = useMemo(
    () =>
      state.solutions
        .filter((solution) => projectIds.has(solution.projectId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.solutions, company.id],
  );

  const counts: Record<Filter, number> = {
    all: ownSolutions.length,
    pending: ownSolutions.filter((solution) => solution.status === 'pending').length,
    shortlisted: ownSolutions.filter((solution) => solution.status === 'shortlisted').length,
    accepted: ownSolutions.filter((solution) => solution.status === 'accepted').length,
    discarded: ownSolutions.filter((solution) => solution.status === 'discarded').length,
  };

  const visible = ownSolutions.filter((solution) => {
    if (filter !== 'all' && solution.status !== filter) return false;
    if (projectFilter !== 'all' && solution.projectId !== projectFilter) return false;
    if (!query.trim()) return true;
    const student = state.users.find((user) => user.id === solution.studentId);
    const project = state.projects.find((item) => item.id === solution.projectId);
    return [solution.title, solution.description, student?.name ?? '', project?.title ?? '']
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });

  return (
    <>
      <PageHeader
        eyebrow="Soluciones recibidas"
        title="Las ideas que han llegado"
        description="Todas las propuestas de tus estudiantes, reunidas en un único lugar. Revisa el enfoque, visita su perfil y decide con quién seguir."
        action={
          <Link to="/app/mis-proyectos" className="btn btn-secondary">
            <FolderKanban size={17} /> Mis proyectos
          </Link>
        }
      />

      <section className="company-solutions-summary">
        <div className="workspace-stat">
          <span className="stat-icon sky">
            <Inbox size={18} />
          </span>
          <div>
            <strong>{ownSolutions.length}</strong>
            <span>soluciones totales</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon mint">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>{counts.pending}</strong>
            <span>{counts.pending === 1 ? 'nueva por revisar' : 'nuevas por revisar'}</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon lilac">
            <FileCheck2 size={18} />
          </span>
          <div>
            <strong>{counts.accepted}</strong>
            <span>{counts.accepted === 1 ? 'propuesta aceptada' : 'propuestas aceptadas'}</span>
          </div>
        </div>
      </section>

      <div className="solutions-filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por estudiante, propuesta o proyecto..."
            aria-label="Buscar soluciones"
          />
        </div>
        <select
          className="solution-project-select"
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          aria-label="Filtrar por proyecto"
        >
          <option value="all">Todos los proyectos</option>
          {ownProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      <div className="applications-toolbar">
        <div className="tab-row" role="tablist">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={filter === item.id}
              className={`tab-btn ${filter === item.id ? 'active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span className="tab-count">{counts[item.id]}</span>
            </button>
          ))}
        </div>
        <span className="toolbar-note">
          {visible.length} {visible.length === 1 ? 'solución' : 'soluciones'}
        </span>
      </div>

      {visible.length ? (
        <div className="company-solutions-list">
          {visible.map((solution) => {
            const student = state.users.find(
              (user): user is Student =>
                user.id === solution.studentId && user.role === 'student',
            );
            const project = state.projects.find(
              (item) => item.id === solution.projectId,
            );
            if (!student || !project) return null;
            const score = matchScore(student, project);
            return (
              <article className="company-solution-card" key={solution.id}>
                <div className="company-solution-side">
                  <Link to={`/app/u/${student.id}`} className="company-solution-student">
                    <Avatar user={student} size="md" />
                    <div>
                      <strong>
                        {student.name} {student.surname}
                      </strong>
                      <span>{student.degree}</span>
                      <small>{student.university}</small>
                    </div>
                  </Link>
                  <MatchBadge score={score} />
                </div>

                <div className="company-solution-main">
                  <div className="company-solution-top">
                    <div>
                      <span className="solution-project-name">{project.title}</span>
                      <h3>{solution.title}</h3>
                    </div>
                    <StatusBadge status={solution.status} />
                  </div>
                  <p>{solution.description}</p>
                  <div className="company-solution-meta">
                    <span>
                      <CalendarDays size={14} /> Enviada {timeAgo(solution.createdAt)}
                    </span>
                    {solution.link && (
                      <a
                        href={`https://${solution.link.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link inline-link"
                      >
                        Ver propuesta <ExternalLink size={13} />
                      </a>
                    )}
                    {solution.deliveryLink && (
                      <a
                        href={`https://${solution.deliveryLink.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link inline-link"
                      >
                        Ver entrega final <FileCheck2 size={13} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="company-solution-actions">
                  <Link to={`/app/u/${student.id}`} className="btn btn-ghost btn-sm">
                    <UserRound size={14} /> Ver perfil
                  </Link>
                  <Link
                    to={`/app/proyectos/${project.id}`}
                    className="btn btn-soft btn-sm"
                  >
                    Revisar en el reto <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Inbox size={26} />}
          title="No hay soluciones con esos filtros"
          description="Prueba a cambiar el proyecto o el estado. Las propuestas de tus estudiantes aparecerán aquí en cuanto lleguen."
          action={
            <button
              className="btn btn-soft"
              onClick={() => {
                setFilter('all');
                setProjectFilter('all');
                setQuery('');
              }}
            >
              Limpiar filtros
            </button>
          }
        />
      )}
    </>
  );
}
