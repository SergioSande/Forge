import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileCheck2,
  FolderKanban,
  Link2,
  Send,
  Sparkles,
} from 'lucide-react';
import type { Project, Solution, Student } from '../types';
import { useStore } from '../store/AppStore';
import {
  formatDate,
  projectIcon,
  projectTheme,
  timeAgo,
  workStage,
} from '../lib/utils';
import {
  Avatar,
  EmptyState,
  Field,
  Modal,
  PageHeader,
} from '../components/ui';

type Filter = 'active' | 'delivered' | 'proposals';

export function StudentProjects() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  if (currentUser.role !== 'student') return <Navigate to="/app/mis-proyectos" replace />;
  return <StudentProjectsContent student={currentUser} />;
}

function StudentProjectsContent({ student }: { student: Student }) {
  const { state, deliverSolution, notify } = useStore();
  const [filter, setFilter] = useState<Filter>('active');
  const [deliverySolution, setDeliverySolution] = useState<Solution | null>(null);
  const [deliveryLink, setDeliveryLink] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [error, setError] = useState('');

  const mySolutions = state.solutions
    .filter((solution) => solution.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeSolutions = mySolutions.filter(
    (solution) => solution.status === 'accepted' && !solution.deliveredAt,
  );
  const deliveredSolutions = mySolutions.filter(
    (solution) => solution.status === 'accepted' && Boolean(solution.deliveredAt),
  );
  const proposalSolutions = mySolutions.filter(
    (solution) => solution.status !== 'accepted',
  );

  const visible =
    filter === 'active'
      ? activeSolutions
      : filter === 'delivered'
        ? deliveredSolutions
        : proposalSolutions;

  const deliveryProject = deliverySolution
    ? state.projects.find((project) => project.id === deliverySolution.projectId)
    : null;

  const openDelivery = (solution: Solution) => {
    setDeliverySolution(solution);
    setDeliveryLink('');
    setDeliveryNote('');
    setError('');
  };

  const submitDelivery = (event: React.FormEvent) => {
    event.preventDefault();
    if (!deliverySolution) return;
    if (!deliveryLink.trim() || !deliveryLink.includes('.')) {
      setError('Añade un enlace válido al documento o repositorio de entrega.');
      return;
    }
    try {
      deliverSolution(deliverySolution.id, deliveryLink.trim(), deliveryNote.trim());
      notify('Entrega registrada. La empresa ya puede revisar tu documento.', 'success');
      setDeliverySolution(null);
    } catch (deliveryError) {
      notify(
        deliveryError instanceof Error
          ? deliveryError.message
          : 'No se pudo registrar la entrega.',
        'error',
      );
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Tu espacio de trabajo"
        title="Mis proyectos"
        description="Los retos en los que estás trabajando y las propuestas que ya has enviado. Entrega aquí tus documentos cuando estén listos."
        action={
          <Link to="/app/explorar" className="btn btn-primary">
            <Compass size={17} /> Explorar retos
          </Link>
        }
      />

      <section className="student-workspace-stats">
        <div className="workspace-stat">
          <span className="stat-icon sky">
            <FolderKanban size={18} />
          </span>
          <div>
            <strong>{activeSolutions.length}</strong>
            <span>proyecto{activeSolutions.length === 1 ? '' : 's'} en desarrollo</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon mint">
            <FileCheck2 size={18} />
          </span>
          <div>
            <strong>{deliveredSolutions.length}</strong>
            <span>entrega{deliveredSolutions.length === 1 ? '' : 's'} realizada{deliveredSolutions.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon lilac">
            <Send size={18} />
          </span>
          <div>
            <strong>{proposalSolutions.length}</strong>
            <span>propuesta{proposalSolutions.length === 1 ? '' : 's'} enviada{proposalSolutions.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      </section>

      <div className="applications-toolbar workspaces-toolbar">
        <div className="tab-row" role="tablist" aria-label="Filtrar proyectos">
          {(
            [
              { id: 'active' as Filter, label: 'En desarrollo', count: activeSolutions.length },
              { id: 'delivered' as Filter, label: 'Entregados', count: deliveredSolutions.length },
              { id: 'proposals' as Filter, label: 'Propuestas', count: proposalSolutions.length },
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={filter === tab.id}
              className={`tab-btn ${filter === tab.id ? 'active' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
        <span className="toolbar-note">
          {visible.length} {visible.length === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </div>

      {visible.length ? (
        <div className="student-projects-list">
          {visible.map((solution) => {
            const project = state.projects.find(
              (item) => item.id === solution.projectId,
            );
            if (!project) return null;
            const company = state.users.find(
              (user) => user.id === project.companyId && user.role === 'company',
            );
            return (
              <StudentProjectCard
                key={solution.id}
                solution={solution}
                project={project}
                companyName={company?.name ?? 'Empresa'}
                companyId={company?.id}
                onDeliver={
                  solution.status === 'accepted' && !solution.deliveredAt
                    ? () => openDelivery(solution)
                    : undefined
                }
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={filter === 'active' ? <FolderKanban size={26} /> : <FileCheck2 size={26} />}
          title={
            filter === 'active'
              ? 'No tienes proyectos en desarrollo'
              : filter === 'delivered'
                ? 'Todavía no has entregado ningún proyecto'
                : 'Aún no has enviado propuestas'
          }
          description={
            filter === 'active'
              ? 'Cuando una empresa acepte una de tus soluciones, el proyecto aparecerá aquí para que puedas trabajar y entregarlo.'
              : filter === 'delivered'
                ? 'Cuando entregues el documento final de un proyecto aceptado, quedará guardado en esta sección.'
                : 'Encuentra un reto que encaje contigo y envía tu primera propuesta.'
          }
          action={
            <Link to="/app/explorar" className="btn btn-primary">
              Descubrir retos <ArrowRight size={16} />
            </Link>
          }
        />
      )}

      <Modal
        open={Boolean(deliverySolution)}
        onClose={() => setDeliverySolution(null)}
        title="Entregar proyecto"
        subtitle={
          deliveryProject
            ? `Documento final para «${deliveryProject.title}»`
            : 'Comparte el enlace de tu entrega.'
        }
        size="md"
      >
        <form className="stack-form" onSubmit={submitDelivery} noValidate>
          <Field
            label="Enlace al documento o repositorio"
            hint="Drive, Figma, GitHub, Notion o cualquier enlace accesible por la empresa."
            error={error}
            required
          >
            <div className="input-with-icon">
              <Link2 size={16} />
              <input
                value={deliveryLink}
                onChange={(event) => {
                  setDeliveryLink(event.target.value);
                  setError('');
                }}
                placeholder="drive.google.com/tu-entrega"
                className={error ? 'input-error' : ''}
              />
            </div>
          </Field>
          <Field label="Nota para la empresa" hint="Opcional. Contexto, instrucciones o próximos pasos.">
            <textarea
              rows={4}
              value={deliveryNote}
              onChange={(event) => setDeliveryNote(event.target.value)}
              placeholder="Incluyo el documento final, los archivos de diseño y una guía rápida para revisarlo..."
              maxLength={600}
            />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setDeliverySolution(null)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Registrar entrega
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function StudentProjectCard({
  solution,
  project,
  companyName,
  companyId,
  onDeliver,
}: {
  solution: Solution;
  project: Project;
  companyName: string;
  companyId?: string;
  onDeliver?: () => void;
}) {
  const theme = projectTheme(project);
  const Icon =
    projectIcon(project) === 'flask'
      ? Sparkles
      : projectIcon(project) === 'atom'
        ? Sparkles
        : Sparkles;
  const stage = workStage(solution);
  const delivered = Boolean(solution.deliveredAt);
  const accepted = solution.status === 'accepted';

  return (
    <article className="student-project-card">
      <div
        className="student-project-visual"
        style={{
          background: `linear-gradient(145deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]})`,
        }}
      >
        <Icon size={26} />
        <span>{project.areas[0]}</span>
      </div>

      <div className="student-project-content">
        <div className="student-project-top">
          <span className={`status-badge tone-${stage.tone}`}>{stage.label}</span>
          <span className="student-project-company">{companyName}</span>
        </div>
        <h3>{project.title}</h3>
        <p className="student-project-proposal">
          <strong>{solution.title}</strong> · {solution.description}
        </p>
        <div className="student-project-meta">
          <span>Propuesta enviada {timeAgo(solution.createdAt)}</span>
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
        </div>

        {accepted && (
          <div className="project-progress">
            <div className={`progress-step complete`}>
              <span>1</span> Aceptado
            </div>
            <div className={`progress-step ${delivered ? 'complete' : 'current'}`}>
              <span>2</span> En desarrollo
            </div>
            <div className={`progress-step ${delivered ? 'complete' : ''}`}>
              <span>3</span> Entregado
            </div>
          </div>
        )}

        {delivered ? (
          <div className="delivery-box">
            <div>
              <CheckCircle2 size={18} />
              <div>
                <strong>Entrega registrada {formatDate(solution.deliveredAt)}</strong>
                <span>{solution.deliveryNote || 'Documento final disponible para la empresa.'}</span>
              </div>
            </div>
            {solution.deliveryLink && (
              <a
                href={`https://${solution.deliveryLink.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-soft btn-sm"
              >
                Abrir entrega <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : null}
      </div>

      <div className="student-project-actions">
        {onDeliver && (
          <button className="btn btn-primary btn-sm" onClick={onDeliver}>
            <FileCheck2 size={15} /> Entregar proyecto
          </button>
        )}
        <Link to={`/app/proyectos/${project.id}`} className="btn btn-ghost btn-sm">
          Ver reto <ArrowRight size={14} />
        </Link>
        {companyId && (
          <Link to={`/app/u/${companyId}`} className="btn btn-ghost btn-sm">
            Ver empresa
          </Link>
        )}
      </div>
    </article>
  );
}
