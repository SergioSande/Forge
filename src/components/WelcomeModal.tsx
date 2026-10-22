import { ArrowRight, Building2, GraduationCap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Role } from '../types';
import { Modal } from './ui';

export function WelcomeModal({
  open,
  onClose,
  onChooseRole,
}: {
  open: boolean;
  onClose: () => void;
  onChooseRole: (role: Role) => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bienvenido a Forge"
      size="lg"
    >
      <div className="welcome">
        <div className="welcome-intro">
          <span className="welcome-pill">
            <Sparkles size={14} /> Talento joven · Proyectos reales
          </span>
          <h2>Tu primer paso profesional empieza aquí.</h2>
          <p>
            Forge conecta a estudiantes con ganas de demostrar lo que saben con empresas que
            necesitan ideas frescas. Cuéntanos cómo quieres empezar.
          </p>
        </div>

        <div className="welcome-roles">
          <button className="welcome-role" onClick={() => onChooseRole('student')}>
            <span className="welcome-role-icon student">
              <GraduationCap size={26} />
            </span>
            <span className="welcome-role-copy">
              <strong>Soy estudiante</strong>
              <span>Quiero mi primera experiencia real y un proyecto que enseñar.</span>
            </span>
            <span className="welcome-role-arrow">
              <ArrowRight size={18} />
            </span>
          </button>

          <button className="welcome-role" onClick={() => onChooseRole('company')}>
            <span className="welcome-role-icon company">
              <Building2 size={26} />
            </span>
            <span className="welcome-role-copy">
              <strong>Soy empresa</strong>
              <span>Busco talento nuevo y soluciones frescas para un reto concreto.</span>
            </span>
            <span className="welcome-role-arrow">
              <ArrowRight size={18} />
            </span>
          </button>
        </div>

        <div className="welcome-foot">
          <span>
            ¿Ya formas parte de Forge? <Link to="/login">Inicia sesión</Link>
          </span>
          <button className="welcome-skip" onClick={onClose}>
            Explorar sin cuenta
          </button>
        </div>
      </div>
    </Modal>
  );
}
