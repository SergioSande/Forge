import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { Area, Company, Student } from '../types';
import { AREAS } from '../lib/constants';
import { useStore } from '../store/AppStore';
import { bestStudentMatch, isProjectCompatible } from '../lib/utils';
import {
  AreaChip,
  Avatar,
  EmptyState,
  MatchBadge,
  PageHeader,
} from '../components/ui';

type Tab = 'students' | 'companies';

export function Community() {
  const { currentUser, state } = useStore();
  const [tab, setTab] = useState<Tab>(
    currentUser?.role === 'company' ? 'students' : 'companies',
  );
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<Area | 'Todas'>('Todas');

  const students = useMemo(
    () =>
      state.users.filter(
        (user): user is Student => user.role === 'student' && user.id !== currentUser?.id,
      ),
    [state.users, currentUser],
  );

  const companies = useMemo(
    () =>
      state.users.filter(
        (user): user is Company => user.role === 'company' && user.id !== currentUser?.id,
      ),
    [state.users, currentUser],
  );

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = students
      .filter((student) => {
        if (area !== 'Todas' && !student.interests.includes(area)) return false;
        if (!q) return true;
        const haystack = [
          student.name,
          student.surname,
          student.headline,
          student.university,
          student.degree,
          student.course,
          student.location,
          ...student.skills,
          ...student.interests,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .map((student) => ({
        student,
        score:
          currentUser?.role === 'company'
            ? bestStudentMatch(student, currentUser, state.projects)
            : null,
      }));

    if (currentUser?.role === 'company') {
      return items.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return items.sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [students, query, area, currentUser, state.projects]);

  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies
      .filter((company) => {
        if (area !== 'Todas' && !company.areas.includes(area)) return false;
        if (!q) return true;
        const haystack = [
          company.name,
          company.sector,
          company.bio,
          company.location,
          ...company.areas,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const aProjects = state.projects.filter(
          (project) => project.companyId === a.id && project.status === 'open',
        ).length;
        const bProjects = state.projects.filter(
          (project) => project.companyId === b.id && project.status === 'open',
        ).length;
        return bProjects - aProjects;
      });
  }, [companies, query, area, state.projects]);

  const total = tab === 'students' ? filteredStudents.length : filteredCompanies.length;
  const hasFilters = Boolean(query.trim()) || area !== 'Todas';

  const resetFilters = () => {
    setQuery('');
    setArea('Todas');
  };

  return (
    <>
      <PageHeader
        eyebrow="Comunidad Forge"
        title="Personas que están forjando algo."
        description="Explora perfiles de estudiantes y empresas. Aquí las oportunidades empiezan por conocerse."
      />

      <div className="community-toolbar">
        <div className="tab-row community-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'students'}
            className={`tab-btn ${tab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setTab('students');
              setQuery('');
            }}
          >
            <GraduationCap size={16} /> Estudiantes
            <span className="tab-count">{students.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'companies'}
            className={`tab-btn ${tab === 'companies' ? 'active' : ''}`}
            onClick={() => {
              setTab('companies');
              setQuery('');
            }}
          >
            <Building2 size={16} /> Empresas
            <span className="tab-count">{companies.length}</span>
          </button>
        </div>

        <div className="community-filters">
          <div className="search-box compact">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tab === 'students' ? 'Buscar estudiante, universidad...' : 'Buscar empresa, sector...'}
              aria-label="Buscar en la comunidad"
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Limpiar">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            className="area-select"
            value={area}
            onChange={(event) => setArea(event.target.value as Area | 'Todas')}
            aria-label="Filtrar por área"
          >
            <option value="Todas">Todas las áreas</option>
            {AREAS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-head community-results">
        <span>
          <strong>{total}</strong>{' '}
          {tab === 'students'
            ? total === 1
              ? 'estudiante'
              : 'estudiantes'
            : total === 1
              ? 'empresa'
              : 'empresas'}
          {hasFilters ? ' con esos filtros' : ''}
        </span>
        {currentUser?.role === 'company' && tab === 'students' && (
          <span className="results-note">
            <Sparkles size={14} /> Ordenados por afinidad con tus retos
          </span>
        )}
        {hasFilters && (
          <button className="text-link button-link" onClick={resetFilters}>
            Limpiar filtros <X size={14} />
          </button>
        )}
      </div>

      {tab === 'students' ? (
        filteredStudents.length ? (
          <div className="people-grid">
            {filteredStudents.map(({ student, score }) => (
              <Link key={student.id} to={`/app/u/${student.id}`} className="person-card">
                <div className="person-card-top">
                  <Avatar user={student} size="lg" />
                  {score !== null ? (
                    <MatchBadge score={score} />
                  ) : (
                    <span className="availability-pill">
                      {student.age ? `${student.age} años` : student.course}
                    </span>
                  )}
                </div>
                <h3>
                  {student.name} {student.surname}
                </h3>
                <p className="person-headline">{student.headline}</p>
                <div className="person-meta">
                  <span>
                    <GraduationCap size={15} /> {student.degree}
                  </span>
                  <span>
                    <MapPin size={15} /> {student.location}
                  </span>
                </div>
                <span className="person-university">
                  {student.university} · {student.course}
                </span>
                <div className="tag-wrap person-skills">
                  {student.skills.slice(0, 4).map((skill) => (
                    <span className="skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                  {student.skills.length > 4 && (
                    <span className="more-chip">+{student.skills.length - 4}</span>
                  )}
                </div>
                <div className="person-card-footer">
                  <span>
                    <GraduationCap size={14} /> {student.course}
                  </span>
                  <span className="card-link">
                    Ver perfil <ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={26} />}
            title="No encontramos estudiantes con esos filtros"
            description="Prueba a buscar por otra habilidad, universidad o área de interés."
            action={
              <button className="btn btn-soft" onClick={resetFilters}>
                Ver todos los estudiantes
              </button>
            }
          />
        )
      ) : filteredCompanies.length ? (
        <div className="companies-directory-grid">
          {filteredCompanies.map((company) => {
            const openProjects = state.projects.filter(
              (project) =>
                project.companyId === company.id &&
                project.status === 'open' &&
                !project.archived,
            );
            const studentViewer = currentUser?.role === 'student' ? currentUser : null;
            const visibleProjects = studentViewer
              ? openProjects.filter((project) =>
                  isProjectCompatible(studentViewer, project),
                )
              : openProjects;
            return (
              <Link key={company.id} to={`/app/u/${company.id}`} className="directory-company-card">
                <div className="directory-company-top">
                  <Avatar user={company} size="lg" />
                  <span className="open-count">
                    {visibleProjects.length}{' '}
                    {visibleProjects.length === 1 ? 'reto abierto' : 'retos abiertos'}
                  </span>
                </div>
                <h3>{company.name}</h3>
                <span className="directory-sector">{company.sector}</span>
                <p className="directory-bio">{company.bio}</p>
                <div className="tag-wrap">
                  {company.areas.slice(0, 3).map((item) => (
                    <AreaChip key={item} area={item} tone="soft" />
                  ))}
                </div>
                {visibleProjects.length > 0 && (
                  <div className="recent-project-line">
                    <span className="recent-project-dot" />
                    <span>{visibleProjects[0].title}</span>
                    <ArrowRight size={13} />
                  </div>
                )}
                <div className="directory-company-footer">
                  <span>
                    <MapPin size={14} /> {company.location}
                  </span>
                  <span>{company.size}</span>
                  <span className="card-link">
                    Ver perfil <ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Building2 size={26} />}
          title="No encontramos empresas con esos filtros"
          description="Prueba con otro sector o limpia los filtros para ver todas las empresas de Forge."
          action={
            <button className="btn btn-soft" onClick={resetFilters}>
              Ver todas las empresas
            </button>
          }
        />
      )}
    </>
  );
}
