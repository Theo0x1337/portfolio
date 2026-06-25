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
// "DBT Core" wins over "DBT").
const TECH_KEYWORDS = [
  'DBT Core', 'DBT', 'BigQuery', 'GCP', 'SQL', 'Python',
  'Apache Airflow', 'Airflow', 'GitLab CI/CD', 'Docker',
  'JavaScript', 'TypeScript', 'Scikit-learn', 'PCA',
  'machine learning', 'hyperspectral', 'blockchain',
  'Scrum Master', 'Agile', 'data modeling', 'dimensionality reduction',
  'SCD Type 2', 'ETL/ELT', 'single source of truth', 'Confluence'
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

// A work entry plus optional headline metrics shown as stat chips.
type ExperienceEntry = WorkExperience & {
  metrics?: { value: string; label: string }[];
};

export default function Experience() {
  const experiences: ExperienceEntry[] = [
    {
      role: 'Lead Data Engineer',
      company: 'Carrefour',
      period: 'Apr 2023 — Present',
      location: 'Paris, France',
      logoUrl: logoDevUrl('carrefour.com'),
      metrics: [
        { value: '100B+', label: 'rows in production' },
        { value: '100+ TB', label: 'data perimeter' },
        { value: '99.6%', label: 'availability' },
        { value: '~€36K/yr', label: 'compute saved' }
      ],
      highlights: [
        'Own the data engineering for Carrefour France\'s entire Offer & Supply Chain perimeter, designing, deploying, and operating dozens of ETL/ELT pipelines on GCP/BigQuery (DBT Core) over 100B+ rows and 100+ TB at up to 99.6% availability.',
        'Architected a flagship Slowly Changing Dimension (SCD Type 2) pipeline consolidating 13 disparate source systems into one historically-accurate model of product assortment across hypermarkets, supermarkets, proximity stores, and warehouses, replacing a fragmented manual process with an audited single source of truth.',
        'Engineered custom delta-detection and early-exit logic plus heavy SQL tuning across pipelines, cutting BigQuery compute cost by ~20% (~€100/day, ~€36K/year) while sustaining 20-minute refresh cadences.',
        'Built automated fallback mechanisms and real-time alerting that prevent data loss and duplication across failed runs, keeping critical store and warehouse operations continuously supplied with fresh data.',
        'As Tech Lead and Scrum Master, set the technical vision and engineering standards, run code reviews, mentor and onboard 5 engineers (3 as direct reports), and lead Agile ceremonies for a 10-person squad.'
      ],
      stack: ['SQL', 'DBT Core', 'Python', 'GCP', 'BigQuery', 'Apache Airflow', 'GitLab CI/CD', 'Jira', 'Confluence']
    },
    {
      role: 'Independent Data Instructor',
      company: 'Self-employed',
      period: 'Apr 2024 — Present',
      location: 'Europe',
      metrics: [
        { value: '100+', label: 'professionals trained' }
      ],
      highlights: [
        'Trained 100+ professionals upskilling or transitioning into the data field through continuing professional education programs.',
        'Instruct core modules covering foundational algorithms (logic and problem-solving), scientific computing (data manipulation, numerical analysis), data visualization, and data engineering pipelines and architecture.'
      ],
      stack: ['Python', 'SQL', 'Algorithms', 'Scientific Computing', 'Data Visualization']
    },
    {
      role: 'Data Engineer',
      company: 'OPCODES',
      period: 'Mar 2022 — Apr 2023',
      location: 'Paris, France',
      logoUrl: logoDevUrl('opcodes.fr'),
      highlights: [
        'Reverse-engineered existing data pipelines and ingestion scripts in Python to extract relevant transaction data from blockchain logs.',
        'Structured and stored large volumes of blockchain transaction data efficiently into Google BigQuery tables.',
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
      metrics: [
        { value: 'Elsevier', label: 'published paper' }
      ],
      highlights: [
        'Conducted research on the early detection of grapevine leaf diseases using hyperspectral imaging data.',
        'Leveraged machine learning (Scikit-learn, PCA) to identify early symptoms and reduce data dimensionality for more efficient processing and storage.',
        'Co-authored and published "Automatic detection of Flavescence dorée grapevine disease in hyperspectral images using machine learning" in Elsevier\'s Procedia Computer Science.'
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
      logoUrl: logoDevUrl('univ-smb.fr'),
      details: [
        'Software & IT: object-oriented design and programming (Python, C), algorithmics, databases, operating systems, virtualization and distributed networks.',
        'Data & AI: machine learning, statistical analysis, Big Data, concurrent data flows, data quality and governance for decision support.',
        'Science & maths: discrete mathematics, probability, statistics, optimization, cryptography and stochastic modelling.',
        'Engineering & professional: project management, sustainable engineering and English (TOEIC), with internships and a research thesis.'
      ]
    },
    {
      degree: 'Exchange Program',
      field: 'Computer Science & Data',
      school: 'Babeș-Bolyai University',
      period: '2021 — 2022',
      location: 'Cluj-Napoca, Romania',
      logoUrl: logoDevUrl('ubbcluj.ro'),
      details: [
        'High-performance computing: CUDA development and distributed programming.',
        'Data & AI: natural language processing and Big Data.',
        'Science & maths: graph theory.'
      ]
    },
    {
      degree: 'Associate Degree — DUT Informatique',
      field: 'Computer Science',
      school: 'Université de Lorraine',
      period: '2017 — 2019',
      location: 'Nancy, France',
      logoUrl: logoDevUrl('univ-lorraine.fr'),
      details: [
        'Software development: object-oriented & web programming, application architecture, software quality and maintenance.',
        'Data: relational and NoSQL databases, SQL, data modelling and exploitation.',
        'Systems & networks: systems and network administration, virtualization, cloud computing, cybersecurity fundamentals.',
        'Science & maths: discrete mathematics, probability, graph theory, algorithmics and optimization.'
      ]
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
        <p>Over 4 years building and operating data platforms across retail, blockchain, and research. A timeline of my roles, with the key metrics, systems, and stacks behind each.</p>
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
                    {exp.metrics && exp.metrics.length > 0 && (
                      <p className="timeline-metrics-text">
                        {exp.metrics.map((m, mIdx) => (
                          <span key={mIdx}>
                            {mIdx > 0 && <span className="timeline-metrics-sep"> · </span>}
                            <span className="timeline-metric-value">{m.value}</span> {m.label}
                          </span>
                        ))}
                      </p>
                    )}

                    <ul className="timeline-details">
                      {exp.highlights.map((highlight, hIdx) => (
                        <li key={hIdx}>{highlightKeywords(highlight, keywords)}</li>
                      ))}
                    </ul>

                    <div className="timeline-stack">
                      <span className="timeline-stack-label">Tech Stack:</span>{' '}
                      {exp.stack.join(', ')}
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
