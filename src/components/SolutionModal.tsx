import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';
import { useStore } from '../store/AppStore';
import { Field, Modal } from './ui';

export function SolutionModal({
  project,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  const { state, addSolution, notify } = useStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const company = state.users.find((user) => user.id === project.companyId);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setLink('');
    setErrors({});
    setSubmitted(false);
  }, [open, project.id]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (title.trim().length < 5) next.title = 'Pon un título a tu propuesta (mínimo 5 caracteres).';
    if (description.trim().length < 40)
      next.description = 'Cuéntanos tu enfoque con un poco más de detalle (mínimo 40 caracteres).';
    if (link.trim() && !link.includes('.'))
      next.link = 'Revisa el enlace: parece incompleto.';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      addSolution({
        projectId: project.id,
        title: title.trim(),
        description: description.trim(),
        link: link.trim() || undefined,
      });
      setSubmitted(true);
      notify('¡Solución enviada! La empresa ya puede verla.', 'success');
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'No se pudo enviar la solución.',
        'error',
      );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={submitted ? 'Solución enviada' : 'Envía tu solución'}
      subtitle={submitted ? undefined : project.title}
      size="md"
    >
      {submitted ? (
        <div className="success-state">
          <div className="success-icon">
            <CheckCircle2 size={30} />
          </div>
          <h3>Tu propuesta ya está en juego</h3>
          <p>
            La empresa recibirá tu solución y podrá contactarte si encaja. Mientras tanto, puedes
            seguir explorando otros retos.
          </p>
          <div className="success-actions">
            <button className="btn btn-ghost" onClick={onClose}>
              Seguir explorando
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                navigate('/app/postulaciones');
              }}
            >
              Ver mis postulaciones <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <form className="stack-form" onSubmit={handleSubmit} noValidate>
          <div className="project-reference">
            <span className="project-reference-label">Estás respondiendo a</span>
            <strong>{company?.name ?? 'Empresa'}</strong>
            <span>{project.title}</span>
          </div>

          <Field
            label="Título de tu propuesta"
            error={errors.title}
            hint="Una idea clara en una frase."
            required
          >
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="Ej. Detección en tres capas: física, datos y alerta"
              maxLength={100}
              className={errors.title ? 'input-error' : ''}
            />
          </Field>

          <Field
            label="Tu enfoque"
            error={errors.description}
            hint="Cómo lo abordarías, qué harías primero y qué entregarías."
            required
          >
            <textarea
              rows={6}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Me gustaría empezar por... Propondría... El resultado sería..."
              maxLength={1200}
              className={errors.description ? 'input-error' : ''}
            />
          </Field>

          <Field
            label="Enlace a tu portfolio o prototipo"
            hint="Opcional. GitHub, Figma, un notebook o cualquier cosa que enseñe cómo piensas."
            error={errors.link}
          >
            <div className="input-with-icon">
              <Link2 size={16} />
              <input
                value={link}
                onChange={(event) => {
                  setLink(event.target.value);
                  setErrors((prev) => ({ ...prev, link: '' }));
                }}
                placeholder="github.com/tu-usuario/proyecto"
                className={errors.link ? 'input-error' : ''}
              />
            </div>
          </Field>

          <div className="tip-box">
            No necesitas tenerlo todo resuelto. Nos interesa cómo piensas y qué propones.
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Enviar solución <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
