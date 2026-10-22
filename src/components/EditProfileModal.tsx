import { useEffect, useState } from 'react';
import type { Area } from '../types';
import {
  AREAS,
  COMPANY_SIZES,
  COURSES,
  MAX_STUDENT_AGE,
  MIN_STUDENT_AGE,
  SKILLS,
  UNIVERSITIES,
} from '../lib/constants';
import { useStore } from '../store/AppStore';
import { ChipButton, Field, Modal } from './ui';

export function EditProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { currentUser, updateCurrentUser, notify } = useStore();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [course, setCourse] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [languages, setLanguages] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<Area[]>([]);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [noLinkedin, setNoLinkedin] = useState(false);
  const [sector, setSector] = useState('');
  const [size, setSize] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [founded, setFounded] = useState('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isStudent = currentUser?.role === 'student';

  useEffect(() => {
    if (!open || !currentUser) return;
    setName(currentUser.name);
    setLocation(currentUser.location);
    setBio(currentUser.bio);
    setPhone(currentUser.phone ?? '');
    setErrors({});
    if (currentUser.role === 'student') {
      setSurname(currentUser.surname);
      setAge(currentUser.age ? String(currentUser.age) : '');
      setHeadline(currentUser.headline);
      setUniversity(currentUser.university);
      setDegree(currentUser.degree);
      setCourse(currentUser.course);
      setGraduationYear(currentUser.graduationYear);
      setLanguages(currentUser.languages);
      setSkills([...currentUser.skills]);
      setInterests([...currentUser.interests]);
      setGithub(currentUser.github ?? '');
      setLinkedin(currentUser.linkedin ?? '');
      setNoLinkedin(currentUser.noLinkedin ?? false);
    } else {
      setSector(currentUser.sector);
      setSize(currentUser.size);
      setWebsite(currentUser.website ?? '');
      setContactName(currentUser.contactName);
      setFounded(currentUser.founded ?? '');
      setAreas([...currentUser.areas]);
    }
  }, [open, currentUser]);

  if (!currentUser) return null;

  const toggleInterest = (area: Area) => {
    if (!interests.includes(area) && interests.length >= 3) {
      notify('Puedes elegir hasta 3 áreas de interés.', 'info');
      return;
    }
    setInterests((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area],
    );
    setErrors((prev) => ({ ...prev, interests: '' }));
  };

  const toggleArea = (area: Area) => {
    if (!areas.includes(area) && areas.length >= 3) {
      notify('Puedes elegir hasta 3 áreas.', 'info');
      return;
    }
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area],
    );
    setErrors((prev) => ({ ...prev, areas: '' }));
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill],
    );
    setErrors((prev) => ({ ...prev, skills: '' }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'El nombre es obligatorio.';
    if (!location.trim()) next.location = 'Indica tu ciudad o zona.';
    if (bio.trim().length < 20) next.bio = 'Escribe al menos 20 caracteres.';
    if (isStudent) {
      const ageNumber = Number(age);
      if (!age.trim() || Number.isNaN(ageNumber)) next.age = 'Indica tu edad.';
      else if (ageNumber < MIN_STUDENT_AGE || ageNumber > MAX_STUDENT_AGE)
        next.age = `La edad debe estar entre ${MIN_STUDENT_AGE} y ${MAX_STUDENT_AGE} años.`;
      if (skills.length < 3) next.skills = 'Elige al menos 3 habilidades.';
      if (interests.length === 0) next.interests = 'Elige al menos un área.';
      if (!university.trim()) next.university = 'Indica tu universidad.';
      if (!degree.trim()) next.degree = 'Indica qué estudias.';
    } else {
      if (!sector.trim()) next.sector = 'Indica el sector de la empresa.';
      if (!contactName.trim()) next.contactName = 'Indica una persona de contacto.';
      if (areas.length === 0) next.areas = 'Elige al menos un área.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const base = {
      name: name.trim(),
      location: location.trim(),
      bio: bio.trim(),
      phone: phone.trim() || undefined,
    };

    if (isStudent) {
      updateCurrentUser({
        ...base,
        surname: surname.trim(),
        age: Number(age),
        headline: headline.trim(),
        university: university.trim(),
        degree: degree.trim(),
        course,
        graduationYear: graduationYear.trim(),
        languages: languages.trim(),
        skills,
        interests,
        github: github.trim() || undefined,
        linkedin: noLinkedin ? undefined : linkedin.trim() || undefined,
        noLinkedin,
      });
    } else {
      updateCurrentUser({
        ...base,
        sector: sector.trim(),
        size,
        website: website.trim() || undefined,
        contactName: contactName.trim(),
        founded: founded.trim() || undefined,
        areas,
      });
    }

    notify('Perfil actualizado. Así te verá el resto de la comunidad.', 'success');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar perfil"
      subtitle="Cuida cómo te presentas: es lo primero que verá una empresa."
      size="lg"
    >
      <form className="stack-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Field label={isStudent ? 'Nombre' : 'Nombre de la empresa'} error={errors.name} required>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={errors.name ? 'input-error' : ''}
            />
          </Field>
          {isStudent ? (
            <Field label="Apellidos">
              <input value={surname} onChange={(event) => setSurname(event.target.value)} />
            </Field>
          ) : (
            <Field label="Persona de contacto" error={errors.contactName} required>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                className={errors.contactName ? 'input-error' : ''}
              />
            </Field>
          )}
          <Field label="Ciudad / zona" error={errors.location} required>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={errors.location ? 'input-error' : ''}
            />
          </Field>
          <Field label="Teléfono" hint="Opcional, pero ayuda a que te contacten.">
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </Field>

          {isStudent ? (
            <Field label="Titular" hint="Una frase corta que resuma tu enfoque." className="span-2">
              <input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                maxLength={90}
              />
            </Field>
          ) : (
            <>
              <Field label="Sector" error={errors.sector} required>
                <input
                  value={sector}
                  onChange={(event) => setSector(event.target.value)}
                  className={errors.sector ? 'input-error' : ''}
                  placeholder="Ej. Salud digital · IA"
                />
              </Field>
              <Field label="Tamaño del equipo">
                <select value={size} onChange={(event) => setSize(event.target.value)}>
                  {COMPANY_SIZES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Año de fundación">
                <input
                  value={founded}
                  onChange={(event) => setFounded(event.target.value)}
                  placeholder="2021"
                />
              </Field>
              <Field label="Web">
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="tuempresa.com"
                />
              </Field>
            </>
          )}
        </div>

        {isStudent && (
          <>
            <div className="form-grid">
              <Field label="Universidad" error={errors.university} required>
                <input
                  list="universities"
                  value={university}
                  onChange={(event) => setUniversity(event.target.value)}
                  className={errors.university ? 'input-error' : ''}
                />
                <datalist id="universities">
                  {UNIVERSITIES.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Field>
              <Field label="Título / grado" error={errors.degree} required>
                <input
                  value={degree}
                  onChange={(event) => setDegree(event.target.value)}
                  className={errors.degree ? 'input-error' : ''}
                />
              </Field>
              <Field label="Curso">
                <select value={course} onChange={(event) => setCourse(event.target.value)}>
                  {COURSES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Año de graduación">
                <input
                  value={graduationYear}
                  onChange={(event) => setGraduationYear(event.target.value)}
                  placeholder="2026"
                />
              </Field>
              <Field label="Edad" error={errors.age}>
                <input
                  type="number"
                  min={MIN_STUDENT_AGE}
                  max={MAX_STUDENT_AGE}
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="Ej. 22"
                  className={errors.age ? 'input-error' : ''}
                />
              </Field>
              <Field label="Idiomas">
                <input
                  value={languages}
                  onChange={(event) => setLanguages(event.target.value)}
                  placeholder="Español nativo · Inglés C1"
                />
              </Field>
            </div>

            <div className="form-section">
              <div className="form-section-head">
                <h3>Tus habilidades</h3>
                <span>Mínimo 3</span>
              </div>
              <div className="chip-wrap">
                {Array.from(new Set([...SKILLS, ...skills])).map((skill) => (
                  <ChipButton
                    key={skill}
                    active={skills.includes(skill)}
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
                <h3>Áreas que te interesan</h3>
                <span>Hasta 3</span>
              </div>
              <div className="chip-wrap">
                {AREAS.map((area) => (
                  <ChipButton
                    key={area}
                    active={interests.includes(area)}
                    onClick={() => toggleInterest(area)}
                  >
                    {area}
                  </ChipButton>
                ))}
              </div>
              {errors.interests && <span className="field-error block">{errors.interests}</span>}
            </div>

            <div className="form-grid">
              <Field label="GitHub">
                <input
                  value={github}
                  onChange={(event) => setGithub(event.target.value)}
                  placeholder="github.com/tu-usuario"
                />
              </Field>
              <Field label="LinkedIn" hint={noLinkedin ? 'Has indicado que no tienes LinkedIn.' : 'Opcional'}>
                <input
                  value={linkedin}
                  onChange={(event) => setLinkedin(event.target.value)}
                  placeholder="linkedin.com/in/tu-perfil"
                  disabled={noLinkedin}
                />
              </Field>
            </div>
            <label className="checkbox-line">
              <input
                type="checkbox"
                checked={noLinkedin}
                onChange={(event) => {
                  setNoLinkedin(event.target.checked);
                  if (event.target.checked) setLinkedin('');
                }}
              />
              <span>No tengo LinkedIn</span>
            </label>
          </>
        )}

        {!isStudent && (
          <div className="form-section">
            <div className="form-section-head">
              <h3>Áreas en las que buscas talento</h3>
              <span>Hasta 3</span>
            </div>
            <div className="chip-wrap">
              {AREAS.map((area) => (
                <ChipButton
                  key={area}
                  active={areas.includes(area)}
                  onClick={() => toggleArea(area)}
                >
                  {area}
                </ChipButton>
              ))}
            </div>
            {errors.areas && <span className="field-error block">{errors.areas}</span>}
          </div>
        )}

        <Field
          label={isStudent ? 'Sobre ti' : 'Sobre la empresa'}
          error={errors.bio}
          hint="Esto es lo que leerá alguien antes de decidir contactarte."
          required
        >
          <textarea
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className={errors.bio ? 'input-error' : ''}
            maxLength={600}
          />
        </Field>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}
