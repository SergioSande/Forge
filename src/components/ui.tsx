import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Check, Sparkles, X } from 'lucide-react';
import type { Area, OfferStatus, SolutionStatus, User } from '../types';
import { avatarGradient, initials, matchLabel, OFFER_STATUS_META, SOLUTION_STATUS_META } from '../lib/utils';

export function Logo({
  light = false,
  small = false,
  to = '/',
}: {
  light?: boolean;
  small?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={`logo ${light ? 'logo-light' : ''} ${small ? 'logo-small' : ''}`}>
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none">
          <path
            d="M38.8 12.5 21 35.6c-.5.7 0 1.7.9 1.7h8.5l-3.2 14.2c-.2 1 1.1 1.6 1.7.8l18-23.4c.5-.7 0-1.7-.9-1.7h-9l3.4-13.7c.2-1-1.1-1.6-1.6-1Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="logo-text">forge</span>
      <span className="logo-beta">beta</span>
    </Link>
  );
}

export function Avatar({
  user,
  size = 'md',
  className = '',
}: {
  user: Pick<User, 'name' | 'role' | 'id'> & { surname?: string };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const fullName = user.surname ? `${user.name} ${user.surname}` : user.name;
  return (
    <span
      className={`avatar avatar-${size} avatar-${user.role} ${className}`}
      style={{ background: avatarGradient(user.id + user.name) }}
      title={fullName}
      aria-hidden="true"
    >
      {initials(fullName)}
    </span>
  );
}

export function MatchRing({
  score,
  size = 'md',
  caption = 'match',
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  caption?: string;
}) {
  return (
    <div
      className={`match-ring match-ring-${size}`}
      style={{ background: `conic-gradient(#2563eb ${score * 3.6}deg, #e4eefb 0deg)` }}
      role="img"
      aria-label={`${score}% de compatibilidad`}
    >
      <div className="match-ring-inner">
        <strong>{score}%</strong>
        <span>{caption}</span>
      </div>
    </div>
  );
}

export function MatchLabelInline({ score }: { score: number }) {
  const tone = score >= 85 ? 'high' : score >= 70 ? 'mid' : 'low';
  return <span className={`match-inline-label ${tone}`}>{matchLabel(score)}</span>;
}

export function MatchBadge({ score }: { score: number }) {
  const tone = score >= 85 ? 'high' : score >= 65 ? 'mid' : 'low';
  return (
    <span className={`match-badge match-${tone}`}>
      <Sparkles size={13} />
      {score}% match
    </span>
  );
}

export function AreaChip({ area, tone = 'default' }: { area: Area; tone?: 'default' | 'soft' | 'outline' }) {
  return <span className={`area-chip area-chip-${tone}`}>{area}</span>;
}

export function StatusBadge({ status }: { status: SolutionStatus }) {
  const meta = SOLUTION_STATUS_META[status];
  return <span className={`status-badge tone-${meta.tone}`}>{meta.label}</span>;
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const meta = OFFER_STATUS_META[status];
  return <span className={`status-badge tone-${meta.tone}`}>{meta.label}</span>;
}

export function Field({
  label,
  hint,
  error,
  children,
  required,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">
        {label}
        {required && <span className="req">*</span>}
      </span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function ChipButton({
  active,
  children,
  onClick,
  disabled,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`select-chip ${active ? 'active' : ''}`}
      onClick={onClick}
     aria-pressed={active}
      disabled={disabled}
    >
      {active && <Check size={13} />}
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={`modal-card modal-${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar" type="button">
            <X size={19} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}
