import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Atom,
  BarChart3,
  CalendarDays,
  Clock,
  Cpu,
  FlaskConical,
  Leaf,
  MapPin,
  Palette,
  Rocket,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import type { Company, Project, ProjectIcon } from '../types';
import {
  deadlineLabel,
  formatDate,
  mixHexColors,
  projectIcon,
  projectTheme,
} from '../lib/utils';
import { Avatar } from './ui';

const ICON_COMPONENTS = {
  sparkles: Sparkles,
  flask: FlaskConical,
  atom: Atom,
  leaf: Leaf,
  cpu: Cpu,
  chart: BarChart3,
  palette: Palette,
  rocket: Rocket,
} satisfies Record<ProjectIcon, typeof Sparkles>;

export function ProjectCover({
  project,
  company,
  solutionCount,
}: {
  project: Project;
  company?: Company;
  solutionCount: number;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / 520)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const theme = projectTheme(project);
  const Icon = ICON_COMPONENTS[projectIcon(project)];
  const first = mixHexColors(theme.colors[0], theme.colors[1], scrollProgress * 0.6);
  const second = mixHexColors(
    theme.colors[1],
    theme.colors[2],
    Math.min(1, 0.25 + scrollProgress * 0.7),
  );
  const angle = 125 + scrollProgress * 45;

  return (
    <div className="project-cover-wrap">
      <section
        className="project-cover"
        style={{
          background: `linear-gradient(${angle}deg, ${first} 0%, ${second} 62%, ${theme.colors[2]} 100%)`,
        }}
      >
        <div className="project-cover-grid" aria-hidden="true" />
        <span className="project-cover-orb orb-one" aria-hidden="true" />
        <span className="project-cover-orb orb-two" aria-hidden="true" />

        <div className="project-cover-top">
          {company ? (
            <Link to={`/app/u/${company.id}`} className="cover-company">
              <Avatar user={company} size="md" />
              <div>
                <strong>{company.name}</strong>
                <span>
                  {company.sector} · {company.location}
                </span>
              </div>
            </Link>
          ) : (
            <span className="cover-company">
              <div>
                <strong>Proyecto de empresa</strong>
                <span>Forge</span>
              </div>
            </span>
          )}

          <span className="cover-proposals">
            <Users size={14} /> {solutionCount}
            {project.maxSubmissions ? `/${project.maxSubmissions}` : ''} propuestas
          </span>
        </div>

        <div className="project-cover-content">
          <div className="cover-tag-row">
            {project.areas.map((area) => (
              <span className="cover-tag" key={area}>
                {area}
              </span>
            ))}
            <span className="cover-tag cover-tag-outline">{project.difficulty}</span>
          </div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          {project.prize && (
            <span className="cover-prize">
              <Trophy size={15} /> {project.prize}
            </span>
          )}
        </div>

        <div
          className="project-cover-art"
          style={{
            transform: `rotate(${scrollProgress * 8}deg) translateY(${scrollProgress * -12}px)`,
          }}
          aria-hidden="true"
        >
          <span className="project-cover-art-ring" />
          <Icon size={104} strokeWidth={1.15} />
        </div>

        <div className="cover-fade" aria-hidden="true" />
      </section>

      <div className="cover-facts-bar">
        <div className="detail-fact">
          <span className="fact-icon">
            <Wallet size={18} />
          </span>
          <div>
            <span>Presupuesto</span>
            <strong>{project.budget}</strong>
          </div>
        </div>
        <div className="detail-fact">
          <span className="fact-icon">
            <Clock size={18} />
          </span>
          <div>
            <span>Duración</span>
            <strong>{project.duration}</strong>
          </div>
        </div>
        <div className="detail-fact">
          <span className="fact-icon">
            <MapPin size={18} />
          </span>
          <div>
            <span>Modalidad</span>
            <strong>{project.modality}</strong>
          </div>
        </div>
        <div className="detail-fact">
          <span className="fact-icon">
            <CalendarDays size={18} />
          </span>
          <div>
            <span>Fecha límite</span>
            <strong>
              {project.deadline
                ? `${formatDate(project.deadline)} · ${deadlineLabel(project.deadline)}`
                : 'Sin fecha límite'}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
