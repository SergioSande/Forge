import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Cake,
  CalendarDays,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Heart,
  Linkedin,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Company, Student } from '../types';
import { useStore } from '../store/AppStore';
import {
  formatLongDate,
  isProjectCompatible,
  matchScore,
  profileCompleteness,
} from '../lib/utils';
import {
  AreaChip,
  Avatar,
  EmptyState,
  MatchBadge,
} from '../components/ui';
import { EditProfileModal } from '../components/EditProfileModal';

export function MyProfile() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  return <ProfileContent userId={currentUser.id} />;
}

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useStore();
  if (!currentUser) return null;
  return <ProfileContent userId={userId ?? ''} />;
}

function ProfileContent({ userId }: { userId: string }) {
  const { state, currentUser, notify, toggleFavorite } = useStore();
  const [editOpen, setEditOpen] = useState(false);

  if (!currentUser) return null;
  const user = state.users.find((item) => item.id === userId);

  if (!user) {
    return (
      <EmptyState
        icon={<Users size={26} />}
        title="No encontramos este perfil"
        description="Puede que el perfil ya no esté disponible. Vuelve a la comunidad para seguir explorando."
        action={
          <Link to="/app/comunidad" className="btn btn-primary">
            Ir a la comunidad
          </Link>
        }
      />
    );
  }

  const isOwn = user.id === currentUser.id;
  const isStudent = user.role === 'student';
  const student = isStudent ? (user as Student) : null;
  const company = !isStudent ? (user as Company) : null;
  const displayName = student ? `${student.name} ${student.surname}` : user.name;

  const ownProjects = company
    ? state.projects.filter((project) => project.companyId === company.id)
    : [];
  const openProjects = ownProjects.filter(
    (project) => project.status === 'open' && !project.archived,
  );
  const companySolutions = company
    ? state.solutions.filter((solution) =>
        ownProjects.some((project) => project.id === solution.projectId),
      )
    : [];
  const studentSolutions = student
    ? state.solutions.filter((solution) => solution.studentId === student.id)
    : [];

  const topMatches = student
    ? state.projects
        .filter(
          (project) =>
            project.status === 'open' &&
            !project.archived &&
            isProjectCompatible(student, project),
        )
        .map((project) => ({ project, score: matchScore(student, project) }))
        .filter((item) => item.score >= 80).length
    : 0;

  const viewerCompany =
    currentUser.role === 'company' && currentUser.id !== user.id
      ? (currentUser as Company)
      : null;
  const studentViewer =
    currentUser.role === 'student' && currentUser.id !== user.id
      ? (currentUser as Student)
      : null;
  const isFavorite = Boolean(
    viewerCompany &&
      student &&
      state.favorites.some(
        (favorite) =>
          favorite.companyId === viewerCompany.id && favorite.studentId === student.id,
      ),
  );

  const companyProjectsForList = company
    ? studentViewer
      ? ownProjects.filter(
          (project) =>
            project.status === 'open' &&
            !project.archived &&
            isProjectCompatible(studentViewer, project),
        )
      : ownProjects.filter((project) => !project.archived)
    : [];

  const studentMatchesForViewer =
    student && viewerCompany
      ? state.projects
          .filter(
            (project) =>
              project.companyId === viewerCompany.id &&
              project.status === 'open' &&
              !project.archived,
          )
          .map((project) => ({ project, score: matchScore(student, project) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
      : [];

  const uniqueStudents = new Set(companySolutions.map((solution) => solution.studentId)).size;

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify('Enlace del perfil copiado al portapapeles.', 'info');
    } catch {
      notify('No pudimos copiar el enlace. Puedes copiarlo desde la barra del navegador.', 'error');
    }
  };

  return (
    <>
      <div className="detail-back-row">
        <Link to={isOwn ? '/app' : '/app/comunidad'} className="back-link">
          <ArrowLeft size={16} /> {isOwn ? 'Volver al panel' : 'Volver a la comunidad'}
        </Link>
        {isStudent ? (
          <span className="profile-role-pill student">
            <GraduationCap size={14} /> Estudiante
          </span>
        ) : (
          <span className="profile-role-pill company">
            <Building2 size={14} /> Empresa
          </span>
        )}
      </div>

      <section className="profile-hero">
        <div className="profile-cover" aria-hidden="true">
          <span className="profile-cover-grid" />
          <span className="profile-cover-orb orb-one" />
          <span className="profile-cover-orb orb-two" />
          {isStudent ? (
            <span className="cover-label">
              <Sparkles size={14} /> Talento emergente
            </span>
          ) : (
            <span className="cover-label">
              <Building2 size={14} /> Buscando nuevas miradas
            </span>
          )}
        </div>

        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <Avatar user={user} size="xl" />
            <span className="profile-verified" title="Perfil verificado">
              <BadgeCheck size={19} />
            </span>
          </div>

          <div className="profile-title-block">
            <h1>{displayName}</h1>
            <p className="profile-headline">
              {student ? student.headline : company?.sector}
            </p>
            <div className="profile-meta-line">
              <span>
                <MapPin size={15} /> {user.location}
              </span>
              <span>
                <Mail size={15} /> {user.email}
              </span>
              {user.phone && (
                <span>
                  <Phone size={15} /> {user.phone}
                </span>
              )}
              {student?.age && (
                <span>
                  <Cake size={15} /> {student.age} años
                </span>
              )}
            </div>
          </div>

          <div className="profile-actions">
            {isOwn ? (
              <>
                <button className="btn btn-primary" onClick={() => setEditOpen(true)}>
                  <Pencil size={15} /> Editar perfil
                </button>
                <button className="btn btn-ghost" onClick={shareProfile}>
                  <Share2 size={15} /> Compartir
                </button>
              </>
            ) : (
              <>
                <a className="btn btn-primary" href={`mailto:${user.email}`}>
                  <Mail size={15} /> Contactar
                </a>
                {viewerCompany && student && (
                  <button
                    className={`btn ${isFavorite ? 'btn-soft' : 'btn-ghost'}`}
                    onClick={() => {
                      const saved = toggleFavorite(student.id);
                      notify(
                        saved
                          ? `${student.name} se ha añadido a tus favoritos.`
                          : `${student.name} se ha quitado de tus favoritos.`,
                        'success',
                      );
                    }}
                  >
                    <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
                    {isFavorite ? 'Guardado' : 'Guardar'}
                  </button>
                )}
                <button className="btn btn-ghost" onClick={shareProfile}>
                  <Share2 size={15} /> Compartir
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-quick-facts">
          {student ? (
            <>
              <div>
                <span>Universidad</span>
                <strong>{student.university}</strong>
              </div>
              <div>
                <span>Estudios</span>
                <strong>{student.degree}</strong>
              </div>
              <div>
                <span>Curso</span>
                <strong>{student.course}</strong>
              </div>
              <div>
                <span>Graduación</span>
                <strong>{student.graduationYear}</strong>
              </div>
            </>
          ) : (
            company && (
              <>
                <div>
                  <span>Sector</span>
                  <strong>{company.sector}</strong>
                </div>
                <div>
                  <span>Equipo</span>
                  <strong>{company.size}</strong>
                </div>
                <div>
                  <span>Sede</span>
                  <strong>{company.location}</strong>
                </div>
                <div>
                  <span>Retos abiertos</span>
                  <strong>{openProjects.length}</strong>
                </div>
              </>
            )
          )}
        </div>
      </section>

      <section className="profile-stats">
        {student ? (
          <>
            <div className="profile-stat-card">
              <span className="stat-icon sky">
                <Send size={18} />
              </span>
              <div>
                <strong>{studentSolutions.length}</strong>
                <span>{studentSolutions.length === 1 ? 'solución enviada' : 'soluciones enviadas'}</span>
              </div>
            </div>
            <div className="profile-stat-card">
              <span className="stat-icon mint">
                <Sparkles size={18} />
              </span>
              <div>
                <strong>{topMatches}</strong>
                <span>{topMatches === 1 ? 'reto con afinidad alta' : 'retos con afinidad alta'}</span>
              </div>
            </div>
            <div className="profile-stat-card">
              <span className="stat-icon lilac">
                <BadgeCheck size={18} />
              </span>
              <div>
                <strong>{profileCompleteness(student)}%</strong>
                <span>perfil completado</span>
              </div>
            </div>
            <div className="profile-stat-card">
              <span className="stat-icon amber">
                <CalendarDays size={18} />
              </span>
              <div>
                <strong>{formatLongDate(user.createdAt)}</strong>
                <span>en Forge desde</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="profile-stat-card">
              <span className="stat-icon sky">
                <Sparkles size={18} />
              </span>
              <div>
                <strong>{ownProjects.length}</strong>
                <span>{ownProjects.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}</span>
              </div>
            </div>
            <div className="profile-stat-card">
              <span className="stat-icon mint">
                <Users size={18} />
              </span>
              <div>
                <strong>{uniqueStudents}</strong>
                <span>{uniqueStudents === 1 ? 'estudiante interesado' : 'estudiantes interesados'}</span>
              </div>
            </div>
            <div className="profile-stat-card">
              <span className="stat-icon lilac">
                <Send size={18} />
              </span>
              <div>
                <strong>{companySolutions.length}</strong>
                <span>{companySolutions.length === 1 ? 'solución recibida' : 'soluciones recibidas'}</span>
              </div>
            </div>
            <div className="profile-stat-card">
              <span className="stat-icon amber">
                <CalendarDays size={18} />
              </span>
              <div>
                <strong>{formatLongDate(user.createdAt)}</strong>
                <span>en Forge desde</span>
              </div>
            </div>
          </>
        )}
      </section>

      <div className="profile-layout">
        <div className="profile-main">
          <section className="profile-card">
            <div className="profile-card-head">
              <div>
                <span className="section-kicker">{isStudent ? 'Sobre mí' : 'La empresa'}</span>
                <h2>
                  {isStudent
                    ? 'Lo que me mueve'
                    : `Así es ${company?.name ?? 'la empresa'}`}
                </h2>
              </div>
            </div>
            <p className="profile-bio">{user.bio}</p>

            {!isStudent && company && (
              <div className="profile-facts-grid">
                <div>
                  <span>Sector</span>
                  <strong>{company.sector}</strong>
                </div>
                <div>
                  <span>Tamaño del equipo</span>
                  <strong>{company.size}</strong>
                </div>
                <div>
                  <span>Fundación</span>
                  <strong>{company.founded ?? '—'}</strong>
                </div>
                <div>
                  <span>Web</span>
                  {company.website ? (
                    <a
                      href={`https://${company.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="profile-inline-link"
                    >
                      {company.website} <ExternalLink size={13} />
                    </a>
                  ) : (
                    <strong>—</strong>
                  )}
                </div>
              </div>
            )}
          </section>

          {student && (
            <>
              <section className="profile-card">
                <div className="profile-card-head">
                  <div>
                    <span className="section-kicker">Formación</span>
                    <h2>Dónde estoy aprendiendo</h2>
                  </div>
                  <GraduationCap size={22} className="profile-card-icon" />
                </div>
                <div className="profile-facts-grid">
                  <div>
                    <span>Universidad</span>
                    <strong>{student.university}</strong>
                  </div>
                  <div>
                    <span>Título / grado</span>
                    <strong>{student.degree}</strong>
                  </div>
                  <div>
                    <span>Curso actual</span>
                    <strong>{student.course}</strong>
                  </div>
                  <div>
                    <span>Año de graduación</span>
                    <strong>{student.graduationYear}</strong>
                  </div>
                  <div>
                    <span>Idiomas</span>
                    <strong>{student.languages}</strong>
                  </div>
                  <div>
                    <span>Edad</span>
                    <strong>{student.age ? `${student.age} años` : '—'}</strong>
                  </div>
                </div>
              </section>

              <section className="profile-card">
                <div className="profile-card-head">
                  <div>
                    <span className="section-kicker">Conocimientos</span>
                    <h2>Lo que sé hacer</h2>
                  </div>
                  <Sparkles size={22} className="profile-card-icon" />
                </div>
                <div className="tag-wrap profile-skill-wrap">
                  {student.skills.map((skill) => (
                    <span className="skill-tag large" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="profile-subsection">
                  <h3>Áreas que me interesan</h3>
                  <div className="tag-wrap">
                    {student.interests.map((area) => (
                      <AreaChip key={area} area={area} />
                    ))}
                  </div>
                </div>
              </section>

              {(student.github || student.linkedin) && (
                <section className="profile-card">
                  <div className="profile-card-head">
                    <div>
                      <span className="section-kicker">Enlaces</span>
                      <h2>Mira lo que he construido</h2>
                    </div>
                  </div>
                  <div className="profile-links">
                    {student.github && (
                      <a
                        href={`https://${student.github.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-link-card"
                      >
                        <Github size={19} />
                        <div>
                          <strong>GitHub</strong>
                          <span>{student.github}</span>
                        </div>
                        <ExternalLink size={15} />
                      </a>
                    )}
                    {student.linkedin && (
                      <a
                        href={`https://${student.linkedin.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="profile-link-card"
                      >
                        <Linkedin size={19} />
                        <div>
                          <strong>LinkedIn</strong>
                          <span>{student.linkedin}</span>
                        </div>
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          {company && (
            <section className="profile-card">
              <div className="profile-card-head">
                <div>
                  <span className="section-kicker">Retos</span>
                  <h2>Lo que estamos buscando</h2>
                </div>
                {isOwn && (
                  <Link to="/app/mis-proyectos" className="text-link">
                    Gestionar <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              {companyProjectsForList.length ? (
                <div className="profile-project-list">
                  {companyProjectsForList.map((project) => (
                    <Link
                      key={project.id}
                      to={`/app/proyectos/${project.id}`}
                      className="profile-project-row"
                    >
                      <div className="profile-project-icon">
                        <Sparkles size={17} />
                      </div>
                      <div>
                        <h3>{project.title}</h3>
                        <span>
                          {project.areas.join(' · ')} · {project.modality} · {project.duration}
                        </span>
                      </div>
                      <span className="budget-pill">{project.budget}</span>
                      <ArrowRight size={15} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="profile-empty-text">
                  {studentViewer
                    ? 'No hay retos abiertos que coincidan con tus intereses ahora mismo.'
                    : 'Todavía no hay retos publicados. Vuelve pronto para descubrir nuevos proyectos.'}
                </p>
              )}
            </section>
          )}

          {viewerCompany && student && (
            <section className="profile-card viewer-match-card">
              <div className="profile-card-head">
                <div>
                  <span className="section-kicker">Conexión con {viewerCompany.name}</span>
                  <h2>Encaje con tus retos</h2>
                </div>
                <Sparkles size={22} className="profile-card-icon" />
              </div>
              {studentMatchesForViewer.length ? (
                <div className="viewer-match-list">
                  {studentMatchesForViewer.map(({ project, score }) => (
                    <Link
                      key={project.id}
                      to={`/app/proyectos/${project.id}`}
                      className="viewer-match-row"
                    >
                      <div>
                        <strong>{project.title}</strong>
                        <span>{project.areas.join(' · ')}</span>
                      </div>
                      <MatchBadge score={score} />
                      <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="profile-empty-text">
                  Publica un reto para descubrir qué afinidad real tiene este perfil con tu
                  equipo.
                </p>
              )}
            </section>
          )}
        </div>

        <aside className="profile-side">
          <section className="profile-card side-profile-card">
            <h3>Detalles</h3>
            <div className="side-detail-list">
              <div>
                <span>
                  <MapPin size={15} /> Ubicación
                </span>
                <strong>{user.location}</strong>
              </div>
              <div>
                <span>
                  <Mail size={15} /> Email
                </span>
                <strong>{user.email}</strong>
              </div>
              {user.phone && (
                <div>
                  <span>
                    <Phone size={15} /> Teléfono
                  </span>
                  <strong>{user.phone}</strong>
                </div>
              )}
              {company && (
                <>
                  <div>
                    <span>
                      <Users size={15} /> Equipo
                    </span>
                    <strong>{company.size}</strong>
                  </div>
                  <div>
                    <span>
                      <Building2 size={15} /> Contacto
                    </span>
                    <strong>{company.contactName}</strong>
                  </div>
                </>
              )}
              {student && (
                <div>
                  <span>
                    <Cake size={15} /> Edad
                  </span>
                  <strong>{student.age ? `${student.age} años` : '—'}</strong>
                </div>
              )}
            </div>
          </section>

          {company?.website && (
            <section className="profile-card side-profile-card">
              <h3>Enlaces</h3>
              <a
                href={`https://${company.website.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noreferrer"
                className="profile-link-card compact"
              >
                <Globe size={18} />
                <div>
                  <strong>Web</strong>
                  <span>{company.website}</span>
                </div>
                <ExternalLink size={14} />
              </a>
            </section>
          )}

          {isOwn && (
            <section className="profile-card side-profile-card profile-tip-card">
              <span className="profile-tip-icon">
                <Sparkles size={18} />
              </span>
              <h3>Un perfil vivo funciona mejor</h3>
              <p>
                Añade proyectos, enlaces o experiencias nuevas. Cuanto más concreto sea tu perfil,
                mejores matches aparecerán.
              </p>
              <button className="btn btn-soft btn-block btn-sm" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> Actualizar perfil
              </button>
            </section>
          )}

          {!isOwn && (
            <section className="profile-card side-profile-card profile-contact-card">
              <h3>¿Hablamos?</h3>
              <p>
                {isStudent
                  ? 'Si este perfil encaja con tu proyecto, escríbele un mensaje con contexto. La curiosidad se agradece.'
                  : 'Si te interesa lo que hacen, escríbeles y cuéntales qué te gustaría aprender.'}
              </p>
              <a className="btn btn-primary btn-block btn-sm" href={`mailto:${user.email}`}>
                <Mail size={15} /> Enviar email
              </a>
            </section>
          )}
        </aside>
      </div>

      {isOwn && <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />}
    </>
  );
}
