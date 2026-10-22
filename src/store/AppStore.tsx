import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type {
  AppState,
  ChatMessage,
  Company,
  NewUser,
  Offer,
  OfferStatus,
  Project,
  ProjectDraft,
  Solution,
  SolutionDraft,
  SolutionStatus,
  Student,
  User,
} from '../types';
import { createSeedState } from '../data/seed';
import { WELCOME_KEY } from '../lib/constants';

const STATE_KEY = 'forge_state_v1';
const SESSION_KEY = 'forge_session_v1';

export type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

interface OfferInput {
  studentId: string;
  projectId?: string;
  title: string;
  message: string;
  salary?: string;
}

interface StoreValue {
  state: AppState;
  currentUser: User | null;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
  register: (user: NewUser) => AuthResult;
  addProject: (draft: ProjectDraft) => Project;
  addSolution: (draft: Omit<SolutionDraft, 'studentId'>) => Solution;
  updateSolutionStatus: (solutionId: string, status: SolutionStatus) => void;
  deliverSolution: (solutionId: string, deliveryLink: string, deliveryNote: string) => void;
  updateCurrentUser: (patch: Partial<Student> & Partial<Company>) => void;
  toggleFavorite: (studentId: string) => boolean;
  createOffer: (input: OfferInput) => Offer;
  updateOfferStatus: (offerId: string, status: OfferStatus) => void;
  sendMessage: (peerId: string, text: string) => ChatMessage;
  setProjectArchived: (projectId: string, archived: boolean) => void;
  resetDemo: () => void;
  notify: (message: string, tone?: ToastTone) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (
      !parsed ||
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.projects) ||
      !Array.isArray(parsed.solutions)
    ) {
      return createSeedState();
    }

    const seed = createSeedState();
    const legacy = !Array.isArray(parsed.offers);

    const users = parsed.users.map((user) => {
      if (user.role !== 'student') return user;
      const demoStudent = seed.users.find(
        (item): item is Student => item.id === user.id && item.role === 'student',
      );
      return {
        ...user,
        age: user.age ?? demoStudent?.age,
        noLinkedin: user.noLinkedin ?? false,
      };
    });

    let projects: Project[] = parsed.projects.map((project) => ({
      ...project,
      archived: project.archived ?? false,
    }));

    if (legacy && !projects.some((project) => project.id === 'p13')) {
      const archivedDemo = seed.projects.find((project) => project.id === 'p13');
      if (archivedDemo) projects = [...projects, archivedDemo];
    }

    const solutions = legacy
      ? parsed.solutions.map((solution) =>
          solution.id === 'sol4' && solution.status === 'shortlisted'
            ? { ...solution, status: 'accepted' as const }
            : solution,
        )
      : parsed.solutions;

    return {
      users,
      projects,
      solutions,
      offers: legacy ? seed.offers : Array.isArray(parsed.offers) ? parsed.offers : [],
      messages: legacy
        ? seed.messages
        : Array.isArray(parsed.messages)
          ? parsed.messages
          : [],
      favorites: legacy
        ? seed.favorites
        : Array.isArray(parsed.favorites)
          ? parsed.favorites
          : [],
    };
  } catch {
    return createSeedState();
  }
}

function newId(prefix: string) {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY),
  );
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === sessionId) ?? null,
    [state.users, sessionId],
  );

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
    else localStorage.removeItem(SESSION_KEY);
  }, [sessionId]);

  useEffect(() => {
    if (sessionId && !currentUser) setSessionId(null);
  }, [sessionId, currentUser]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const notify = useCallback((message: string, tone: ToastTone = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  const login = useCallback(
    (email: string, password: string): AuthResult => {
      const normalized = email.trim().toLowerCase();
      const user = state.users.find((item) => item.email.toLowerCase() === normalized);
      if (!user) {
        return { ok: false, error: 'No encontramos ninguna cuenta con ese email.' };
      }
      if (user.password !== password) {
        return { ok: false, error: 'La contraseña no es correcta. Inténtalo de nuevo.' };
      }
      setSessionId(user.id);
      return { ok: true, user };
    },
    [state.users],
  );

  const logout = useCallback(() => {
    setSessionId(null);
  }, []);

  const register = useCallback(
    (data: NewUser): AuthResult => {
      const normalized = data.email.trim().toLowerCase();
      if (state.users.some((user) => user.email.toLowerCase() === normalized)) {
        return { ok: false, error: 'Ya existe una cuenta con este email. Prueba a iniciar sesión.' };
      }
      const user = {
        ...data,
        email: data.email.trim(),
        id: newId(data.role === 'student' ? 's' : 'c'),
        createdAt: new Date().toISOString(),
      } as User;
      setState((prev) => ({ ...prev, users: [user, ...prev.users] }));
      setSessionId(user.id);
      return { ok: true, user };
    },
    [state.users],
  );

  const addProject = useCallback(
    (draft: ProjectDraft): Project => {
      if (!currentUser || currentUser.role !== 'company') {
        throw new Error('Solo las empresas pueden publicar proyectos.');
      }
      const project: Project = {
        ...draft,
        id: newId('p'),
        companyId: currentUser.id,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
      return project;
    },
    [currentUser],
  );

  const addSolution = useCallback(
    (draft: Omit<SolutionDraft, 'studentId'>): Solution => {
      if (!currentUser || currentUser.role !== 'student') {
        throw new Error('Solo los estudiantes pueden enviar soluciones.');
      }
      const duplicate = state.solutions.some(
        (solution) =>
          solution.projectId === draft.projectId && solution.studentId === currentUser.id,
      );
      if (duplicate) {
        throw new Error('Ya has enviado una solución a este proyecto.');
      }
      const solution: Solution = {
        ...draft,
        id: newId('sol'),
        studentId: currentUser.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, solutions: [solution, ...prev.solutions] }));
      return solution;
    },
    [currentUser, state.solutions],
  );

  const updateSolutionStatus = useCallback((solutionId: string, status: SolutionStatus) => {
    setState((prev) => ({
      ...prev,
      solutions: prev.solutions.map((solution) =>
        solution.id === solutionId ? { ...solution, status } : solution,
      ),
    }));
  }, []);

  const deliverSolution = useCallback(
    (solutionId: string, deliveryLink: string, deliveryNote: string) => {
      if (!currentUser || currentUser.role !== 'student') {
        throw new Error('Solo los estudiantes pueden entregar proyectos.');
      }
      setState((prev) => ({
        ...prev,
        solutions: prev.solutions.map((solution) =>
          solution.id === solutionId &&
          solution.studentId === currentUser.id &&
          solution.status === 'accepted'
            ? {
                ...solution,
                deliveryLink,
                deliveryNote,
                deliveredAt: new Date().toISOString(),
              }
            : solution,
        ),
      }));
    },
    [currentUser],
  );

  const updateCurrentUser = useCallback(
    (patch: Partial<Student> & Partial<Company>) => {
      if (!currentUser) return;
      setState((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user.id === currentUser.id ? ({ ...user, ...patch } as User) : user,
        ),
      }));
    },
    [currentUser],
  );

  const toggleFavorite = useCallback(
    (studentId: string) => {
      if (!currentUser || currentUser.role !== 'company') {
        throw new Error('Solo las empresas pueden guardar estudiantes.');
      }
      const exists = state.favorites.some(
        (favorite) =>
          favorite.companyId === currentUser.id && favorite.studentId === studentId,
      );
      setState((prev) => ({
        ...prev,
        favorites: exists
          ? prev.favorites.filter(
              (favorite) =>
                !(favorite.companyId === currentUser.id && favorite.studentId === studentId),
            )
          : [
              {
                companyId: currentUser.id,
                studentId,
                createdAt: new Date().toISOString(),
              },
              ...prev.favorites,
            ],
      }));
      return !exists;
    },
    [currentUser, state.favorites],
  );

  const createOffer = useCallback(
    (input: OfferInput): Offer => {
      if (!currentUser || currentUser.role !== 'company') {
        throw new Error('Solo las empresas pueden enviar ofertas.');
      }
      const student = state.users.find(
        (user): user is Student => user.id === input.studentId && user.role === 'student',
      );
      if (!student) throw new Error('No encontramos a ese estudiante.');

      const now = new Date().toISOString();
      const offer: Offer = {
        id: newId('offer'),
        companyId: currentUser.id,
        studentId: input.studentId,
        projectId: input.projectId,
        title: input.title,
        message: input.message,
        salary: input.salary,
        status: 'pending',
        createdAt: now,
      };
      const message: ChatMessage = {
        id: newId('msg'),
        companyId: currentUser.id,
        studentId: input.studentId,
        sender: 'company',
        text: `Te he enviado una oferta: «${input.title}». Puedes revisarla en Mis ofertas.`,
        createdAt: now,
      };
      setState((prev) => ({
        ...prev,
        offers: [offer, ...prev.offers],
        messages: [...prev.messages, message],
      }));
      return offer;
    },
    [currentUser, state.users],
  );

  const updateOfferStatus = useCallback(
    (offerId: string, status: OfferStatus) => {
      if (!currentUser) return;
      const offer = state.offers.find((item) => item.id === offerId);
      if (!offer) return;
      const isCompany =
        currentUser.role === 'company' && offer.companyId === currentUser.id;
      const isStudent =
        currentUser.role === 'student' && offer.studentId === currentUser.id;
      if (!isCompany && !isStudent) return;

      const now = new Date().toISOString();
      const responseMessage: ChatMessage | null = isStudent
        ? {
            id: newId('msg'),
            companyId: offer.companyId,
            studentId: offer.studentId,
            sender: 'student',
            text:
              status === 'accepted'
                ? `He aceptado la oferta «${offer.title}». ¡Gracias! Hablemos de los siguientes pasos.`
                : `He decidido no seguir con la oferta «${offer.title}», gracias por la propuesta.`,
            createdAt: now,
          }
        : null;

      setState((prev) => ({
        ...prev,
        offers: prev.offers.map((item) =>
          item.id === offerId ? { ...item, status } : item,
        ),
        messages: responseMessage ? [...prev.messages, responseMessage] : prev.messages,
      }));
    },
    [currentUser, state.offers],
  );

  const sendMessage = useCallback(
    (peerId: string, text: string): ChatMessage => {
      if (!currentUser) throw new Error('Inicia sesión para enviar mensajes.');
      const cleanText = text.trim();
      if (!cleanText) throw new Error('Escribe un mensaje antes de enviarlo.');

      const companyId =
        currentUser.role === 'company' ? currentUser.id : peerId;
      const studentId =
        currentUser.role === 'student' ? currentUser.id : peerId;

      const company = state.users.find(
        (user): user is Company =>
          user.id === companyId && user.role === 'company',
      );
      const student = state.users.find(
        (user): user is Student =>
          user.id === studentId && user.role === 'student',
      );
      if (!company || !student) {
        throw new Error('No encontramos esa conversación.');
      }

      const message: ChatMessage = {
        id: newId('msg'),
        companyId,
        studentId,
        sender: currentUser.role,
        text: cleanText,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({ ...prev, messages: [...prev.messages, message] }));
      return message;
    },
    [currentUser, state.users],
  );

  const setProjectArchived = useCallback(
    (projectId: string, archived: boolean) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === projectId &&
          currentUser?.role === 'company' &&
          project.companyId === currentUser.id
            ? { ...project, archived }
            : project,
        ),
      }));
    },
    [currentUser],
  );

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(WELCOME_KEY);
    setState(createSeedState());
    setSessionId(null);
    setToast(null);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      currentUser,
      login,
      logout,
      register,
      addProject,
      addSolution,
      updateSolutionStatus,
      deliverSolution,
      updateCurrentUser,
      toggleFavorite,
      createOffer,
      updateOfferStatus,
      sendMessage,
      setProjectArchived,
      resetDemo,
      notify,
    }),
    [
      state,
      currentUser,
      login,
      logout,
      register,
      addProject,
      addSolution,
      updateSolutionStatus,
      deliverSolution,
      updateCurrentUser,
      toggleFavorite,
      createOffer,
      updateOfferStatus,
      sendMessage,
      setProjectArchived,
      resetDemo,
      notify,
    ],
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.tone}`} role="status" key={toast.id}>
          <span className="toast-icon" aria-hidden="true">
            {toast.tone === 'success' && <CheckCircle2 size={19} />}
            {toast.tone === 'error' && <AlertTriangle size={19} />}
            {toast.tone === 'info' && <Info size={19} />}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore debe usarse dentro de StoreProvider');
  return context;
}
