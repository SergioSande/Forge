import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ExternalLink,
  Inbox,
  Layers,
  Link2,
  MapPin,
  Send,
  Sparkles,
  ThumbsDown,
  UserRound,
} from 'lucide-react';
import type { SolutionStatus, Student } from '../types';
import { useStore } from '../store/AppStore';
import {
  canStudentApply,
  daysUntil,
  findCompany,
  formatDate,
  isProjectCompatible,
  matchScore,
  timeAgo,
} from '../lib/utils';
import {
  Avatar,
  EmptyState,
  MatchBadge,
  MatchRing,
  StatusBadge,
  MatchLabelInline,
} from '../components/ui';
import { SolutionModal } from '../components/SolutionModal';
import { ProjectCover } from '../components/ProjectCover';

type Filter = 'all' | SolutionStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Nuevas' },
  { id: 'shortlisted', label: 'Preseleccionadas' },
  { id: 'accepted', label: 'Aceptadas' },
  { id: 'discarded', label: 'Descartadas' },
];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, currentUser, updateSolutionStatus, setProjectArchived, notify } =
    useStore();
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  if (!currentUser) return null;

  const project = state.projects.find((item) => item.id === id);
  if (!project) {
    return (
      <div className="not-found-inline">
        <EmptyState
          icon={<Inbox size={26} />}
          title="Este reto ya no está disponible"
          description="Puede que la empresa lo haya retirado o que el enlace no sea correcto. Explora otros retos abiertos."
          action={
            <Link to="/app/explorar" className="btn btn-primary">
              Explorar retos
            </Link>
          }
        />
      </div>
    );
  }

  const company = findCompany(state.users, project.companyId);
  const isStudent = currentUser.role === 'student';
  const isOwner = currentUser.role === 'company' && project.companyId === currentUser.id;
  const isOtherCompany = currentUser.role === 'company' && !isOwner;

  const mySolution = isStudent
    ? state.solutions.find(
        (solution) =>
          solution.projectId === project.id && solution.studentId === currentUser.id,
      )
    : undefined;

  const projectSolutions = state.solutions
    .filter((solution) => solution.projectId === project.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filterCounts: Record<Filter, number> = {
    all: projectSolutions.length,
    pending: projectSolutions.filter((solution) => solution.status === 'pending').length,
    shortlisted: projectSolutions.filter((solution) => solution.status === 'shortlisted').length,
    accepted: projectSolutions.filter((solution) => solution.status === 'accepted').length,
    discarded: projectSolutions.filter((solution) => solution.status === 'discarded').length,
  };

  const visibleSolutions =
    filter === 'all'
      ? projectSolutions
      : projectSolutions.filter((solution) => solution.status === filter);

  const score = isStudent ? matchScore(currentUser, project) : null;
  const commonSkills = isStudent
    ? project.skills.filter((skill) =>
        currentUser.skills.some((item) => item.toLowerCase() === skill.toLowerCase()),
      )
    : [];
  const commonAreas = isStudent
    ? project.areas.filter((area) => currentUser.interests.includes(area))
    : [];
  const closed =
    project.status === 'closed' ||
    (project.deadline ? daysUntil(project.deadline) < 0 : false);
  const capacityReached = Boolean(
    project.maxSubmissions && projectSolutions.length >= project.maxSubmissions,
  );
  const studentEligible = isStudent ? canStudentApply(currentUser) : false;
  const matchesInterests = isStudent
    ? isProjectCompatible(currentUser, project)
    : false;
  const canApply =
    isStudent &&
    !mySolution &&
    !closed &&
    !capacityReached &&
    studentEligible &&
    matchesInterests;

  const openProjects = company
    ? state.projects.filter(
        (item) =>
          item.companyId === company.id &&
          item.status === 'open' &&
          !item.archived,
      ).length
    : 0;

  const relatedProjects = !isOwner
    ? state.projects
        .filter(
          (item) =>
            item.id !== project.id &&
            item.status === 'open' &&
            !item.archived,
        )
        .map((item) => ({
          project: item,
          score: isStudent ? matchScore(currentUser, item) : 0,
          shared: item.areas.filter((area) => project.areas.includes(area)).length,
        }))
        .filter((item) => item.shared > 0)
        .sort((a, b) =>
          isStudent ? b.score - a.score : b.shared - a.shared || b.score - a.score,
        )
        .slice(0, 2)
    : [];

  const backLink = isOwner || isOtherCompany ? '/app/mis-proyectos' : '/app/explorar';
  const backLabel = isOwner
    ? 'Volver a mis proyectos'
    : isOtherCompany
      ? 'Volver a mis proyectos'
      : 'Volver a explorar';

  const setStatus = (solutionId: string, status: SolutionStatus, studentName: string) => {
    updateSolutionStatus(solutionId, status);
    const messages: Record<SolutionStatus, string> = {
      pending: `Has devuelto la propuesta de ${studentName} a la bandeja de nuevas.`,
      shortlisted: `Has preseleccionado la propuesta de ${studentName}.`,
      accepted: `Has aceptado la propuesta de ${studentName}. ¡Ahora toca hablar!`,
      discarded: `Has descartado la propuesta de ${studentName}.`,
    };
    notify(messages[status], status === 'accepted' ? 'success' : 'info');
  };

  return (
    <>
      <div className="detail-back-row">
        <Link to={backLink} className="back-link">
          <ArrowLeft size={16} /> {backLabel}
        </Link>
        <span
          className={`project-status ${
            project.archived ? 'archived' : closed ? 'closed' : 'open'
          }`}
        >
          <span className="dot" />{' '}
          {project.archived
            ? 'Archivado'
            : closed
              ? 'Plazo cerrado'
              : 'Recibiendo soluciones'}
        </span>
      </div>

      <ProjectCover
        project={project}
        company={company}
        solutionCount={projectSolutions.length}
      />

      <div className="detail-layout">
        <div className="detail-main">
          {mySolution && (
            <section className="own-solution-banner">
              <div className="own-solution-head">
                <span className="own-solution-icon">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <strong>Ya has enviado una solución a este reto</strong>
                  <span>Enviada {timeAgo(mySolution.createdAt)}</span>
                </div>
                <StatusBadge status={mySolution.status} />
              </div>
              <div className="own-solution-content">
                <h3>{mySolution.title}</h3>
                <p>{mySolution.description}</p>
                {mySolution.link && (
                  <a
                    href={`https://${mySolution.link.replace(/^https?:\/\//, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link inline-link"
                  >
                    <Link2 size={14} /> {mySolution.link}
                  </a>
                )}
              </div>
              <Link to="/app/postulaciones" className="btn btn-soft btn-sm">
                Seguir su estado <ArrowRight size={14} />
              </Link>
            </section>
          )}

          {isOtherCompany && (
            <div className="info-banner">
              <div className="info-banner-icon">
                <Inbox size={20} />
              </div>
              <div>
                <strong>Solo la empresa que publicó el reto puede ver las soluciones</strong>
                <p>
                  Este proyecto pertenece a {company?.name ?? 'otra empresa'}. Puedes explorar el
                  reto para inspirarte o descubrir talento en la comunidad.
                </p>
              </div>
              <Link to="/app/comunidad" className="btn btn-white btn-sm">
                Ver talento <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <section className="detail-card">
            <div className="detail-card-head">
              <div>
                <span className="section-kicker">El reto</span>
                <h2>Qué hay que resolver</h2>
              </div>
              <span className="published-note">Publicado {timeAgo(project.createdAt)}</span>
            </div>
            <div className="detail-description">
              {project.description.split('\n\n').map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="detail-subsection">
              <h3>
                <Layers size={17} /> Habilidades que se valoran
              </h3>
              <div className="tag-wrap">
                {project.skills.map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-reassurance">
              <Sparkles size={18} />
              <p>
                <strong>No necesitas experiencia laboral.</strong> Buscamos a alguien con bases,
                criterio y ganas de aprender. Cuéntanos cómo abordarías el reto y qué harías
                primero.
              </p>
            </div>
          </section>

          {!isOwner && relatedProjects.length > 0 && (
            <section className="detail-card">
              <div className="detail-card-head">
                <div>
                  <span className="section-kicker">Sigue explorando</span>
                  <h2>También te puede interesar</h2>
                </div>
                <Link to="/app/explorar" className="text-link">
                  Ver todos <ArrowRight size={14} />
                </Link>
              </div>
              <div className="related-list">
                {relatedProjects.map(({ project: related, score: relatedScore }) => {
                  const relatedCompany = findCompany(state.users, related.companyId);
                  return (
                    <Link
                      key={related.id}
                      to={`/app/proyectos/${related.id}`}
                      className="related-row"
                    >
                      {relatedCompany && <Avatar user={relatedCompany} size="sm" />}
                      <div>
                        <strong>{related.title}</strong>
                        <span>
                          {relatedCompany?.name} · {related.duration} · {related.modality}
                        </span>
                      </div>
                      {isStudent && <MatchBadge score={relatedScore} />}
                      <ArrowRight size={15} />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {isOwner && (
            <section className="detail-card solutions-section" id="soluciones">
              <div className="solutions-section-head">
                <div>
                  <span className="section-kicker">Las propuestas</span>
                  <h2>
                    Soluciones recibidas <span className="title-count">{projectSolutions.length}</span>
                  </h2>
                  <p>
                    Revisa cada enfoque, visita el perfil del estudiante y decide con quién quieres
                    seguir.
                  </p>
                </div>
                {filterCounts.pending > 0 && (
                  <span className="pending-summary">
                    <span className="dot" /> {filterCounts.pending} {filterCounts.pending === 1 ? 'nueva' : 'nuevas'}
                  </span>
                )}
              </div>

              {projectSolutions.length > 0 && (
                <div className="tab-row solutions-tabs" role="tablist">
                  {FILTERS.map((item) => (
                    <button
                      key={item.id}
                      role="tab"
                      aria-selected={filter === item.id}
                      className={`tab-btn ${filter === item.id ? 'active' : ''}`}
                      onClick={() => setFilter(item.id)}
                    >
                      {item.label}
                      <span className="tab-count">{filterCounts[item.id]}</span>
                    </button>
                  ))}
                </div>
              )}

              {visibleSolutions.length ? (
                <div className="solutions-list">
                  {visibleSolutions.map((solution) => {
                    const student = state.users.find(
                      (user): user is Student =>
                        user.id === solution.studentId && user.role === 'student',
                    );
                    if (!student) return null;
                    const studentScore = matchScore(student, project);
                    return (
                      <article className="solution-card" key={solution.id}>
                        <div className="solution-head">
                          <Link to={`/app/u/${student.id}`} className="solution-student">
                            <Avatar user={student} size="md" />
                            <div>
                              <strong>
                                {student.name} {student.surname}
                              </strong>
                              <span>
                                {student.degree} · {student.university}
                              </span>
                            </div>
                          </Link>
                          <div className="solution-head-badges">
                            <MatchBadge score={studentScore} />
                            <StatusBadge status={solution.status} />
                          </div>
                        </div>

                        <div className="solution-body">
                          <h3>{solution.title}</h3>
                          <p>{solution.description}</p>
                          {solution.link && (
                            <a
                              href={`https://${solution.link.replace(/^https?:\/\//, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="solution-link"
                            >
                              <ExternalLink size={14} /> {solution.link}
                            </a>
                          )}
                          <div className="solution-tags">
                            {student.skills.slice(0, 4).map((skill) => (
                              <span className="skill-tag" key={skill}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="solution-footer">
                          <span className="solution-date">
                            <CalendarDays size={14} /> {timeAgo(solution.createdAt)}
                          </span>
                          <div className="solution-actions">
                            <Link
                              to={`/app/u/${student.id}`}
                              className="btn btn-ghost btn-sm"
                            >
                              <UserRound size={14} /> Ver perfil
                            </Link>
                            {solution.status !== 'accepted' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  setStatus(
                                    solution.id,
                                    'accepted',
                                    `${student.name} ${student.surname}`,
                                  )
                                }
                              >
                                <Check size={14} /> Aceptar
                              </button>
                            )}
                            {solution.status === 'pending' && (
                              <button
                                className="btn btn-soft btn-sm"
                                onClick={() =>
                                  setStatus(
                                    solution.id,
                                    'shortlisted',
                                    `${student.name} ${student.surname}`,
                                  )
                                }
                              >
                                Preseleccionar
                              </button>
                            )}
                            {solution.status === 'shortlisted' && (
                              <button
                                className="btn btn-soft btn-sm"
                                onClick={() =>
                                  setStatus(
                                    solution.id,
                                    'pending',
                                    `${student.name} ${student.surname}`,
                                  )
                                }
                              >
                                Quitar preselección
                              </button>
                            )}
                            {(solution.status === 'pending' ||
                              solution.status === 'shortlisted') && (
                              <button
                                className="icon-btn danger"
                                title="Descartar propuesta"
                                aria-label="Descartar propuesta"
                                onClick={() =>
                                  setStatus(
                                    solution.id,
                                    'discarded',
                                    `${student.name} ${student.surname}`,
                                  )
                                }
                              >
                                <ThumbsDown size={16} />
                              </button>
                            )}
                            {solution.status === 'discarded' && (
                              <button
                                className="btn btn-soft btn-sm"
                                onClick={() =>
                                  setStatus(
                                    solution.id,
                                    'pending',
                                    `${student.name} ${student.surname}`,
                                  )
                                }
                              >
                                Recuperar
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={<Inbox size={26} />}
                  title={
                    projectSolutions.length
                      ? 'No hay propuestas en este estado'
                      : 'Aún no ha llegado ninguna solución'
                  }
                  description={
                    projectSolutions.length
                      ? 'Prueba con otro filtro para ver el resto de propuestas.'
                      : 'Comparte el reto con estudiantes o revisa más tarde. Las buenas ideas necesitan un poco de tiempo.'
                  }
                  action={
                    projectSolutions.length ? (
                      <button className="btn btn-soft btn-sm" onClick={() => setFilter('all')}>
                        Ver todas
                      </button>
                    ) : (
                      <Link to="/app/comunidad" className="btn btn-soft btn-sm">
                        Explorar talento
                      </Link>
                    )
                  }
                />
              )}
            </section>
          )}
        </div>

        <aside className="detail-side">
          {isStudent && score !== null && (
            <section className="side-card match-side-card">
              <div className="match-side-head">
                <div>
                  <span className="section-kicker">Tu encaje</span>
                  <h3>¿Es un buen match?</h3>
                </div>
                <MatchRing score={score} size="md" />
              </div>
              <MatchLabelInline score={score} />
              <div className="match-reasons">
                <span className="match-reasons-title">Por qué encaja</span>
                {commonSkills.length || commonAreas.length ? (
                  <ul>
                    {commonSkills.slice(0, 3).map((skill) => (
                      <li key={skill}>
                        <span className="check-dot">
                          <Check size={11} />
                        </span>
                        <span>
                          Manejas <strong>{skill}</strong>
                        </span>
                      </li>
                    ))}
                    {commonAreas.slice(0, 2).map((area) => (
                      <li key={area}>
                        <span className="check-dot">
                          <Check size={11} />
                        </span>
                        <span>
                          Te interesa <strong>{area}</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="match-empty-text">
                    No es tu afinidad más alta, pero puedes explorar y proponer un enfoque propio.
                  </p>
                )}
              </div>

              {mySolution ? (
                <div className="side-status">
                  <div>
                    <span>Tu solución</span>
                    <StatusBadge status={mySolution.status} />
                  </div>
                  <Link
                    to={
                      mySolution.status === 'accepted'
                        ? '/app/mis-proyectos'
                        : '/app/postulaciones'
                    }
                    className="btn btn-soft btn-block btn-sm"
                  >
                    {mySolution.status === 'accepted'
                      ? 'Ver mi proyecto'
                      : 'Ver mi postulación'}
                  </Link>
                </div>
              ) : project.archived ? (
                <button className="btn btn-disabled btn-block" disabled>
                  Proyecto archivado
                </button>
              ) : closed ? (
                <button className="btn btn-disabled btn-block" disabled>
                  Plazo de soluciones cerrado
                </button>
              ) : capacityReached ? (
                <button className="btn btn-disabled btn-block" disabled>
                  Aforo de propuestas completo
                </button>
              ) : !studentEligible ? (
                <button className="btn btn-disabled btn-block" disabled>
                  Disponible a partir de 3º curso
                </button>
              ) : !matchesInterests ? (
                <button className="btn btn-disabled btn-block" disabled>
                  No coincide con tus intereses
                </button>
              ) : canApply ? (
                <>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => setSolutionModalOpen(true)}
                  >
                    <Send size={16} /> Enviar mi solución
                  </button>
                  <p className="side-cta-note">
                    Una idea clara y honesta vale más que un CV perfecto.
                  </p>
                </>
              ) : (
                <button className="btn btn-disabled btn-block" disabled>
                  No puedes enviar propuestas ahora
                </button>
              )}
            </section>
          )}

          {isOwner && (
            <section className="side-card owner-side-card">
              <span className="section-kicker">Panel del reto</span>
              <h3>
                {projectSolutions.length}{' '}
                {projectSolutions.length === 1 ? 'solución recibida' : 'soluciones recibidas'}
              </h3>
              <p>
                {filterCounts.pending > 0
                  ? `Tienes ${filterCounts.pending} ${filterCounts.pending === 1 ? 'propuesta nueva' : 'propuestas nuevas'} por revisar.`
                  : 'Todo revisado. Puedes seguir descubriendo talento para futuros retos.'}
              </p>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  document.getElementById('soluciones')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Revisar soluciones <ArrowRight size={16} />
              </button>
              <button
                className="btn btn-ghost btn-block btn-sm side-secondary-action"
                onClick={() => {
                  setProjectArchived(project.id, !project.archived);
                  notify(
                    project.archived
                      ? 'Proyecto reactivado y visible de nuevo.'
                      : 'Proyecto archivado. Puedes recuperarlo desde Mis proyectos.',
                    'info',
                  );
                }}
              >
                <Archive size={14} />
                {project.archived ? 'Reactivar proyecto' : 'Archivar proyecto'}
              </button>
              <div className="side-meta-list">
                <div>
                  <span>Publicado</span>
                  <strong>{formatDate(project.createdAt)}</strong>
                </div>
                <div>
                  <span>Fecha límite</span>
                  <strong>
                    {project.deadline ? formatDate(project.deadline) : 'Sin fecha límite'}
                  </strong>
                </div>
                <div>
                  <span>Presupuesto</span>
                  <strong>{project.budget}</strong>
                </div>
              </div>
            </section>
          )}

          {company && (
            <section className="side-card company-side-card">
              <span className="section-kicker">La empresa</span>
              <Link to={`/app/u/${company.id}`} className="company-side-head">
                <Avatar user={company} size="md" />
                <div>
                  <strong>{company.name}</strong>
                  <span>{company.sector}</span>
                </div>
              </Link>
              <p>{company.bio}</p>
              <div className="company-side-meta">
                <span>
                  <MapPin size={14} /> {company.location}
                </span>
                <span>{openProjects} {openProjects === 1 ? 'reto abierto' : 'retos abiertos'}</span>
              </div>
              <Link to={`/app/u/${company.id}`} className="btn btn-ghost btn-block btn-sm">
                Ver perfil de la empresa <ArrowRight size={14} />
              </Link>
            </section>
          )}

          <section className="side-card simple-side-card">
            <span className="section-kicker">Cómo funciona</span>
            <div className="side-steps">
              <div>
                <span>1</span>
                <p>Envía una propuesta con tu enfoque.</p>
              </div>
              <div>
                <span>2</span>
                <p>La empresa revisa y puede preseleccionarte.</p>
              </div>
              <div>
                <span>3</span>
                <p>Si encaja, habláis y empieza el proyecto.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {isStudent && (
        <SolutionModal
          project={project}
          open={solutionModalOpen}
          onClose={() => setSolutionModalOpen(false)}
        />
      )}
    </>
  );
}
