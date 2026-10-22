import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, MapPin, Trophy, Users, Wallet } from 'lucide-react';
import type { Company, Project } from '../types';
import { deadlineLabel } from '../lib/utils';
import { AreaChip, Avatar, MatchBadge } from './ui';

export function ProjectCard({
  project,
  company,
  match,
  landing = false,
  solutionCount,
}: {
  project: Project;
  company?: Company;
  match?: number;
  landing?: boolean;
  solutionCount?: number;
}) {
  return (
    <Link
      to={landing ? '/login' : `/app/proyectos/${project.id}`}
      className={`project-card ${landing ? 'project-card-landing' : ''}`}
    >
      <div className="project-card-top">
        <div className="company-mini">
          {company && <Avatar user={company} size="xs" />}
          <span>{company?.name ?? 'Empresa'}</span>
        </div>
        {match !== undefined ? (
          <MatchBadge score={match} />
        ) : (
          <span className="open-chip">
            <span className="dot" /> Abierto
          </span>
        )}
      </div>

      <h3>{project.title}</h3>
      <p className="project-summary">{project.summary}</p>

      <div className="area-row">
        {project.areas.slice(0, 2).map((area) => (
          <AreaChip key={area} area={area} tone="soft" />
        ))}
        {project.areas.length > 2 && <span className="more-chip">+{project.areas.length - 2}</span>}
      </div>

      <div className="project-meta-row">
        <span>
          <Wallet size={14} /> {project.budget}
        </span>
        <span>
          <Clock size={14} /> {project.duration}
        </span>
        <span>
          <MapPin size={14} /> {project.modality}
        </span>
        {solutionCount !== undefined && (
          <span>
            <Users size={14} /> {solutionCount}
            {project.maxSubmissions ? `/${project.maxSubmissions}` : ''} propuestas
          </span>
        )}
      </div>

      {project.prize && (
        <div className="prize-chip">
          <Trophy size={13} /> {project.prize}
        </div>
      )}

      <div className="project-card-footer">
        <span className="deadline-text">{deadlineLabel(project.deadline)}</span>
        <span className="card-link">
          Ver reto <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}
