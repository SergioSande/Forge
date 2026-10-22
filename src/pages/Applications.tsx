import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  ExternalLink,
  Inbox,
  Send,
  Sparkles,
  Wallet,
} from 'lucide-react';
import type { SolutionStatus, Student } from '../types';
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

export function Applications() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  if (currentUser.role !== 'student') return <Navigate to="/app/mis-proyectos" replace />;
  return <ApplicationsContent student={currentUser} />;
}

function ApplicationsContent({ student }: { student: Student }) {
  const { state } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const mySolutions = state.solutions
    .filter((solution) => solution.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const counts: Record<Filter, number> = {
    all: mySolutions.length,
    pending: mySolutions.filter((solution) => solution.status === 'pending').length,
    shortlisted: mySolutions.filter((solution) => solution.status === 'shortlisted').length,
    accepted: mySolutions.filter((solution) => solution.status === 'accepted').length,
    discarded: mySolutions.filter((solution) => solution.status === 'discarded').length,
  };

  const filtered =
    filter === 'all'
      ? mySolutions
      : mySolutions.filter((solution) => solution.status === filter);

  return (
    <>
      <PageHeader
        eyebrow="Tu actividad"
        title="Mis postulaciones"
        description="Cada solución que envías es una muestra de cómo piensas. Aquí puedes seguir su estado."
        action={
          <Link to="/app/explorar" className="btn btn-primary">
            <Compass size={17} /> Buscar más retos
          </Link>
        }
      />

      {counts.accepted > 0 && (
        <div className="celebration-banner">
          <span className="celebration-icon">
            <Sparkles size={20} />
          </span>
          <div>
            <strong>
              ¡Tienes {counts.accepted === 1 ? 'una solución aceptada' : `${counts.accepted} soluciones aceptadas`}!
            </strong>
            <span>
              Una empresa ha querido seguir adelante con tu propuesta. Revisa los detalles y
              prepárate para la conversación.
            </span>
          </div>
          <button
            className="btn btn-white btn-sm"
            onClick={() => setFilter('accepted')}
          >
            Ver aceptadas
          </button>
        </div>
      )}

      <div className="applications-summary">
        <div className="application-stat">
          <span className="status-dot pending" />
          <div>
            <strong>{counts.pending}</strong>
            <span>nuevas</span>
          </div>
        </div>
        <div className="application-stat">
          <span className="status-dot shortlisted" />
          <div>
            <strong>{counts.shortlisted}</strong>
            <span>preseleccionadas</span>
          </div>
        </div>
        <div className="application-stat">
          <span className="status-dot accepted" />
          <div>
            <strong>{counts.accepted}</strong>
            <span>aceptadas</span>
          </div>
        </div>
        <div className="application-stat">
          <span className="status-dot discarded" />
          <div>
            <strong>{counts.discarded}</strong>
            <span>descartadas</span>
          </div>
        </div>
      </div>

      {mySolutions.length > 0 && (
        <div className="applications-toolbar">
          <div className="tab-row" role="tablist" aria-label="Filtrar postulaciones">
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
            {filtered.length} {filtered.length === 1 ? 'solución' : 'soluciones'}
          </span>
        </div>
      )}

      {filtered.length ? (
        <div className="applications-list">
          {filtered.map((solution) => {
            const project = state.projects.find((item) => item.id === solution.projectId);
            if (!project) return null;
            const company = state.users.find(
              (user) => user.id === project.companyId && user.role === 'company',
            );
            const score = matchScore(student, project);

            return (
              <article className="application-card" key={solution.id}>
                <div className="application-card-top">
                  <div className="application-company">
                    {company && <Avatar user={company} size="sm" />}
                    <div>
                      <strong>{company?.name ?? 'Empresa'}</strong>
                      <span>{project.title}</span>
                    </div>
                  </div>
                  <StatusBadge status={solution.status} />
                </div>

                <div className="application-body">
                  <div>
                    <span className="application-kicker">
                      <Send size={13} /> Tu propuesta
                    </span>
                    <h3>{solution.title}</h3>
                    <p>{solution.description}</p>
                    {solution.link && (
                      <a
                        href={`https://${solution.link.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link inline-link"
                      >
                        Ver enlace de la propuesta <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <div className="application-score">
                    <MatchBadge score={score} />
                    <span className="score-hint">afinidad con el reto</span>
                  </div>
                </div>

                <div className="application-footer">
                  <div className="application-meta">
                    <span>
                      <CalendarDays size={14} /> Enviada {timeAgo(solution.createdAt)}
                    </span>
                    <span>
                      <Wallet size={14} /> {project.budget}
                    </span>
                    <span>{project.modality}</span>
                  </div>
                  <Link to={`/app/proyectos/${project.id}`} className="btn btn-soft btn-sm">
                    Ver proyecto <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : mySolutions.length === 0 ? (
        <EmptyState
          icon={<Inbox size={26} />}
          title="Tu bandeja de postulaciones está esperando"
          description="Cuando envíes tu primera solución, podrás seguir aquí su estado y la respuesta de la empresa."
          action={
            <Link to="/app/explorar" className="btn btn-primary">
              Descubrir retos <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon={<CheckCircle2 size={26} />}
          title="No hay postulaciones en este estado"
          description="Prueba con otro filtro para ver el resto de tus soluciones."
          action={
            <button className="btn btn-soft" onClick={() => setFilter('all')}>
              Ver todas
            </button>
          }
        />
      )}

      <section className="tips-banner">
        <div className="tips-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <strong>Un consejo para tu próxima propuesta</strong>
          <p>
            No hace falta resolver el reto entero en el mensaje. Cuenta cómo lo abordarías, qué
            harías primero y qué te gustaría aprender. La claridad vale más que la perfección.
          </p>
        </div>
      </section>
    </>
  );
}
