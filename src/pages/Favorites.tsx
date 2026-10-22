import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Heart,
  HeartOff,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
import type { Company, Student } from '../types';
import { useStore } from '../store/AppStore';
import { bestStudentMatch } from '../lib/utils';
import { Avatar, EmptyState, MatchBadge, PageHeader } from '../components/ui';

export function Favorites() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  if (currentUser.role !== 'company') return <Navigate to="/app" replace />;
  return <FavoritesContent company={currentUser} />;
}

function FavoritesContent({ company }: { company: Company }) {
  const { state, toggleFavorite, notify } = useStore();
  const favoriteStudents = state.favorites
    .filter((favorite) => favorite.companyId === company.id)
    .map((favorite) => ({
      favorite,
      student: state.users.find(
        (user): user is Student =>
          user.id === favorite.studentId && user.role === 'student',
      ),
    }))
    .filter((item): item is { favorite: (typeof state.favorites)[number]; student: Student } =>
      Boolean(item.student),
    );

  return (
    <>
      <PageHeader
        eyebrow="Talento guardado"
        title="Favoritos"
        description="Perfiles que quieres tener a mano. Guárdalos hoy y vuelve cuando tengas el reto adecuado."
        action={
          <Link to="/app/comunidad" className="btn btn-secondary">
            <Users size={17} /> Explorar talento
          </Link>
        }
      />

      {favoriteStudents.length ? (
        <div className="favorites-grid">
          {favoriteStudents.map(({ student }) => {
            const score = bestStudentMatch(student, company, state.projects);
            return (
              <article className="favorite-card" key={student.id}>
                <div className="favorite-card-top">
                  <Link to={`/app/u/${student.id}`} className="favorite-person">
                    <Avatar user={student} size="lg" />
                    <div>
                      <h3>
                        {student.name} {student.surname}
                      </h3>
                      <span>{student.headline}</span>
                    </div>
                  </Link>
                  <button
                    className="favorite-remove"
                    onClick={() => {
                      toggleFavorite(student.id);
                      notify(`${student.name} se ha quitado de favoritos.`, 'info');
                    }}
                    aria-label={`Quitar a ${student.name} de favoritos`}
                    title="Quitar de favoritos"
                  >
                    <HeartOff size={16} />
                  </button>
                </div>

                <div className="favorite-meta">
                  <span>
                    <GraduationCap size={14} /> {student.degree} · {student.course}
                  </span>
                  <span>
                    <MapPin size={14} /> {student.location}
                  </span>
                </div>
                <span className="favorite-university">{student.university}</span>

                <div className="tag-wrap favorite-skills">
                  {student.skills.slice(0, 4).map((skill) => (
                    <span className="skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="favorite-card-footer">
                  <MatchBadge score={score} />
                  <div className="favorite-actions">
                    <Link to={`/app/u/${student.id}`} className="btn btn-soft btn-sm">
                      Ver perfil <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Heart size={26} />}
          title="Todavía no has guardado a nadie"
          description="Cuando encuentres un perfil prometedor, pulsa Guardar en su perfil y aparecerá aquí para no perderlo de vista."
          action={
            <Link to="/app/comunidad" className="btn btn-primary">
              Descubrir estudiantes <ArrowRight size={16} />
            </Link>
          }
        />
      )}

      <section className="tips-banner">
        <div className="tips-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <strong>Guardar también es una forma de hacer seguimiento</strong>
          <p>
            Los favoritos te permiten separar el talento que ya te interesa del que todavía estás
            explorando. No se envía ninguna notificación al estudiante.
          </p>
        </div>
      </section>
    </>
  );
}
