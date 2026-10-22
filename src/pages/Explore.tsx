import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Compass, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { Area, Modality, Student } from '../types';
import { AREAS, MODALITIES } from '../lib/constants';
import { useStore } from '../store/AppStore';
import { findCompany, getStudentOpenProjects, matchScore } from '../lib/utils';
import { EmptyState, PageHeader } from '../components/ui';
import { ProjectCard } from '../components/ProjectCard';

export function Explore() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  if (currentUser.role !== 'student') return <Navigate to="/app/mis-proyectos" replace />;
  return <ExploreProjects student={currentUser} />;
}

function ExploreProjects({ student }: { student: Student }) {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<Area | 'Todas'>('Todas');
  const [modality, setModality] = useState<Modality | 'Todas'>('Todas');
  const [sort, setSort] = useState<'match' | 'recent'>('match');
  const [highOnly, setHighOnly] = useState(false);

  const allScored = useMemo(
    () =>
      getStudentOpenProjects(student, state.projects)
        .map((project) => ({ project, score: matchScore(student, project) }))
        .sort((a, b) => b.score - a.score),
    [state.projects, student],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const items = allScored.filter(({ project, score }) => {
      if (area !== 'Todas' && !project.areas.includes(area)) return false;
      if (modality !== 'Todas' && project.modality !== modality) return false;
      if (highOnly && score < 80) return false;
      if (!normalizedQuery) return true;
      const company = state.users.find((user) => user.id === project.companyId);
      const haystack = [
        project.title,
        project.summary,
        project.description,
        project.modality,
        ...project.skills,
        ...project.areas,
        company?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    if (sort === 'recent') {
      return [...items].sort(
        (a, b) =>
          new Date(b.project.createdAt).getTime() - new Date(a.project.createdAt).getTime(),
      );
    }
    return items;
  }, [allScored, area, modality, highOnly, query, sort, state.users]);

  const activeFilters = area !== 'Todas' || modality !== 'Todas' || highOnly || Boolean(query.trim());

  const resetFilters = () => {
    setQuery('');
    setArea('Todas');
    setModality('Todas');
    setHighOnly(false);
    setSort('match');
  };

  return (
    <>
      <PageHeader
        eyebrow="Explorar retos"
        title="Encuentra el reto que te mueva."
        description="Retos reales de empresas, ordenados por lo que encaja contigo. Sin experiencia previa: con ganas y una buena propuesta."
        action={
          <Link to="/app/postulaciones" className="btn btn-secondary">
            Mis postulaciones
          </Link>
        }
      />

      <section className="explore-highlight">
        <span className="explore-highlight-icon">
          <Sparkles size={20} />
        </span>
        <div>
          <strong>
            {allScored.filter(({ score }) => score >= 80).length}{' '}
            {allScored.filter(({ score }) => score >= 80).length === 1
              ? 'reto con un encaje alto'
              : 'retos con un encaje alto'}
          </strong>
          <span>Según tus habilidades, áreas de interés y formación.</span>
        </div>
        <button
          className={`toggle-pill ${highOnly ? 'active' : ''}`}
          onClick={() => setHighOnly((value) => !value)}
          aria-pressed={highOnly}
        >
          Solo 80%+
        </button>
      </section>

      <section className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por reto, empresa o habilidad..."
            aria-label="Buscar proyectos"
          />
          {query && (
            <button
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filter-selects">
          <label className="select-inline">
            <SlidersHorizontal size={16} />
            <select
              value={modality}
              onChange={(event) => setModality(event.target.value as Modality | 'Todas')}
              aria-label="Filtrar por modalidad"
            >
              <option value="Todas">Todas las modalidades</option>
              {MODALITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="select-inline">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as 'match' | 'recent')}
              aria-label="Ordenar proyectos"
            >
              <option value="match">Mejor match</option>
              <option value="recent">Más recientes</option>
            </select>
          </label>
        </div>
      </section>

      <div className="area-filter-row" role="group" aria-label="Filtrar por área">
        <button
          className={`filter-chip ${area === 'Todas' ? 'active' : ''}`}
          onClick={() => setArea('Todas')}
        >
          Todas las áreas
        </button>
        {AREAS.map((item) => (
          <button
            key={item}
            className={`filter-chip ${area === item ? 'active' : ''}`}
            onClick={() => setArea(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="results-head">
        <span>
          <strong>{filtered.length}</strong>{' '}
          {filtered.length === 1 ? 'reto encontrado' : 'retos encontrados'}
        </span>
        {activeFilters && (
          <button className="text-link button-link" onClick={resetFilters}>
            Limpiar filtros <X size={14} />
          </button>
        )}
      </div>

      {filtered.length ? (
        <div className="project-grid three">
          {filtered.map(({ project, score }) => {
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
          title="No hay retos con esos filtros"
          description="Prueba a ampliar la búsqueda o quitar algún filtro. Seguro que hay un reto esperando tu mirada."
          action={
            <button className="btn btn-primary" onClick={resetFilters}>
              Ver todos los retos
            </button>
          }
        />
      )}
    </>
  );
}
