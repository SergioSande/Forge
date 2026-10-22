import { useEffect, useState } from 'react';
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
  Plus,
  Rocket,
  Sparkles,
  Trophy,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import type { Area, Difficulty, Modality, Project, ProjectIcon, ProjectVisual } from '../types';
import {
  AREAS,
  DIFFICULTIES,
  MODALITIES,
  PROJECT_ICONS,
  PROJECT_VISUALS,
  SKILLS,
} from '../lib/constants';
import { useStore } from '../store/AppStore';
import { ChipButton, Field, Modal } from './ui';

interface FormState {
  title: string;
  summary: string;
  description: string;
  areas: Area[];
  skills: string[];
  budget: string;
  duration: string;
  modality: Modality;
  difficulty: Difficulty;
  deadline: string;
  prize: string;
  maxSubmissions: string;
  visual: ProjectVisual;
  icon: ProjectIcon;
}

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

const createInitialForm = (): FormState => ({
  title: '',
  summary: '',
  description: '',
  areas: [],
  skills: [],
  budget: '',
  duration: '',
  modality: 'Remoto',
  difficulty: 'Explorador',
  deadline: '',
  prize: '',
  maxSubmissions: '',
  visual: 'aurora',
  icon: 'sparkles',
});

export function ProjectFormModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}) {
  const { addProject, notify } = useStore();
  const [form, setForm] = useState<FormState>(createInitialForm);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(createInitialForm());
    setSkillInput('');
    setErrors({});
  }, [open]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleArea = (area: Area) => {
    if (!form.areas.includes(area) && form.areas.length >= 3) {
      notify('Puedes elegir hasta 3 áreas para un proyecto.', 'info');
      return;
    }
    update(
      'areas',
      form.areas.includes(area)
        ? form.areas.filter((item) => item !== area)
        : [...form.areas, area],
    );
  };

  const addSkill = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (form.skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setSkillInput('');
      return;
    }
    if (form.skills.length >= 8) {
      notify('Máximo 8 habilidades por proyecto.', 'info');
      return;
    }
    update('skills', [...form.skills, value]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    update(
      'skills',
      form.skills.filter((item) => item !== skill),
    );
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 6) next.title = 'Pon un título de al menos 6 caracteres.';
    if (form.summary.trim().length < 15)
      next.summary = 'Resume el reto en una frase de al menos 15 caracteres.';
    if (form.description.trim().length < 40)
      next.description = 'Cuéntanos un poco más: al menos 40 caracteres.';
    if (form.areas.length === 0) next.areas = 'Elige al menos un área.';
    if (form.skills.length < 2) next.skills = 'Añade al menos dos habilidades.';
    if (!form.budget.trim()) next.budget = 'Indica una retribución o presupuesto.';
    if (!form.duration.trim()) next.duration = 'Indica una duración estimada.';
    if (form.deadline && new Date(`${form.deadline}T23:59:59`).getTime() < Date.now())
      next.deadline = 'La fecha límite debe estar en el futuro.';
    if (form.maxSubmissions.trim()) {
      const capacity = Number(form.maxSubmissions);
      if (!Number.isInteger(capacity) || capacity < 1)
        next.maxSubmissions = 'El aforo debe ser un número entero mayor que 0.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const selectedTheme =
    PROJECT_VISUALS.find((theme) => theme.id === form.visual) ?? PROJECT_VISUALS[0];
  const SelectedIcon = ICON_COMPONENTS[form.icon];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const project = addProject({
      title: form.title.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      areas: form.areas,
      skills: form.skills,
      budget: form.budget.trim(),
      duration: form.duration.trim(),
      modality: form.modality,
      difficulty: form.difficulty,
      deadline: form.deadline || undefined,
      prize: form.prize.trim() || undefined,
      maxSubmissions: form.maxSubmissions.trim()
        ? Number(form.maxSubmissions)
        : undefined,
      visual: form.visual,
      icon: form.icon,
    });
    notify('Reto publicado. Ya puedes recibir soluciones de estudiantes.', 'success');
    onClose();
    onCreated?.(project);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publica un nuevo reto"
      subtitle="Cuanto más concreto sea el reto, mejores serán las soluciones que recibas."
      size="lg"
    >
      <form className="stack-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Field label="Título del proyecto" error={errors.title} required className="span-2">
            <input
              value={form.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Ej. Detector de anomalías para parques solares"
              maxLength={90}
              className={errors.title ? 'input-error' : ''}
            />
          </Field>

          <Field
            label="Resumen para la tarjeta"
            hint={`${form.summary.length}/130 caracteres`}
            error={errors.summary}
            required
            className="span-2"
          >
            <input
              value={form.summary}
              onChange={(event) => update('summary', event.target.value)}
              placeholder="Una frase que explique el impacto del reto."
              maxLength={130}
              className={errors.summary ? 'input-error' : ''}
            />
          </Field>

          <Field
            label="Descripción del reto"
            hint="Contexto, objetivos y lo que esperas del estudiante."
            error={errors.description}
            required
            className="span-2"
          >
            <textarea
              rows={6}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="¿Qué problema quieres resolver? ¿Qué datos, recursos o acompañamiento tendrá la persona? ¿Qué esperas entregar?"
              maxLength={1600}
              className={errors.description ? 'input-error' : ''}
            />
          </Field>
        </div>

        <div className="form-section">
          <div className="form-section-head">
            <h3>Áreas del reto</h3>
            <span>Hasta 3</span>
          </div>
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

        <div className="form-section">
          <div className="form-section-head">
            <h3>Habilidades que valoráis</h3>
            <span>{form.skills.length}/8</span>
          </div>
          <div className="skill-editor">
            <div className="skill-input-row">
              <input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Escribe una habilidad y pulsa Enter"
              />
              <button
                type="button"
                className="btn btn-soft btn-sm"
                onClick={() => addSkill(skillInput)}
              >
                <Plus size={15} /> Añadir
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="selected-skill-row">
                {form.skills.map((skill) => (
                  <span className="selected-skill" key={skill}>
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Quitar ${skill}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="suggestion-row">
              <span>Sugerencias:</span>
              {SKILLS.filter(
                (skill) =>
                  !form.skills.some((item) => item.toLowerCase() === skill.toLowerCase()),
              )
                .slice(0, 10)
                .map((skill) => (
                  <button
                    type="button"
                    key={skill}
                    className="skill-suggestion"
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </button>
                ))}
            </div>
          </div>
          {errors.skills && <span className="field-error block">{errors.skills}</span>}
        </div>

        <div className="form-section">
          <div className="form-section-head">
            <h3>Identidad visual del reto</h3>
            <span>Se verá en la cabecera</span>
          </div>
          <div className="theme-options">
            {PROJECT_VISUALS.map((theme) => (
              <button
                type="button"
                key={theme.id}
                className={`theme-option ${form.visual === theme.id ? 'active' : ''}`}
                onClick={() => update('visual', theme.id)}
                aria-pressed={form.visual === theme.id}
              >
                <span
                  className="theme-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]})`,
                  }}
                />
                {theme.label}
              </button>
            ))}
          </div>

          <div className="icon-options">
            {PROJECT_ICONS.map((item) => {
              const IconComponent = ICON_COMPONENTS[item.id];
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`icon-option ${form.icon === item.id ? 'active' : ''}`}
                  onClick={() => update('icon', item.id)}
                  aria-pressed={form.icon === item.id}
                >
                  <IconComponent size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            className="cover-mini-preview"
            style={{
              background: `linear-gradient(135deg, ${selectedTheme.colors[0]}, ${selectedTheme.colors[1]}, ${selectedTheme.colors[2]})`,
            }}
          >
            <div>
              <span>Así se verá la cabecera</span>
              <strong>{form.title.trim() || 'Tu próximo reto'}</strong>
              <small>{form.summary.trim() || 'Una frase que explique el impacto.'}</small>
            </div>
            <SelectedIcon size={34} />
          </div>
        </div>

        <div className="form-grid">
          <Field label="Presupuesto / retribución" error={errors.budget} required>
            <div className="input-with-icon">
              <Wallet size={16} />
              <input
                value={form.budget}
                onChange={(event) => update('budget', event.target.value)}
                placeholder="1.200 €"
                className={errors.budget ? 'input-error' : ''}
              />
            </div>
          </Field>
          <Field label="Duración estimada" error={errors.duration} required>
            <div className="input-with-icon">
              <Clock size={16} />
              <input
                value={form.duration}
                onChange={(event) => update('duration', event.target.value)}
                placeholder="8 semanas"
                className={errors.duration ? 'input-error' : ''}
              />
            </div>
          </Field>
          <Field label="Modalidad">
            <div className="input-with-icon">
              <MapPin size={16} />
              <select
                value={form.modality}
                onChange={(event) => update('modality', event.target.value as Modality)}
              >
                {MODALITIES.map((modality) => (
                  <option key={modality}>{modality}</option>
                ))}
              </select>
            </div>
          </Field>
          <Field label="Nivel del reto">
            <div className="input-with-icon">
              <Sparkles size={16} />
              <select
                value={form.difficulty}
                onChange={(event) => update('difficulty', event.target.value as Difficulty)}
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </Field>
          <Field
            label="Recompensa al mejor proyecto"
            hint="Opcional. Un aliciente para atraer propuestas."
            error={errors.prize}
          >
            <div className="input-with-icon">
              <Trophy size={16} />
              <input
                value={form.prize}
                onChange={(event) => update('prize', event.target.value)}
                placeholder="Ej. 200 € al mejor proyecto"
              />
            </div>
          </Field>
          <Field
            label="Aforo máximo de propuestas"
            hint="Opcional. Limita cuántas soluciones se aceptan."
            error={errors.maxSubmissions}
          >
            <div className="input-with-icon">
              <Users size={16} />
              <input
                type="number"
                min={1}
                value={form.maxSubmissions}
                onChange={(event) => update('maxSubmissions', event.target.value)}
                placeholder="Ej. 100"
                className={errors.maxSubmissions ? 'input-error' : ''}
              />
            </div>
          </Field>
          <Field
            label="Fecha límite para recibir soluciones"
            hint="Opcional. Puedes dejar el reto abierto sin fecha."
            error={errors.deadline}
            className="span-2"
          >
            <div className="input-with-icon">
              <CalendarDays size={16} />
              <input
                type="date"
                value={form.deadline}
                onChange={(event) => update('deadline', event.target.value)}
                className={errors.deadline ? 'input-error' : ''}
              />
            </div>
          </Field>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Publicar reto
          </button>
        </div>
      </form>
    </Modal>
  );
}
