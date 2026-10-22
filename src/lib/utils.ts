import type {
  Company,
  Matchable,
  OfferStatus,
  Project,
  ProjectIcon,
  ProjectVisual,
  Role,
  Solution,
  SolutionStatus,
  Student,
  User,
} from '../types';
import { AREA_DEFAULT_ICONS, AREA_DEFAULT_VISUALS, PROJECT_VISUALS } from './constants';

export function isStudentUser(user: User): user is Student {
  return user.role === 'student';
}

export function isCompanyUser(user: User): user is Company {
  return user.role === 'company';
}

export function findCompany(users: User[], id: string): Company | undefined {
  return users.find((user): user is Company => user.role === 'company' && user.id === id);
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
  'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
  'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
  'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
  'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
];

export function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

const normalize = (value: string) => value.trim().toLowerCase();

export function matchScore(student: Student, target: Matchable): number {
  const studentSkills = new Set(student.skills.map(normalize));
  const skillHits = target.skills.filter((skill) => studentSkills.has(normalize(skill))).length;
  const areaHits = target.areas.filter((area) => student.interests.includes(area)).length;

  const skillRatio = target.skills.length ? skillHits / target.skills.length : 0;
  const areaRatio = target.areas.length ? areaHits / target.areas.length : 0;
  const score = 20 + 46 * skillRatio + 34 * areaRatio;

  return Math.max(26, Math.min(99, Math.round(score)));
}

export function matchLabel(score: number) {
  if (score >= 85) return 'Encaje excelente';
  if (score >= 70) return 'Muy compatible';
  if (score >= 50) return 'Compatible';
  return 'Para explorar';
}

export function bestStudentMatch(student: Student, company: Company, projects: Project[]) {
  const ownProjects = projects.filter(
    (project) => project.companyId === company.id && project.status === 'open',
  );

  if (ownProjects.length) {
    return Math.max(...ownProjects.map((project) => matchScore(student, project)));
  }

  const areaHits = company.areas.filter((area) => student.interests.includes(area)).length;
  const ratio = company.areas.length ? areaHits / company.areas.length : 0;
  return Math.min(96, Math.round(42 + ratio * 50));
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'ahora mismo';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

export function formatDate(iso?: string) {
  if (!iso) return '—';
  const date = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(date);
}

export function formatLongDate(iso: string) {
  const date = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function daysUntil(iso: string) {
  if (!iso) return Number.POSITIVE_INFINITY;
  const end = new Date(`${iso.slice(0, 10)}T23:59:59`).getTime();
  const diff = end - Date.now();
  return Math.ceil(diff / 86400000);
}

export function deadlineLabel(iso?: string) {
  if (!iso) return 'Sin fecha límite';
  const days = daysUntil(iso);
  if (days < 0) return 'Plazo cerrado';
  if (days === 0) return 'Último día';
  if (days === 1) return 'Queda 1 día';
  return `Quedan ${days} días`;
}

export function isProjectCompatible(student: Student, project: Pick<Project, 'areas'>) {
  return project.areas.some((area) => student.interests.includes(area));
}

export function getStudentOpenProjects(student: Student, projects: Project[]) {
  return projects.filter(
    (project) =>
      project.status === 'open' &&
      !project.archived &&
      isProjectCompatible(student, project),
  );
}

export function canStudentApply(student: Student) {
  return student.course !== '2º curso';
}

export function projectVisual(project: Pick<Project, 'areas' | 'visual'>): ProjectVisual {
  return project.visual ?? AREA_DEFAULT_VISUALS[project.areas[0]] ?? 'aurora';
}

export function projectIcon(project: Pick<Project, 'areas' | 'icon'>): ProjectIcon {
  return project.icon ?? AREA_DEFAULT_ICONS[project.areas[0]] ?? 'sparkles';
}

export function projectTheme(project: Pick<Project, 'areas' | 'visual'>) {
  const visual = projectVisual(project);
  return PROJECT_VISUALS.find((theme) => theme.id === visual) ?? PROJECT_VISUALS[0];
}

export function mixHexColors(first: string, second: string, amount: number) {
  const clamp = Math.max(0, Math.min(1, amount));
  const parse = (hex: string) => {
    const value = hex.replace('#', '');
    const full =
      value.length === 3
        ? value
            .split('')
            .map((character) => character + character)
            .join('')
        : value;
    return [
      Number.parseInt(full.slice(0, 2), 16),
      Number.parseInt(full.slice(2, 4), 16),
      Number.parseInt(full.slice(4, 6), 16),
    ];
  };
  const a = parse(first);
  const b = parse(second);
  const mixed = a.map((channel, index) =>
    Math.round(channel + (b[index] - channel) * clamp)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${mixed.join('')}`;
}

export function workStage(solution: Solution) {
  if (solution.status === 'accepted' && solution.deliveredAt) {
    return { label: 'Entregado', tone: 'green' as const };
  }
  if (solution.status === 'accepted') {
    return { label: 'En desarrollo', tone: 'blue' as const };
  }
  if (solution.status === 'shortlisted') {
    return { label: 'Preseleccionado', tone: 'amber' as const };
  }
  if (solution.status === 'discarded') {
    return { label: 'Descartado', tone: 'gray' as const };
  }
  return { label: 'Propuesta enviada', tone: 'blue' as const };
}

export const OFFER_STATUS_META: Record<
  OfferStatus,
  { label: string; tone: 'blue' | 'amber' | 'green' | 'gray' }
> = {
  pending: { label: 'Pendiente', tone: 'amber' },
  accepted: { label: 'Aceptada', tone: 'green' },
  declined: { label: 'Rechazada', tone: 'gray' },
};

export function todayLong() {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 7) return 'Buenas noches';
  if (hour < 13) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function firstName(name: string) {
  return name.split(' ')[0];
}

export function profileCompleteness(user: User, projectCount = 0) {
  if (user.role === 'student') {
    const checks = [
      Boolean(user.university && user.degree && user.course),
      user.skills.length >= 3,
      user.interests.length >= 1,
      user.bio.length >= 40,
      Boolean(user.github || user.linkedin || user.noLinkedin),
      Boolean(user.languages),
      Boolean(user.phone),
      Boolean(user.age),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  const checks = [
    Boolean(user.sector && user.size && user.contactName),
    user.areas.length >= 1,
    user.bio.length >= 40,
    Boolean(user.website),
    projectCount > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const SOLUTION_STATUS_META: Record<
  SolutionStatus,
  { label: string; tone: 'blue' | 'amber' | 'green' | 'gray' }
> = {
  pending: { label: 'Nueva', tone: 'blue' },
  shortlisted: { label: 'Preseleccionada', tone: 'amber' },
  accepted: { label: 'Aceptada', tone: 'green' },
  discarded: { label: 'Descartada', tone: 'gray' },
};

export function roleLabel(role: Role) {
  return role === 'student' ? 'Estudiante' : 'Empresa';
}
