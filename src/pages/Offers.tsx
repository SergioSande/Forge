import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clock,
  Compass,
  Inbox,
  MessageCircle,
  Send,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import type {
  ChatMessage,
  Company,
  Offer,
  Project,
  Role,
  Student,
} from '../types';
import { useStore } from '../store/AppStore';
import { bestStudentMatch, timeAgo } from '../lib/utils';
import {
  Avatar,
  EmptyState,
  Field,
  Modal,
  OfferStatusBadge,
  PageHeader,
} from '../components/ui';

type ChatTab = 'chats' | 'offers';

interface ChatContact {
  id: string;
  name: string;
  subtitle: string;
  user: Student | Company;
  lastMessage?: string;
  lastAt?: string;
}

function pairMessages(messages: ChatMessage[], companyId: string, studentId: string) {
  return messages
    .filter(
      (message) =>
        message.companyId === companyId && message.studentId === studentId,
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function latestOfferFor(
  offers: Offer[],
  companyId: string,
  studentId: string,
): Offer | undefined {
  return offers
    .filter(
      (offer) => offer.companyId === companyId && offer.studentId === studentId,
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function Offers() {
  const { currentUser } = useStore();
  if (!currentUser) return null;
  return currentUser.role === 'company' ? (
    <CompanyOffers company={currentUser} />
  ) : (
    <StudentOffers student={currentUser} />
  );
}

/* =========================================================
   Company · offers + conversations
   ========================================================= */

function CompanyOffers({ company }: { company: Company }) {
  const { state, sendMessage, notify } = useStore();
  const [tab, setTab] = useState<ChatTab>('chats');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerStudentId, setOfferStudentId] = useState<string | null>(null);

  const students = useMemo(
    () =>
      state.users.filter((user): user is Student => user.role === 'student'),
    [state.users],
  );
  const ownOffers = useMemo(
    () =>
      state.offers
        .filter((offer) => offer.companyId === company.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.offers, company.id],
  );
  const ownProjects = state.projects.filter(
    (project) => project.companyId === company.id && !project.archived,
  );
  const ownProjectIds = new Set(ownProjects.map((project) => project.id));

  const contacts = useMemo(() => {
    const connectedIds = new Set<string>([
      ...state.solutions
        .filter((solution) => ownProjectIds.has(solution.projectId))
        .map((solution) => solution.studentId),
      ...ownOffers.map((offer) => offer.studentId),
      ...state.messages
        .filter((message) => message.companyId === company.id)
        .map((message) => message.studentId),
      ...state.favorites
        .filter((favorite) => favorite.companyId === company.id)
        .map((favorite) => favorite.studentId),
    ]);

    return Array.from(connectedIds)
      .map((studentId) => students.find((student) => student.id === studentId))
      .filter((student): student is Student => Boolean(student))
      .map((student) => {
        const messages = pairMessages(state.messages, company.id, student.id);
        const lastMessage = messages[messages.length - 1];
        const lastOffer = latestOfferFor(state.offers, company.id, student.id);
        return {
          id: student.id,
          name: `${student.name} ${student.surname}`,
          subtitle: `${student.degree} · ${student.university}`,
          user: student,
          lastMessage: lastMessage?.text ?? (lastOffer ? `Oferta: ${lastOffer.title}` : undefined),
          lastAt: lastMessage?.createdAt ?? lastOffer?.createdAt,
        } satisfies ChatContact;
      })
      .sort((a, b) => {
        if (a.lastAt && b.lastAt)
          return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
        if (a.lastAt) return -1;
        if (b.lastAt) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [
    students,
    state.solutions,
    state.messages,
    state.offers,
    state.favorites,
    ownOffers,
    company.id,
    ownProjectIds,
  ]);

  const activeContact =
    contacts.find((contact) => contact.id === selectedStudentId) ?? contacts[0];
  const activeStudent = activeContact?.user as Student | undefined;
  const activeMessages =
    activeStudent && activeContact
      ? pairMessages(state.messages, company.id, activeStudent.id)
      : [];
  const activeOffer = activeStudent
    ? latestOfferFor(state.offers, company.id, activeStudent.id)
    : undefined;

  const openOfferModal = (studentId?: string) => {
    setOfferStudentId(studentId ?? activeStudent?.id ?? students[0]?.id ?? null);
    setOfferOpen(true);
  };

  const handleSend = (text: string) => {
    if (!activeStudent) return;
    try {
      sendMessage(activeStudent.id, text);
    } catch (sendError) {
      notify(
        sendError instanceof Error ? sendError.message : 'No se pudo enviar el mensaje.',
        'error',
      );
    }
  };

  const pendingOffers = ownOffers.filter((offer) => offer.status === 'pending').length;

  return (
    <>
      <PageHeader
        eyebrow="Contacto con talento"
        title="Ofertas y conversaciones"
        description="Habla con estudiantes que ya han demostrado lo que saben y dales el siguiente paso: una oferta, una colaboración o un nuevo reto."
        action={
          <button
            className="btn btn-primary"
            onClick={() => openOfferModal(activeStudent?.id)}
            disabled={!students.length}
          >
            <BriefcaseBusiness size={17} /> Nueva oferta
          </button>
        }
      />

      <div className="offers-summary">
        <div className="workspace-stat">
          <span className="stat-icon sky">
            <MessageCircle size={18} />
          </span>
          <div>
            <strong>{contacts.length}</strong>
            <span>conversaciones activas</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon mint">
            <BriefcaseBusiness size={18} />
          </span>
          <div>
            <strong>{ownOffers.length}</strong>
            <span>ofertas enviadas</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon lilac">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>{pendingOffers}</strong>
            <span>pendientes de respuesta</span>
          </div>
        </div>
      </div>

      <div className="tab-row offers-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'chats'}
          className={`tab-btn ${tab === 'chats' ? 'active' : ''}`}
          onClick={() => setTab('chats')}
        >
          <MessageCircle size={15} /> Conversaciones
          <span className="tab-count">{contacts.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'offers'}
          className={`tab-btn ${tab === 'offers' ? 'active' : ''}`}
          onClick={() => setTab('offers')}
        >
          <BriefcaseBusiness size={15} /> Ofertas enviadas
          <span className="tab-count">{ownOffers.length}</span>
        </button>
      </div>

      {tab === 'chats' ? (
        contacts.length ? (
          <ChatWorkspace
            role="company"
            contacts={contacts}
            activeId={activeStudent?.id}
            onSelect={setSelectedStudentId}
            messages={activeMessages}
            onSend={handleSend}
            onOffer={() => openOfferModal(activeStudent?.id)}
            offer={activeOffer}
          />
        ) : (
          <EmptyState
            icon={<MessageCircle size={26} />}
            title="Todavía no hay conversaciones"
            description="Cuando un estudiante envíe una propuesta o guardes un perfil como favorito, podrás iniciar una conversación desde aquí."
            action={
              <Link to="/app/comunidad" className="btn btn-primary">
                Descubrir talento <ArrowRight size={16} />
              </Link>
            }
          />
        )
      ) : (
        <CompanyOfferList
          offers={ownOffers}
          companyId={company.id}
          projects={state.projects}
          users={state.users}
          onOpenChat={(studentId) => {
            setSelectedStudentId(studentId);
            setTab('chats');
          }}
          onCreate={() => openOfferModal(activeStudent?.id)}
        />
      )}

      <OfferModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        students={students}
        projects={ownProjects}
        initialStudentId={offerStudentId}
        company={company}
        onCreate={(studentId) => {
          setSelectedStudentId(studentId);
          setTab('offers');
        }}
      />
    </>
  );
}

function CompanyOfferList({
  offers,
  projects,
  users,
  onOpenChat,
  onCreate,
}: {
  offers: Offer[];
  companyId: string;
  projects: Project[];
  users: ReturnType<typeof useStore>['state']['users'];
  onOpenChat: (studentId: string) => void;
  onCreate: () => void;
}) {
  if (!offers.length) {
    return (
      <EmptyState
        icon={<BriefcaseBusiness size={26} />}
        title="Aún no has enviado ninguna oferta"
        description="Cuando una propuesta destaque, envíale una oferta o una invitación a colaborar. La conversación quedará vinculada a esa persona."
        action={
          <button className="btn btn-primary" onClick={onCreate}>
            Crear mi primera oferta <ArrowRight size={16} />
          </button>
        }
      />
    );
  }

  return (
    <div className="offer-list">
      {offers.map((offer) => {
        const student = users.find(
          (user): user is Student =>
            user.id === offer.studentId && user.role === 'student',
        );
        const project = projects.find((item) => item.id === offer.projectId);
        if (!student) return null;
        return (
          <article className="offer-card" key={offer.id}>
            <div className="offer-card-top">
              <Link to={`/app/u/${student.id}`} className="offer-person">
                <Avatar user={student} size="md" />
                <div>
                  <strong>
                    {student.name} {student.surname}
                  </strong>
                  <span>{student.degree} · {student.university}</span>
                </div>
              </Link>
              <OfferStatusBadge status={offer.status} />
            </div>
            <div className="offer-card-body">
              <h3>{offer.title}</h3>
              <div className="offer-meta-row">
                {offer.salary && (
                  <span>
                    <Wallet size={14} /> {offer.salary}
                  </span>
                )}
                {project && (
                  <span>
                    <Sparkles size={14} /> {project.title}
                  </span>
                )}
                <span>
                  <Clock size={14} /> Enviada {timeAgo(offer.createdAt)}
                </span>
              </div>
              <p>{offer.message}</p>
            </div>
            <div className="offer-card-footer">
              <Link to={`/app/u/${student.id}`} className="btn btn-ghost btn-sm">
                Ver perfil
              </Link>
              <button className="btn btn-soft btn-sm" onClick={() => onOpenChat(student.id)}>
                <MessageCircle size={14} /> Abrir conversación
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* =========================================================
   Student · offers + conversations
   ========================================================= */

function StudentOffers({ student }: { student: Student }) {
  const { state, updateOfferStatus, sendMessage, notify } = useStore();
  const [tab, setTab] = useState<ChatTab>('offers');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const myOffers = useMemo(
    () =>
      state.offers
        .filter((offer) => offer.studentId === student.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.offers, student.id],
  );
  const mySolutions = state.solutions.filter(
    (solution) => solution.studentId === student.id,
  );

  const contacts = useMemo(() => {
    const connectedIds = new Set<string>([
      ...myOffers.map((offer) => offer.companyId),
      ...state.messages
        .filter((message) => message.studentId === student.id)
        .map((message) => message.companyId),
      ...state.projects
        .filter((project) => mySolutions.some((solution) => solution.projectId === project.id))
        .map((project) => project.companyId),
    ]);

    return Array.from(connectedIds)
      .map((companyId): ChatContact | null => {
        const company = state.users.find(
          (user): user is Company =>
            user.id === companyId && user.role === 'company',
        );
        if (!company) return null;
        const messages = pairMessages(state.messages, company.id, student.id);
        const lastMessage = messages[messages.length - 1];
        const lastOffer = latestOfferFor(state.offers, company.id, student.id);
        return {
          id: company.id,
          name: company.name,
          subtitle: company.sector,
          user: company,
          lastMessage: lastMessage?.text ?? (lastOffer ? `Oferta: ${lastOffer.title}` : undefined),
          lastAt: lastMessage?.createdAt ?? lastOffer?.createdAt,
        };
      })
      .filter((contact): contact is ChatContact => contact !== null)
      .sort((a, b) => {
        if (a.lastAt && b.lastAt)
          return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
        if (a.lastAt) return -1;
        if (b.lastAt) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [myOffers, state.messages, state.users, state.projects, mySolutions, student.id]);

  const activeContact =
    contacts.find((contact) => contact.id === selectedCompanyId) ?? contacts[0];
  const activeCompany = activeContact?.user as Company | undefined;
  const activeMessages =
    activeCompany && activeContact
      ? pairMessages(state.messages, activeCompany.id, student.id)
      : [];
  const activeOffer = activeCompany
    ? latestOfferFor(state.offers, activeCompany.id, student.id)
    : undefined;

  const handleSend = (text: string) => {
    if (!activeCompany) return;
    try {
      sendMessage(activeCompany.id, text);
    } catch (sendError) {
      notify(
        sendError instanceof Error ? sendError.message : 'No se pudo enviar el mensaje.',
        'error',
      );
    }
  };

  const pendingOffers = myOffers.filter((offer) => offer.status === 'pending').length;

  return (
    <>
      <PageHeader
        eyebrow="Tu siguiente paso"
        title="Mis ofertas"
        description="Las empresas que han visto tu trabajo pueden invitarte a seguir colaborando. Revisa sus mensajes y responde cuando estés listo/a."
        action={
          <Link to="/app/explorar" className="btn btn-secondary">
            <Compass size={17} /> Seguir explorando
          </Link>
        }
      />

      <section className="offers-summary">
        <div className="workspace-stat">
          <span className="stat-icon sky">
            <BriefcaseBusiness size={18} />
          </span>
          <div>
            <strong>{myOffers.length}</strong>
            <span>ofertas recibidas</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon mint">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>{pendingOffers}</strong>
            <span>pendientes de responder</span>
          </div>
        </div>
        <div className="workspace-stat">
          <span className="stat-icon lilac">
            <MessageCircle size={18} />
          </span>
          <div>
            <strong>{contacts.length}</strong>
            <span>empresas en contacto</span>
          </div>
        </div>
      </section>

      <div className="offers-student-banner">
        <Sparkles size={18} />
        <p>
          Un buen resultado en un proyecto también abre conversaciones. Las empresas pueden
          ofrecerte prácticas, una colaboración o animarte a seguir con nuevos retos.
        </p>
      </div>

      <div className="tab-row offers-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'offers'}
          className={`tab-btn ${tab === 'offers' ? 'active' : ''}`}
          onClick={() => setTab('offers')}
        >
          <BriefcaseBusiness size={15} /> Ofertas
          <span className="tab-count">{myOffers.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'chats'}
          className={`tab-btn ${tab === 'chats' ? 'active' : ''}`}
          onClick={() => setTab('chats')}
        >
          <MessageCircle size={15} /> Mensajes
          <span className="tab-count">{contacts.length}</span>
        </button>
      </div>

      {tab === 'offers' ? (
        myOffers.length ? (
          <div className="offer-list">
            {myOffers.map((offer) => {
              const company = state.users.find(
                (user): user is Company =>
                  user.id === offer.companyId && user.role === 'company',
              );
              const project = state.projects.find(
                (item) => item.id === offer.projectId,
              );
              if (!company) return null;
              return (
                <article className="offer-card student-offer-card" key={offer.id}>
                  <div className="offer-card-top">
                    <Link to={`/app/u/${company.id}`} className="offer-person">
                      <Avatar user={company} size="md" />
                      <div>
                        <strong>{company.name}</strong>
                        <span>{company.sector}</span>
                      </div>
                    </Link>
                    <OfferStatusBadge status={offer.status} />
                  </div>
                  <div className="offer-card-body">
                    <h3>{offer.title}</h3>
                    <div className="offer-meta-row">
                      {offer.salary && (
                        <span>
                          <Wallet size={14} /> {offer.salary}
                        </span>
                      )}
                      {project && (
                        <span>
                          <Sparkles size={14} /> {project.title}
                        </span>
                      )}
                      <span>
                        <Clock size={14} /> {timeAgo(offer.createdAt)}
                      </span>
                    </div>
                    <p>{offer.message}</p>
                  </div>
                  <div className="offer-card-footer">
                    <Link to={`/app/u/${company.id}`} className="btn btn-ghost btn-sm">
                      Ver empresa
                    </Link>
                    {offer.status === 'pending' ? (
                      <div className="offer-response-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            updateOfferStatus(offer.id, 'declined');
                            notify('Has rechazado la oferta. La empresa ha recibido tu respuesta.', 'info');
                          }}
                        >
                          <X size={14} /> Rechazar
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            updateOfferStatus(offer.id, 'accepted');
                            notify('¡Oferta aceptada! Se ha avisado a la empresa.', 'success');
                          }}
                        >
                          <Check size={14} /> Aceptar oferta
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-soft btn-sm"
                        onClick={() => {
                          setSelectedCompanyId(company.id);
                          setTab('chats');
                        }}
                      >
                        <MessageCircle size={14} /> Hablar con la empresa
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Inbox size={26} />}
            title="Todavía no tienes ofertas"
            description="Sigue enviando propuestas y entregando buenos proyectos. Las empresas pueden contactarte en cuanto vean tu trabajo."
            action={
              <Link to="/app/explorar" className="btn btn-primary">
                Descubrir retos <ArrowRight size={16} />
              </Link>
            }
          />
        )
      ) : contacts.length ? (
        <ChatWorkspace
          role="student"
          contacts={contacts}
          activeId={activeCompany?.id}
          onSelect={setSelectedCompanyId}
          messages={activeMessages}
          onSend={handleSend}
          offer={activeOffer}
        />
      ) : (
        <EmptyState
          icon={<MessageCircle size={26} />}
          title="Aún no hay mensajes"
          description="Cuando una empresa se interese por tu trabajo, la conversación aparecerá aquí."
          action={
            <Link to="/app/explorar" className="btn btn-soft">
              Explorar retos <ArrowRight size={16} />
            </Link>
          }
        />
      )}
    </>
  );
}

/* =========================================================
   Shared chat
   ========================================================= */

function ChatWorkspace({
  role,
  contacts,
  activeId,
  onSelect,
  messages,
  onSend,
  onOffer,
  offer,
}: {
  role: Role;
  contacts: ChatContact[];
  activeId?: string;
  onSelect: (id: string) => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onOffer?: () => void;
  offer?: Offer;
}) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const active = contacts.find((contact) => contact.id === activeId) ?? contacts[0];

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, active?.id]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  if (!active) return null;

  return (
    <div className="chat-layout">
      <aside className="chat-contacts">
        <div className="chat-contacts-head">
          <div>
            <span className="section-kicker">Bandeja de entrada</span>
            <h2>Conversaciones</h2>
          </div>
          <span className="chat-contact-count">{contacts.length}</span>
        </div>
        <div className="chat-contact-list">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              className={`chat-contact ${active.id === contact.id ? 'active' : ''}`}
              onClick={() => onSelect(contact.id)}
            >
              <Avatar user={contact.user} size="sm" />
              <span className="chat-contact-copy">
                <strong>{contact.name}</strong>
                <span>{contact.lastMessage ?? contact.subtitle}</span>
              </span>
              {contact.lastAt && (
                <span className="chat-contact-time">{timeAgo(contact.lastAt)}</span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-panel">
        <div className="chat-panel-head">
          <div className="chat-panel-person">
            <Avatar user={active.user} size="md" />
            <div>
              <h3>{active.name}</h3>
              <span>{active.subtitle}</span>
            </div>
          </div>
          <div className="chat-panel-actions">
            <Link to={`/app/u/${active.id}`} className="btn btn-ghost btn-sm">
              Ver perfil
            </Link>
            {onOffer && (
              <button className="btn btn-primary btn-sm" onClick={onOffer}>
                <BriefcaseBusiness size={14} /> Hacer oferta
              </button>
            )}
          </div>
        </div>

        {offer && (
          <div className="chat-offer-banner">
            <div>
              <span>
                <BriefcaseBusiness size={14} /> Oferta{role === 'company' ? ' enviada' : ' recibida'}:
              </span>
              <strong>{offer.title}</strong>
              {offer.salary && <small>{offer.salary}</small>}
            </div>
            <OfferStatusBadge status={offer.status} />
          </div>
        )}

        <div className="chat-messages" ref={listRef}>
          {messages.length ? (
            messages.map((message) => {
              const mine = message.sender === role;
              return (
                <div
                  key={message.id}
                  className={`chat-bubble-row ${mine ? 'mine' : 'theirs'}`}
                >
                  {!mine && <Avatar user={active.user} size="xs" />}
                  <div className="chat-bubble">
                    <p>{message.text}</p>
                    <span>{timeAgo(message.createdAt)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="chat-empty">
              <MessageCircle size={24} />
              <strong>Empieza la conversación</strong>
              <p>
                {role === 'company'
                  ? 'Cuéntale por qué su perfil te ha llamado la atención y qué tenéis en mente.'
                  : 'Pregunta lo que necesites antes de decidir tu siguiente paso.'}
              </p>
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={submit}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe un mensaje..."
            aria-label="Escribir mensaje"
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!draft.trim()}
            aria-label="Enviar mensaje"
          >
            <Send size={16} /> Enviar
          </button>
        </form>
      </section>
    </div>
  );
}

/* =========================================================
   Offer modal
   ========================================================= */

function OfferModal({
  open,
  onClose,
  students,
  projects,
  initialStudentId,
  company,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  students: Student[];
  projects: Project[];
  initialStudentId: string | null;
  company: Company;
  onCreate: (studentId: string) => void;
}) {
  const { createOffer, notify } = useStore();
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [salary, setSalary] = useState('');
  const [projectId, setProjectId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setStudentId(initialStudentId ?? '');
    setTitle('');
    setMessage('');
    setSalary('');
    setProjectId('');
    setErrors({});
  }, [open, initialStudentId]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!studentId) next.student = 'Elige a quién quieres enviar la oferta.';
    if (title.trim().length < 5) next.title = 'Pon un título a la oferta.';
    if (message.trim().length < 20) next.message = 'Añade un mensaje de al menos 20 caracteres.';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      createOffer({
        studentId,
        projectId: projectId || undefined,
        title: title.trim(),
        message: message.trim(),
        salary: salary.trim() || undefined,
      });
      notify(`Oferta enviada a ${students.find((student) => student.id === studentId)?.name ?? 'el estudiante'}.`, 'success');
      onCreate(studentId);
      onClose();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'No se pudo enviar la oferta.',
        'error',
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva oferta"
      subtitle={`Envía una propuesta de colaboración desde ${company.name}.`}
      size="md"
    >
      <form className="stack-form" onSubmit={submit} noValidate>
        <Field label="Estudiante" error={errors.student} required>
          <select
            value={studentId}
            onChange={(event) => {
              setStudentId(event.target.value);
              setErrors((prev) => ({ ...prev, student: '' }));
            }}
            className={errors.student ? 'input-error' : ''}
          >
            <option value="" disabled>
              Selecciona un estudiante
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} {student.surname} · {student.degree}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Título de la oferta" error={errors.title} required>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Ej. Prácticas en Data Science"
            className={errors.title ? 'input-error' : ''}
            maxLength={100}
          />
        </Field>
        <Field label="Compensación" hint="Opcional. Puede ser un salario, una beca o una colaboración.">
          <div className="input-with-icon">
            <Wallet size={16} />
            <input
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
              placeholder="Ej. 800 €/mes"
            />
          </div>
        </Field>
        <Field label="Proyecto relacionado" hint="Opcional.">
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
            <option value="">Sin proyecto concreto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mensaje" error={errors.message} required>
          <textarea
            rows={5}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setErrors((prev) => ({ ...prev, message: '' }));
            }}
            placeholder="Cuéntale por qué te interesa su perfil y qué le estás proponiendo..."
            className={errors.message ? 'input-error' : ''}
            maxLength={1000}
          />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            <Send size={15} /> Enviar oferta
          </button>
        </div>
      </form>
    </Modal>
  );
}
