import type { Area, ProjectIcon, ProjectVisual } from '../types';

export const AREAS: Area[] = [
  'Programación',
  'Data & IA',
  'Matemáticas',
  'Física',
  'Diseño UX/UI',
  'Ingeniería',
  'Economía',
  'Marketing',
  'Biología',
  'Sostenibilidad',
];

export const AREA_ICONS: Record<Area, string> = {
  Programación: '{ }',
  'Data & IA': 'AI',
  Matemáticas: '∑',
  Física: '⚛',
  'Diseño UX/UI': '✦',
  Ingeniería: '⚙',
  Economía: '€',
  Marketing: '↗',
  Biología: '✿',
  Sostenibilidad: '☀',
};

export const SKILLS = [
  'Python',
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'SQL',
  'Machine Learning',
  'NLP',
  'C++',
  'Java',
  'Cloud',
  'Docker',
  'API REST',
  'Figma',
  'UX Research',
  'Prototipado',
  'Data Viz',
  'Power BI',
  'Estadística',
  'Cálculo numérico',
  'Física computacional',
  'Simulación',
  'MATLAB',
  'OpenCV',
  'ROS',
  'IoT',
  'Automatización',
  'Excel avanzado',
  'Investigación',
  'Modelado 3D',
];

export const UNIVERSITIES = [
  'Universidad Politécnica de Madrid',
  'Universidad Complutense de Madrid',
  'Universidad Autónoma de Madrid',
  'Universitat Politècnica de València',
  'Universidad de Barcelona',
  'Universidad de Sevilla',
  'Universidad de Zaragoza',
  'Universidad de Málaga',
  'Universidad del País Vasco',
  'Universidad de Granada',
  'Universidad de Salamanca',
  'Universidad de Vigo',
  'Otra universidad',
];

export const COURSES = ['3º curso', '4º curso', 'Máster', 'Recién graduado/a'];

export const MIN_STUDENT_AGE = 16;
export const MAX_STUDENT_AGE = 99;

export const COMPANY_SIZES = [
  '1-10 personas',
  '11-50 personas',
  '51-200 personas',
  '200+ personas',
];

export const MODALITIES = ['Remoto', 'Híbrido', 'Presencial'] as const;
export const DIFFICULTIES = ['Explorador', 'Intermedio', 'Avanzado'] as const;

export const PROJECT_VISUALS: Array<{
  id: ProjectVisual;
  label: string;
  colors: [string, string, string];
}> = [
  { id: 'aurora', label: 'Aurora', colors: ['#0ea5e9', '#2563eb', '#7c3aed'] },
  { id: 'ocean', label: 'Océano', colors: ['#0891b2', '#0284c7', '#1e3a8a'] },
  { id: 'forest', label: 'Bosque', colors: ['#0f766e', '#15803d', '#0e7490'] },
  { id: 'sunset', label: 'Atardecer', colors: ['#f97316', '#e11d48', '#7c3aed'] },
  { id: 'violet', label: 'Violeta', colors: ['#8b5cf6', '#6d28d9', '#2563eb'] },
  { id: 'midnight', label: 'Medianoche', colors: ['#1e3a8a', '#312e81', '#0f172a'] },
];

export const PROJECT_ICONS: Array<{ id: ProjectIcon; label: string }> = [
  { id: 'sparkles', label: 'Chispa' },
  { id: 'flask', label: 'Ciencia' },
  { id: 'atom', label: 'Átomo' },
  { id: 'leaf', label: 'Sostenibilidad' },
  { id: 'cpu', label: 'Tecnología' },
  { id: 'chart', label: 'Datos' },
  { id: 'palette', label: 'Diseño' },
  { id: 'rocket', label: 'Innovación' },
];

export const AREA_DEFAULT_VISUALS: Record<Area, ProjectVisual> = {
  Programación: 'aurora',
  'Data & IA': 'ocean',
  Matemáticas: 'violet',
  Física: 'midnight',
  'Diseño UX/UI': 'sunset',
  Ingeniería: 'midnight',
  Economía: 'violet',
  Marketing: 'sunset',
  Biología: 'forest',
  Sostenibilidad: 'forest',
};

export const AREA_DEFAULT_ICONS: Record<Area, ProjectIcon> = {
  Programación: 'cpu',
  'Data & IA': 'chart',
  Matemáticas: 'atom',
  Física: 'atom',
  'Diseño UX/UI': 'palette',
  Ingeniería: 'cpu',
  Economía: 'chart',
  Marketing: 'sparkles',
  Biología: 'leaf',
  Sostenibilidad: 'leaf',
};

export const DEMO_STUDENT_EMAIL = 'lucia@demo.forge';
export const DEMO_COMPANY_EMAIL = 'nebula@demo.forge';
export const DEMO_PASSWORD = 'demo1234';

export const WELCOME_KEY = 'forge_welcomed_v1';
