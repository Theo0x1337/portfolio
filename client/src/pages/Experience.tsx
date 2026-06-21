import { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import type { WorkExperience } from 'shared';

interface EducationEntry {
  degree: string;
  school: string;
  field?: string;
  period: string;
  location?: string;
  logoUrl?: string;
  details?: string[];
}

// Tech/stack keywords highlighted inside the job descriptions. Curated so the
// terms actually appear in the prose below (longer terms first so e.g.
// "dbt Core" wins over "dbt").
const TECH_KEYWORDS = [
  'dbt Core', 'dbt', 'BigQuery', 'GCP', 'SQL', 'Python',
  'Apache Airflow', 'Airflow', 'GitLab CI/CD', 'Docker',
  'JavaScript', 'TypeScript', 'Scikit-learn', 'PCA',
  'machine learning', 'hyperspectral', 'blockchain',
  'Scrum Master', 'Agile', 'data modeling', 'dimensionality reduction'
];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// logo.dev publishable token (set VITE_LOGO_DEV_KEY). A pk_ key is meant to be
// exposed client-side. Without it logo.dev returns a blank placeholder.
const LOGODEV_TOKEN = import.meta.env.VITE_LOGO_DEV_KEY ?? '';
const logoDevUrl = (domain: string) =>
  `https://img.logo.dev/${domain}?size=128&format=png` +
  (LOGODEV_TOKEN ? `&token=${LOGODEV_TOKEN}` : '');

// Splits text into React nodes, wrapping any matched keyword in an accent span.
function highlightKeywords(text: string, keywords: string[]) {
  const uniq = Array.from(new Set(keywords)).sort((a, b) => b.length - a.length);
  if (uniq.length === 0) return text;
  const lookup = new Set(uniq.map(k => k.toLowerCase()));
  const re = new RegExp(`\\b(${uniq.map(escapeRegExp).join('|')})\\b`, 'gi');
  return text.split(re).map((part, i) =>
    lookup.has(part.toLowerCase())
      ? <span className="stack-keyword" key={i}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

// Company / university logo with a graceful initials fallback when no logo URL
// is provided or the remote image fails to load.
function CompanyLogo({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/[^A-Za-z\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (logoUrl && !failed) {
    return (
      <img
        className="company-logo"
        src={logoUrl}
        alt={`${name} logo`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="company-logo company-logo-fallback" aria-hidden="true">
      {initials}
    </div>
  );
}

export default function Experience() {
  const experiences: WorkExperience[] = [
    {
      role: 'Lead Data Engineer',
      company: 'Carrefour',
      period: 'Apr 2023 — Present',
      location: 'France (Open to Relocation)',
      logoUrl: logoDevUrl('carrefour.com'),
      highlights: [
        'Define the target technical vision and development standards, implementing engineering best practices and conducting code reviews to maintain technical excellence.',
        'Design, deploy, and maintain complex dbt data pipelines for supply chain and offer data, performing advanced data modeling and transformations in BigQuery using dbt Core and a custom Carrefour framework.',
        'Structure the analytics architecture, manage data quality through rigorous testing and monitoring, and optimize SQL queries to reduce computing costs.',
        'Serve as Scrum Master for a 10-person squad: lead Agile ceremonies (Daily, Sprint Planning, Retrospectives, Backlog Refinement), resolve workflow impediments, and track squad delivery velocity.',
        'Provide technical guidance to developers during onboarding and translate business requirements from stakeholders into scalable data solutions.'
      ],
      stack: ['SQL', 'dbt Core', 'Python', 'GCP', 'Apache Airflow', 'GitLab CI/CD', 'Jira']
    },
    {
      role: 'Independent Data Instructor',
      company: 'Self-employed',
      period: 'Apr 2024 — Present',
      location: 'France',
      highlights: [
        'Deliver continuing professional education programs for adults upskilling or transitioning into the data field.',
        'Instruct core modules covering foundational algorithms (logic and problem-solving), scientific computing (data manipulation, numerical analysis), data visualization, and data engineering pipelines/architecture.'
      ],
      stack: ['Python', 'SQL', 'Algorithms', 'Scientific Computing', 'Data Visualization']
    },
    {
      role: 'Data Engineer',
      company: 'OPCODES',
      period: 'Mar 2022 — Apr 2023',
      location: 'France',
      logoUrl: logoDevUrl('opcodes.fr'),
      highlights: [
        'Reverse-engineered existing data pipelines and ingestion scripts in Python to extract relevant transaction data from blockchain logs.',
        'Structured and stored large volumes of transaction data efficiently into Google BigQuery database tables.',
        'Performed data cleaning, transformation, and aggregation to prepare transaction insights for downstream consumption.',
        'Built and refined dynamic dashboard components to explore transaction patterns and user behaviors.'
      ],
      stack: ['Python', 'SQL', 'BigQuery', 'Docker', 'JavaScript', 'TypeScript']
    },
    {
      role: 'Research Data Scientist Intern',
      company: 'UTAD',
      period: 'May 2021 — Jul 2021',
      location: 'Vila Real, Portugal',
      logoUrl: logoDevUrl('utad.pt'),
      highlights: [
        'Conducted research on the early detection of plant grapevine leaf diseases using hyperspectral imaging data.',
        'Leveraged machine learning techniques (Scikit-learn, PCA) to identify early symptoms and reduce data dimensionality for more efficient processing and storage.',
        'Co-authored and published research paper: "Automatic detection of Flavescence dorée grapevine disease in hyperspectral images using machine learning" in Elsevier\'s Procedia Computer Science.'
      ],
      stack: ['Python', 'Scikit-Learn', 'PCA', 'Hyperspectral Sensors', 'Machine Learning']
    }
  ];

  const education: EducationEntry[] = [
    {
      degree: 'M.S. in Engineering — Diplôme d’Ingénieur',
      field: 'Computer Science & Data',
      school: 'Polytech Annecy-Chambéry · Université Savoie Mont Blanc (USMB)',
      period: '2019 — 2022',
      location: 'Annecy, France',
      logoUrl: logoDevUrl('univ-smb.fr')
    },
    {
      degree: 'Exchange Program',
      field: 'Computer Science',
      school: 'Babeș-Bolyai University',
      period: '2021 — 2022',
      location: 'Cluj-Napoca, Romania',
      logoUrl: logoDevUrl('ubbcluj.ro')
    },
    {
      degree: 'Associate Degree in Computer Science — DUT Informatique',
      school: 'Université de Lorraine',
      period: '2017 — 2019',
      location: 'France',
      logoUrl: logoDevUrl('univ-lorraine.fr')
    }
  ];

  // State to track which items are expanded (initially all expanded)
  const [expandedIndex, setExpandedIndex] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="container" id="experience-page" style={{ maxWidth: '800px' }}>
      <div className="section-title-wrapper">
        <span className="section-tagline">Career Path</span>
        <h2>Professional Experience</h2>
        <p>A timeline of my professional roles, tech stacks, and key accomplishments in data engineering and data science.</p>
      </div>

      <div className="timeline" id="experience-timeline">
        {experiences.map((exp, idx) => {
          const isExpanded = expandedIndex[idx];
          // Highlight the job's own stack plus the shared tech glossary.
          const keywords = [...exp.stack, ...TECH_KEYWORDS];
          return (
            <div className="timeline-item" key={idx}>
              <div className="timeline-marker"></div>

              <div className="timeline-content">
                <div
                  className="timeline-header"
                  onClick={() => toggleExpand(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="timeline-header-main">
                    <CompanyLogo name={exp.company} logoUrl={exp.logoUrl} />
                    <div>
                      <h3 className="timeline-role">
                        {exp.role} <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>at</span> <span className="timeline-company">{exp.company}</span>
                      </h3>
                      <div className="timeline-location">
                        <MapPin size={14} /> {exp.location}
                      </div>
                    </div>
                  </div>
                  <div className="timeline-header-side">
                    <span className="timeline-period">{exp.period}</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <ul className="timeline-details">
                      {exp.highlights.map((highlight, hIdx) => (
                        <li key={hIdx}>{highlightKeywords(highlight, keywords)}</li>
                      ))}
                    </ul>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', marginRight: '4px' }}>Tech Stack:</span>
                      {exp.stack.map((tech, techIdx) => (
                        <span key={techIdx} className="project-tech-badge">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title-wrapper" style={{ marginTop: '64px' }}>
        <span className="section-tagline">Academic Background</span>
        <h2>Education</h2>
        <p>My academic foundation in engineering and computer science.</p>
      </div>

      <div className="timeline" id="education-timeline">
        {education.map((edu, idx) => (
          <div className="timeline-item" key={idx}>
            <div className="timeline-marker"></div>

            <div className="timeline-content">
              <div className="timeline-header" style={{ cursor: 'default' }}>
                <div className="timeline-header-main">
                  <CompanyLogo name={edu.school} logoUrl={edu.logoUrl} />
                  <div>
                    <h3 className="timeline-role">
                      {edu.degree}
                      {edu.field && (
                        <span style={{ fontWeight: 400, color: 'var(--text-light)' }}> · {edu.field}</span>
                      )}
                    </h3>
                    <div className="timeline-company" style={{ fontSize: '0.95rem' }}>{edu.school}</div>
                    {edu.location && (
                      <div className="timeline-location">
                        <MapPin size={14} /> {edu.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="timeline-header-side">
                  <span className="timeline-period">{edu.period}</span>
                </div>
              </div>

              {edu.details && edu.details.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <ul className="timeline-details" style={{ marginBottom: 0 }}>
                    {edu.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
