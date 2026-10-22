export type Role = 'student' | 'company';

export type Area =
  | 'Programación'
  | 'Data & IA'
  | 'Matemáticas'
  | 'Física'
  | 'Diseño UX/UI'
  | 'Ingeniería'
  | 'Economía'
  | 'Marketing'
  | 'Biología'
  | 'Sostenibilidad';

export type Modality = 'Remoto' | 'Híbrido' | 'Presencial';
export type Difficulty = 'Explorador' | 'Intermedio' | 'Avanzado';
export type SolutionStatus = 'pending' | 'shortlisted' | 'accepted' | 'discarded';
export type ProjectStatus = 'open' | 'closed';
export type ProjectVisual = 'aurora' | 'ocean' | 'forest' | 'sunset' | 'violet' | 'midnight';
export type ProjectIcon = 'sparkles' | 'flask' | 'atom' | 'leaf' | 'cpu' | 'chart' | 'palette' | 'rocket';
export type OfferStatus = 'pending' | 'accepted' | 'declined';

export interface BaseUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  location: string;
  bio: string;
  phone?: string;
  createdAt: string;
}

export interface Student extends BaseUser {
  role: 'student';
  surname: string;
  age?: number;
  headline: string;
  university: string;
  degree: string;
  course: string;
  graduationYear: string;
  skills: string[];
  interests: Area[];
  languages: string;
  github?: string;
  linkedin?: string;
  noLinkedin?: boolean;
}

export interface Company extends BaseUser {
  role: 'company';
  sector: string;
  size: string;
  website?: string;
  contactName: string;
  areas: Area[];
  founded?: string;
}

export type User = Student | Company;
export type NewUser = Omit<Student, 'id' | 'createdAt'> | Omit<Company, 'id' | 'createdAt'>;

export interface Project {
  id: string;
  companyId: string;
  title: string;
  summary: string;
  description: string;
  areas: Area[];
  skills: string[];
  budget: string;
  duration: string;
  modality: Modality;
  difficulty: Difficulty;
  deadline?: string;
  prize?: string;
  maxSubmissions?: number;
  visual?: ProjectVisual;
  icon?: ProjectIcon;
  archived?: boolean;
  status: ProjectStatus;
  createdAt: string;
}

export type ProjectDraft = Omit<Project, 'id' | 'companyId' | 'status' | 'createdAt'>;

export interface Solution {
  id: string;
  projectId: string;
  studentId: string;
  title: string;
  description: string;
  link?: string;
  status: SolutionStatus;
  createdAt: string;
  deliveryLink?: string;
  deliveryNote?: string;
  deliveredAt?: string;
}

export type SolutionDraft = Pick<Solution, 'projectId' | 'studentId' | 'title' | 'description' | 'link'>;

export interface Offer {
  id: string;
  companyId: string;
  studentId: string;
  projectId?: string;
  title: string;
  message: string;
  salary?: string;
  status: OfferStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  companyId: string;
  studentId: string;
  sender: Role;
  text: string;
  createdAt: string;
}

export interface Favorite {
  companyId: string;
  studentId: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  projects: Project[];
  solutions: Solution[];
  offers: Offer[];
  messages: ChatMessage[];
  favorites: Favorite[];
}

export type Matchable = Pick<Project, 'areas' | 'skills'>;

