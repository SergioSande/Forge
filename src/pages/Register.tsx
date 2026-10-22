import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react';
import type { Area, Role } from '../types';
import {
  AREAS,
  COMPANY_SIZES,
  COURSES,
  MAX_STUDENT_AGE,
  MIN_STUDENT_AGE,
  SKILLS,
  UNIVERSITIES,
  WELCOME_KEY,
} from '../lib/constants';
import { useStore } from '../store/AppStore';
import { ChipButton, Field, Logo } from '../components/ui';

interface RegisterFormState {
  name: string;
  surname: string;
  age: string;
  email: string;
  password: string;
  university: string;
  degree: string;
  course: string;
  graduationYear: string;
  location: string;
  languages: string;
  skills: string[];
  interests: Area[];
  bio: string;
  github: string;
  linkedin: string;
  noLinkedin: boolean;
  phone: string;
  sector: string;
  size: string;
  website: string;
  contactName: string;
  founded: string;
  areas: Area[];
}

const emptyForm = (): RegisterFormState => ({
  name: '',
  surname: '',
  age: '',
  email: '',
  password: '',
  university: '',
  degree: '',
  course: '',
  graduationYear: '',
  location: '',
  languages: '',
  skills: [],
  interests: [],
  bio: '',
  github: '',
  linkedin: '',
  noLinkedin: false,
  phone: '',
  sector: '',
  size: '',
  website: '',
  contactName: '',
  founded: '',
  areas: [],
});

const STUDENT_STEPS = [
  { label: 'Cuenta', description: 'Lo básico para crear tu espacio.' },
  { label: 'Formación', description: 'Dónde estudias y qué estás aprendiendo.' },
  { label: 'Conocimientos', description: 'Lo que sabes hacer y lo que te mueve.' },
  { label: 'Perfil', description: 'El último paso para empezar a hacer match.' },
];

const COMPANY_STEPS = [
  { label: 'Cuenta', description: 'El acceso a tu espacio de empresa.' },
  { label: 'Empresa', description: 'Cuéntanos un poco sobre el equipo.' },
  { label: 'Enfoque', description: 'Dónde y con quién quieres trabajar.' },
  { label: 'Perfil', description: 'Lo que verán los estudiantes al encontrarte.' },
];

export function Register() {
  const { register, notify, currentUser } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawRole = searchParams.get('rol');
  const role: Role | null =
    rawRole === 'estudiante' ? 'student' : rawRole === 'empresa' ? 'company' : null;

  const [form, setForm] = useState<RegisterFormState>(emptyForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) navigate('/app', { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    setStep(0);
    setErrors({});
    setFormError('');
  }, [role]);

  const update = <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    setFormError('');
  };

  const chooseRole = (nextRole: Role) => {
    localStorage.setItem(WELCOME_KEY, '1');
    setSearchParams({ rol: nextRole === 'student' ? 'estudiante' : 'empresa' });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const changeRole = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const steps = role === 'student' ? STUDENT_STEPS : COMPANY_STEPS;

  const toggleSkill = (skill: string) => {
    update(
      'skills',
      form.skills.includes(skill)
        ? form.skills.filter((item) => item !== skill)
        : [...form.skills, skill],
    );
  };

  const toggleInterest = (area: Area) => {
    if (!form.interests.includes(area) && form.interests.length >= 3) {
      notify('Puedes elegir hasta 3 áreas de interés.', 'info');
      return;
    }
    update(
      'interests',
      form.interests.includes(area)
        ? form.interests.filter((item) => item !== area)
        : [...form.interests, area],
    );
  };

  const toggleArea = (area: Area) => {
    if (!form.areas.includes(area) && form.areas.length >= 3) {
      notify('Puedes elegir hasta 3 áreas.', 'info');
      return;
    }
    update(
      'areas',
      form.areas.includes(area)
        ? form.areas.filter((item) => item !== area)
        : [...form.areas, area],
    );
  };

  const validateStep = (current: number, currentRole: Role) => {
    const next: Record<string, string> = {};
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

    if (current === 0) {
      if (!form.name.trim())
        next.name = currentRole === 'student' ? 'Escribe tu nombre.' : 'Escribe el nombre de la empresa.';
      if (currentRole === 'student' && !form.surname.trim())
        next.surname = 'Escribe tus apellidos.';
      if (currentRole === 'student') {
        const ageNumber = Number(form.age);
        if (!form.age.trim() || Number.isNaN(ageNumber))
          next.age = 'Indica tu edad.';
        else if (ageNumber < MIN_STUDENT_AGE || ageNumber > MAX_STUDENT_AGE)
          next.age = `La edad debe estar entre ${MIN_STUDENT_AGE} y ${MAX_STUDENT_AGE} años.`;
        if (!form.location.trim())
          next.location = 'Indica tu ciudad o zona.';
      }
      if (!emailValid) next.email = 'Introduce un email válido.';
      if (form.password.length < 6)
        next.password = 'Usa al menos 6 caracteres para tu contraseña.';
    }

    if (currentRole === 'student' && current === 1) {
      if (!form.university.trim()) next.university = 'Indica tu universidad.';
      if (!form.degree.trim()) next.degree = 'Indica el grado o título que estudias.';
      if (!form.course) next.course = 'Selecciona tu curso.';
      if (!form.graduationYear.trim()) next.graduationYear = 'Indica tu año de graduación.';
    }

    if (currentRole === 'student' && current === 2) {
      if (form.skills.length < 3) next.skills = 'Elige al menos 3 habilidades.';
      if (form.interests.length === 0) next.interests = 'Elige al menos un área que te interese.';
    }

    if (currentRole === 'student' && current === 3) {
      if (form.bio.trim().length < 20) next.bio = 'Cuéntanos un poco más sobre ti (mínimo 20 caracteres).';
      if (!terms) next.terms = 'Necesitamos que aceptes el tratamiento de datos para continuar.';
    }

    if (currentRole === 'company' && current === 1) {
      if (!form.sector.trim()) next.sector = 'Indica el sector de la empresa.';
      if (!form.size) next.size = 'Selecciona el tamaño del equipo.';
      if (!form.location.trim()) next.location = 'Indica la ciudad o zona.';
    }

    if (currentRole === 'company' && current === 2) {
      if (!form.contactName.trim()) next.contactName = 'Indica una persona de contacto.';
      if (form.areas.length === 0) next.areas = 'Elige al menos un área.';
    }

    if (currentRole === 'company' && current === 3) {
      if (form.bio.trim().length < 30)
        next.bio = 'Cuéntanos un poco más sobre la empresa (mínimo 30 caracteres).';
      if (!terms) next.terms = 'Necesitamos que aceptes el tratamiento de datos para continuar.';
    }

    return next;
  };

  const finalize = (currentRole: Role) => {
    const result =
      currentRole === 'student'
        ? register({
            role: 'student',
            name: form.name.trim(),
            surname: form.surname.trim(),
            age: Number(form.age),
            email: form.email.trim(),
            password: form.password,
            location: form.location.trim(),
            bio: form.bio.trim(),
            phone: form.phone.trim() || undefined,
            headline: `Estudiante de ${form.degree.trim()} en ${form.university.trim()}`,
            university: form.university.trim(),
            degree: form.degree.trim(),
            course: form.course,
            graduationYear: form.graduationYear.trim(),
            skills: form.skills,
            interests: form.interests,
            languages: form.languages.trim() || 'Español',
            github: form.github.trim() || undefined,
            linkedin: form.noLinkedin ? undefined : form.linkedin.trim() || undefined,
            noLinkedin: form.noLinkedin,
          })
        : register({
            role: 'company',
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            location: form.location.trim(),
            bio: form.bio.trim(),
            phone: form.phone.trim() || undefined,
            sector: form.sector.trim(),
            size: form.size,
            website: form.website.trim() || undefined,
            contactName: form.contactName.trim(),
            areas: form.areas,
            founded: form.founded.trim() || undefined,
          });

    if (!result.ok) {
      setFormError(result.error ?? 'No se pudo crear la cuenta.');
      setErrors({ email: result.error ?? '' });
      setStep(0);
      return;
    }

    notify(
      currentRole === 'student'
        ? `¡Bienvenido/a a Forge, ${form.name.trim()}! Tu perfil ya está listo.`
        : `¡Bienvenido/a a Forge! La cuenta de ${form.name.trim()} ya está lista.`,
      'success',
    );
    navigate('/app');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!role) return;
    const stepErrors = validateStep(step, role);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    if (step < 3) {
      setStep((value) => value + 1);
      setErrors({});
      setFormError('');
      window.setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      return;
    }
    finalize(role);
  };

  const goBack = () => {
    if (step === 0) {
      changeRole();
      return;
    }
    setStep((value) => value - 1);
    setErrors({});
    setFormError('');
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (!role) {
    return (
      <div className="auth-page">
        <header className="auth-header">
          <Logo />
          <div className="auth-header-links">
            <Link to="/" className="text-link muted">
              Volver al inicio
            </Link>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Iniciar sesión
            </Link>
          </div>
        </header>

        <main className="role-pick-main">
          <div className="role-pick">
            <span className="eyebrow-pill soft">
              <Sparkles size={14} /> Crear cuenta
            </span>
            <h1>¿Qué te trae a Forge?</h1>
            <p>
              Elige tu perfil. Te preguntaremos solo lo necesario para que el matching tenga
              sentido desde el primer día.
            </p>

            <div className="role-pick-grid">
              <button className="role-pick-card" onClick={() => chooseRole('student')}>
                <span className="role-pick-icon student">
                  <GraduationCap size={30} />
                </span>
                <h2>Soy estudiante</h2>
                <p>
                  Quiero mi primera experiencia laboral, un proyecto real que enseñar y una red de
                  contactos.
                </p>
                <span className="role-pick-points">
                  <span>
                    <CheckCircle2 size={16} /> Perfil con tus estudios y habilidades
                  </span>
                  <span>
                    <CheckCircle2 size={16} /> Retos ordenados por afinidad
                  </span>
                  <span>
                    <CheckCircle2 size={16} /> Envía soluciones y recibe feedback
                  </span>
                </span>
                <span className="role-pick-cta">
                  Crear perfil de estudiante <ArrowRight size={17} />
                </span>
              </button>

              <button className="role-pick-card company" onClick={() => chooseRole('company')}>
                <span className="role-pick-icon company">
                  <Building2 size={30} />
                </span>
                <h2>Soy empresa</h2>
                <p>
                  Busco talento con ganas y soluciones frescas para un reto concreto de mi equipo.
                </p>
                <span className="role-pick-points">
                  <span>
                    <CheckCircle2 size={16} /> Publica retos en minutos
                  </span>
                  <span>
                    <CheckCircle2 size={16} /> Recibe soluciones de estudiantes
                  </span>
                  <span>
                    <CheckCircle2 size={16} /> Descubre perfiles afines a tu proyecto
                  </span>
                </span>
                <span className="role-pick-cta">
                  Crear perfil de empresa <ArrowRight size={17} />
                </span>
              </button>
            </div>

            <p className="role-pick-foot">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isStudent = role === 'student';

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo />
        <div className="auth-header-links">
          <Link to="/" className="text-link muted">
            Volver al inicio
          </Link>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-layout register-layout">
          <aside className="auth-aside register-aside">
            <div className="auth-aside-bg" aria-hidden="true">
              <span className="aside-glow glow-a" />
              <span className="aside-glow glow-b" />
              <span className="aside-grid" />
            </div>
            <div className="auth-aside-content">
              <button className="aside-back" onClick={changeRole}>
                <ChevronLeft size={15} /> Cambiar tipo de cuenta
              </button>
              <span className="eyebrow-pill on-blue">
                {isStudent ? <GraduationCap size={14} /> : <Building2 size={14} />}
                {isStudent ? 'Perfil de estudiante' : 'Perfil de empresa'}
              </span>
              <h1>
                {isStudent
                  ? 'Tu talento merece un escenario.'
                  : 'La próxima buena idea puede venir de fuera.'}
              </h1>
              <p>
                {isStudent
                  ? 'Cuéntanos qué estudias, qué sabes hacer y qué te gustaría probar. Nosotros encontramos los retos que encajan contigo.'
                  : 'Cuéntanos qué te mueve y qué tipo de retos tienes. Los estudiantes llegarán con contexto, no con un CV a ciegas.'}
              </p>

              <ul className="aside-list">
                {(isStudent
                  ? [
                      'Retos reales ordenados por afinidad',
                      'Solución con feedback directo de la empresa',
                      'Un perfil que muestra lo que ya sabes hacer',
                      'Experiencia para contar en tu próxima entrevista',
                    ]
                  : [
                      'Soluciones frescas a retos concretos',
                      'Talento de universidades de toda España',
                      'Publica y decide con propuestas delante',
                      'Una nueva vía para descubrir perfiles',
                    ]
                ).map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={17} /> {item}
                  </li>
                ))}
              </ul>

              <div className="aside-signoff">
                <span className="aside-signoff-avatar">
                  {isStudent ? 'LF' : 'NL'}
                </span>
                <div>
                  <strong>{isStudent ? 'Lucía Ferrer' : 'Marta Ibáñez'}</strong>
                  <span>{isStudent ? 'Estudiante · UPM' : 'Nebula Labs'}</span>
                </div>
              </div>

              <p className="aside-foot">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
              </p>
            </div>
          </aside>

          <section className="auth-card register-card" ref={formRef}>
            <div className="register-progress-head">
              <span>
                Paso {step + 1} de {steps.length}
              </span>
              <div className="step-segments" aria-hidden="true">
                {steps.map((item, index) => (
                  <span
                    key={item.label}
                    className={index <= step ? 'done' : ''}
                  />
                ))}
              </div>
            </div>

            <div className="auth-card-head">
              <span className="auth-kicker">
                {isStudent ? 'Crear perfil de estudiante' : 'Crear perfil de empresa'}
              </span>
              <h2>{steps[step].label}</h2>
              <p>{steps[step].description}</p>
            </div>

            <ol className="step-tracker">
              {steps.map((item, index) => (
                <li
                  key={item.label}
                  className={`${index === step ? 'current' : ''} ${index < step ? 'completed' : ''}`}
                >
                  <span className="step-dot">{index < step ? <Check size={12} /> : index + 1}</span>
                  {item.label}
                </li>
              ))}
            </ol>

            {formError && (
              <div className="alert alert-error">
                <AlertCircle size={17} />
                <span>{formError}</span>
              </div>
            )}

            <form className="stack-form step-form" onSubmit={handleSubmit} noValidate key={step}>
              {step === 0 && (
                <div className="form-grid">
                  <Field
                    label={isStudent ? 'Nombre' : 'Nombre de la empresa'}
                    error={errors.name}
                    required
                    className={isStudent ? '' : 'span-2'}
                  >
                    <input
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      placeholder={isStudent ? 'Lucía' : 'Ej. Nebula Labs'}
                      className={errors.name ? 'input-error' : ''}
                      autoComplete="name"
                    />
                  </Field>
                  {isStudent && (
                    <Field label="Apellidos" error={errors.surname} required>
                      <input
                        value={form.surname}
                        onChange={(event) => update('surname', event.target.value)}
                        placeholder="Ferrer"
                        className={errors.surname ? 'input-error' : ''}
                      />
                    </Field>
                  )}
                  {isStudent && (
                    <>
                      <Field label="Edad" error={errors.age} required>
                        <input
                          type="number"
                          min={MIN_STUDENT_AGE}
                          max={MAX_STUDENT_AGE}
                          value={form.age}
                          onChange={(event) => update('age', event.target.value)}
                          placeholder="Ej. 22"
                          className={errors.age ? 'input-error' : ''}
                          inputMode="numeric"
                        />
                      </Field>
                      <Field label="Ciudad / zona" error={errors.location} required>
                        <input
                          value={form.location}
                          onChange={(event) => update('location', event.target.value)}
                          placeholder="Ej. Madrid"
                          className={errors.location ? 'input-error' : ''}
                        />
                      </Field>
                    </>
                  )}
                  <Field
                    label={isStudent ? 'Email' : 'Email corporativo'}
                    error={errors.email}
                    required
                    className="span-2"
                  >
                    <div className="input-with-icon">
                      <Mail size={17} />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => update('email', event.target.value)}
                        placeholder={isStudent ? 'tu@email.com' : 'talento@tuempresa.com'}
                        className={errors.email ? 'input-error' : ''}
                        autoComplete="email"
                      />
                    </div>
                  </Field>
                  <Field
                    label="Contraseña"
                    error={errors.password}
                    hint="Mínimo 6 caracteres. Podrás cambiarla más adelante."
                    required
                    className="span-2"
                  >
                    <div className="input-with-icon has-action">
                      <LockKeyhole size={17} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) => update('password', event.target.value)}
                        placeholder="Crea una contraseña"
                        className={errors.password ? 'input-error' : ''}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="input-action"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </Field>
                </div>
              )}

              {isStudent && step === 1 && (
                <div className="form-grid">
                  <Field
                    label="Universidad"
                    error={errors.university}
                    required
                    className="span-2"
                  >
                    <input
                      list="register-universities"
                      value={form.university}
                      onChange={(event) => update('university', event.target.value)}
                      placeholder="Empieza a escribir tu universidad"
                      className={errors.university ? 'input-error' : ''}
                    />
                    <datalist id="register-universities">
                      {UNIVERSITIES.map((university) => (
                        <option key={university} value={university} />
                      ))}
                    </datalist>
                  </Field>
                  <Field
                    label="Grado / título que estudias"
                    error={errors.degree}
                    required
                    className="span-2"
                  >
                    <input
                      value={form.degree}
                      onChange={(event) => update('degree', event.target.value)}
                      placeholder="Ej. Grado en Inteligencia Artificial"
                      className={errors.degree ? 'input-error' : ''}
                    />
                  </Field>
                  <Field
                    label="Curso actual"
                    error={errors.course}
                    hint="Los retos están disponibles a partir de 3º curso."
                    required
                  >
                    <select
                      value={form.course}
                      onChange={(event) => update('course', event.target.value)}
                      className={errors.course ? 'input-error' : ''}
                    >
                      <option value="" disabled>
                        Selecciona tu curso
                      </option>
                      {COURSES.map((course) => (
                        <option key={course}>{course}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Año de graduación" error={errors.graduationYear} required>
                    <input
                      value={form.graduationYear}
                      onChange={(event) => update('graduationYear', event.target.value)}
                      placeholder="Ej. 2026"
                      inputMode="numeric"
                      className={errors.graduationYear ? 'input-error' : ''}
                    />
                  </Field>
                  <Field
                    label="Idiomas"
                    hint="Ej. Español nativo · Inglés C1. Suma contexto a tu perfil."
                    className="span-2"
                  >
                    <input
                      value={form.languages}
                      onChange={(event) => update('languages', event.target.value)}
                      placeholder="Ej. Español nativo · Inglés C1"
                    />
                  </Field>
                </div>
              )}

              {isStudent && step === 2 && (
                <>
                  <div className="form-section">
                    <div className="form-section-head">
                      <h3>¿Qué sabes hacer?</h3>
                      <span>Elige al menos 3</span>
                    </div>
                    <div className="chip-wrap">
                      {SKILLS.map((skill) => (
                        <ChipButton
                          key={skill}
                          active={form.skills.includes(skill)}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </ChipButton>
                      ))}
                    </div>
                    {errors.skills && <span className="field-error block">{errors.skills}</span>}
                  </div>

                  <div className="form-section">
                    <div className="form-section-head">
                      <h3>¿Qué áreas te interesan?</h3>
                      <span>{form.interests.length}/3</span>
                    </div>
                    <p className="form-section-help">
                      Con esto cruzamos tus intereses con los retos de las empresas.
                    </p>
                    <div className="chip-wrap">
                      {AREAS.map((area) => (
                        <ChipButton
                          key={area}
                          active={form.interests.includes(area)}
                          onClick={() => toggleInterest(area)}
                        >
                          {area}
                        </ChipButton>
                      ))}
                    </div>
                    {errors.interests && (
                      <span className="field-error block">{errors.interests}</span>
                    )}
                  </div>
                </>
              )}

              {isStudent && step === 3 && (
                <div className="form-grid">
                  <Field
                    label="Sobre ti"
                    error={errors.bio}
                    hint="Qué te gusta construir, cómo trabajas y qué buscas. Sin clichés."
                    required
                    className="span-2"
                  >
                    <textarea
                      rows={5}
                      value={form.bio}
                      onChange={(event) => update('bio', event.target.value)}
                      placeholder="Me gusta convertir ideas en prototipos y aprender en equipos donde se pregunta mucho..."
                      maxLength={600}
                      className={errors.bio ? 'input-error' : ''}
                    />
                  </Field>
                  <Field label="GitHub" hint="Opcional">
                    <input
                      value={form.github}
                      onChange={(event) => update('github', event.target.value)}
                      placeholder="github.com/tu-usuario"
                    />
                  </Field>
                  <Field
                    label="LinkedIn"
                    hint={form.noLinkedin ? 'Has indicado que no tienes LinkedIn.' : 'Opcional'}
                  >
                    <input
                      value={form.linkedin}
                      onChange={(event) => update('linkedin', event.target.value)}
                      placeholder="linkedin.com/in/tu-perfil"
                      disabled={form.noLinkedin}
                    />
                  </Field>
                  <Field label="Teléfono" hint="Solo lo verán las empresas con las que hagas match.">
                    <input
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      placeholder="+34 600 000 000"
                    />
                  </Field>
                  <label className="checkbox-line span-2">
                    <input
                      type="checkbox"
                      checked={form.noLinkedin}
                      onChange={(event) => {
                        update('noLinkedin', event.target.checked);
                        if (event.target.checked) update('linkedin', '');
                      }}
                    />
                    <span>No tengo LinkedIn</span>
                  </label>
                </div>
              )}

              {!isStudent && step === 1 && (
                <div className="form-grid">
                  <Field
                    label="Sector o ámbito"
                    error={errors.sector}
                    required
                    className="span-2"
                  >
                    <input
                      value={form.sector}
                      onChange={(event) => update('sector', event.target.value)}
                      placeholder="Ej. Energía inteligente · Startup"
                      className={errors.sector ? 'input-error' : ''}
                    />
                  </Field>
                  <Field label="Tamaño del equipo" error={errors.size} required>
                    <select
                      value={form.size}
                      onChange={(event) => update('size', event.target.value)}
                      className={errors.size ? 'input-error' : ''}
                    >
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      {COMPANY_SIZES.map((size) => (
                        <option key={size}>{size}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Ciudad / zona" error={errors.location} required>
                    <input
                      value={form.location}
                      onChange={(event) => update('location', event.target.value)}
                      placeholder="Ej. Madrid"
                      className={errors.location ? 'input-error' : ''}
                    />
                  </Field>
                  <Field label="Año de fundación" hint="Opcional">
                    <input
                      value={form.founded}
                      onChange={(event) => update('founded', event.target.value)}
                      placeholder="Ej. 2021"
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Web" hint="Opcional">
                    <input
                      value={form.website}
                      onChange={(event) => update('website', event.target.value)}
                      placeholder="tuempresa.com"
                    />
                  </Field>
                </div>
              )}

              {!isStudent && step === 2 && (
                <>
                  <div className="form-grid">
                    <Field label="Persona de contacto" error={errors.contactName} required>
                      <input
                        value={form.contactName}
                        onChange={(event) => update('contactName', event.target.value)}
                        placeholder="Ej. Marta Ibáñez"
                        className={errors.contactName ? 'input-error' : ''}
                      />
                    </Field>
                    <Field label="Teléfono" hint="Opcional">
                      <input
                        value={form.phone}
                        onChange={(event) => update('phone', event.target.value)}
                        placeholder="+34 910 000 000"
                      />
                    </Field>
                  </div>
                  <div className="form-section">
                    <div className="form-section-head">
                      <h3>¿En qué áreas buscas talento?</h3>
                      <span>{form.areas.length}/3</span>
                    </div>
                    <p className="form-section-help">
                      Nos ayuda a recomendarte estudiantes y ordenar futuros retos.
                    </p>
                    <div className="chip-wrap">
                      {AREAS.map((area) => (
                        <ChipButton
                          key={area}
                          active={form.areas.includes(area)}
                          onClick={() => toggleArea(area)}
                        >
                          {area}
                        </ChipButton>
                      ))}
                    </div>
                    {errors.areas && <span className="field-error block">{errors.areas}</span>}
                  </div>
                </>
              )}

              {!isStudent && step === 3 && (
                <div className="form-grid">
                  <Field
                    label="Sobre la empresa"
                    error={errors.bio}
                    hint="Qué haces, cómo trabajas y por qué te gustaría contar con talento junior."
                    required
                    className="span-2"
                  >
                    <textarea
                      rows={6}
                      value={form.bio}
                      onChange={(event) => update('bio', event.target.value)}
                      placeholder="Somos un equipo que construye... Buscamos personas que..."
                      maxLength={700}
                      className={errors.bio ? 'input-error' : ''}
                    />
                  </Field>
                  <div className="register-review span-2">
                    <h4>Así te verán</h4>
                    <div className="review-company">
                      <span className="review-logo">{form.name.trim().slice(0, 2).toUpperCase() || 'FO'}</span>
                      <div>
                        <strong>{form.name.trim() || 'Nombre de la empresa'}</strong>
                        <span>
                          {form.sector.trim() || 'Sector'} · {form.location.trim() || 'Ciudad'}
                        </span>
                      </div>
                    </div>
                    <div className="review-tags">
                      {form.areas.map((area) => (
                        <span key={area}>{area}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className={`terms-field ${errors.terms ? 'has-error' : ''}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(event) => {
                        setTerms(event.target.checked);
                        setErrors((prev) => ({ ...prev, terms: '' }));
                      }}
                    />
                    <span>
                      Acepto que Forge use estos datos para conectar mi perfil con empresas y
                      estudiantes. Podré actualizarlos o eliminarlos cuando quiera.
                    </span>
                  </label>
                  {errors.terms && <span className="field-error">{errors.terms}</span>}
                </div>
              )}

              <div className="form-actions register-actions">
                <button type="button" className="btn btn-ghost" onClick={goBack}>
                  <ArrowLeft size={16} /> Atrás
                </button>
                <button type="submit" className="btn btn-primary">
                  {step < 3 ? 'Continuar' : isStudent ? 'Crear mi perfil' : 'Crear cuenta de empresa'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
