import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Code, Layers, Terminal, BookOpen } from 'lucide-react';
import type { Project } from 'shared';

const scenarios = [
  {
    command: 'dbt run --select supply_chain',
    logs: [
      <span>19:24:01 | Concurrency: 8 threads</span>,
      <span><span className="log-blue">START</span> incremental model snapshots.orders_history</span>,
      <span><span className="log-green">PASS</span> dbt unique_key constraints check</span>,
      <span><span className="log-blue">START</span> view model analytics.cost_optimized_clusters</span>,
      <span><span className="log-green">OK</span> created view model analytics.cost_optimized_clusters</span>,
      <span>19:24:05 | Status: <span className="badge-success">SUCCESS</span> (4 models, 8 tests passed)</span>
    ]
  },
  {
    command: 'git push origin feat/optimize-bq-keys',
    logs: [
      <span>Enumerating objects: 7, done.</span>,
      <span>Counting objects: 100% (7/7), done.</span>,
      <span>Delta compression using up to 8 threads</span>,
      <span>Compressing objects: 100% (4/4), done.</span>,
      <span>Writing objects: 100% (4/4), 450 bytes, done.</span>,
      <span>To github.com:Theo0x1337/analytics.git</span>,
      <span>   f0e451e..1b4f912  feat/optimize-bq-keys {"->"} feat/optimize-bq-keys</span>
    ]
  },
  {
    command: 'python check_data_quality.py --dataset production',
    logs: [
      <span>Connecting to Google BigQuery client...</span>,
      <span>Validating row count parity: <span className="log-green">OK</span></span>,
      <span>Scanning columns nullability: <span className="log-green">OK</span></span>,
      <span>Checking SCD Type 2 gap overlaps: 0 anomalies</span>,
      <span>[STATUS] Pipeline health validation: <span className="badge-success">PASSED</span></span>
    ]
  }
];

export default function Home() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  const [visibleLogs, setVisibleLogs] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTo({
        top: terminalBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleLogs, typedCommand]);

  useEffect(() => {
    let typeTimer: any;
    let logTimer: any;
    let waitTimer: any;
    let fadeTimer: any;

    const currentScenario = scenarios[scenarioIdx];
    let currentLength = 0;

    // Reset states
    setTypedCommand('');
    setVisibleLogs(0);
    setIsFadingOut(false);

    const typeCommand = () => {
      if (currentLength < currentScenario.command.length) {
        currentLength++;
        setTypedCommand(currentScenario.command.slice(0, currentLength));
        typeTimer = setTimeout(typeCommand, 50);
      } else {
        // Command typed, wait and reveal logs
        waitTimer = setTimeout(revealLogs, 300);
      }
    };

    // Start typing
    typeTimer = setTimeout(typeCommand, 300);

    let logIndex = 0;
    const revealLogs = () => {
      if (logIndex < currentScenario.logs.length) {
        setVisibleLogs(prev => prev + 1);
        logIndex++;
        logTimer = setTimeout(revealLogs, 450);
      } else {
        // Hold visible state
        waitTimer = setTimeout(() => {
          setIsFadingOut(true);
          // Wait for fadeout before looping
          fadeTimer = setTimeout(() => {
            setScenarioIdx(prev => (prev + 1) % scenarios.length);
          }, 500);
        }, 5000);
      }
    };

    return () => {
      clearTimeout(typeTimer);
      clearTimeout(logTimer);
      clearTimeout(waitTimer);
      clearTimeout(fadeTimer);
    };
  }, [scenarioIdx]);

  const skillsData = [
    {
      category: 'Data & Cloud Stack',
      icon: <Database size={20} />,
      tags: ['GCP', 'BigQuery', 'dbt (Core)', 'Apache Airflow', 'Redis', 'Docker', 'Terraform', 'Pub/Sub', 'Cloud Functions']
    },
    {
      category: 'Languages',
      icon: <Code size={20} />,
      tags: ['Python', 'SQL (BigQuery/Postgres)', 'JavaScript', 'TypeScript', 'Bash/Shell']
    },
    {
      category: 'Engineering Practices',
      icon: <Layers size={20} />,
      tags: ['Data Architecture', 'ETL/ELT Design', 'Dimensional Modeling', 'Master Data Management', 'Data Governance']
    },
    {
      category: 'Workflow & Agile',
      icon: <Terminal size={20} />,
      tags: ['GitLab CI/CD', 'Scrum Master', 'Mentoring / Tech Lead', 'Jira / Confluence']
    }
  ];

  const featuredProjects: Project[] = [
    {
      title: 'Resilient SCD Type 2 Pipeline',
      description: 'Built a custom dbt-based incremental Slowly Changing Dimension (SCD) Type 2 ingestion pipeline running inside GCP BigQuery, saving 40% in scan costs.',
      highlights: ['dbt Core snapshot tuning', 'BigQuery query optimization', 'Gap detection testing framework'],
      stack: ['dbt', 'BigQuery', 'SQL', 'GitLab CI/CD']
    },
    {
      title: 'Hyperspectral Machine Learning classification',
      description: 'Co-authored a research paper using machine learning (PCA + SVM) on hyperspectral images for early detection of grapevine leaf disease (Flavescence dorée).',
      highlights: ['92.4% classification accuracy', 'Applied dimensionality reduction (PCA)', 'Elsevier publication co-author'],
      stack: ['Python', 'Scikit-Learn', 'PCA', 'Hyperspectral sensors']
    }
  ];

  return (
    <div className="container home-container" id="home-page">
      {/* Hero Section */}
      <section className="hero" id="home-hero">
        <div className="hero-content">
          <h1>Designing scalable data architectures for cloud environments.</h1>
          <p className="hero-description">
            Hi, I'm <strong>Theo Bernardin</strong>. I build robust data pipelines, analytics engineering platforms,
            and cloud solutions that handle complex retail and supply-chain operations. As a Tech Lead and Scrum Master,
            I champion clean code reviews, data governance, and agile team execution.
          </p>
          <div className="hero-actions">
            <Link to="/experience" className="btn btn-primary" id="hero-cta-exp">
              Explore Timeline <ArrowRight size={16} />
            </Link>
            <Link to="/blog" className="btn btn-secondary" id="hero-cta-blog">
              Read My Blog
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-terminal" id="hero-terminal-mockup">
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="terminal-title">console (~/theo0x1337)</span>
            </div>
            <div 
              ref={terminalBodyRef}
              className="terminal-body" 
              style={{ 
                opacity: isFadingOut ? 0 : 1, 
                transition: 'opacity 0.4s ease', 
                height: '240px',
                overflowY: 'auto'
              }}
            >
              <div className="terminal-line command" style={{ opacity: 1, transform: 'none', animation: 'none' }}>
                $ {typedCommand}
                <span className="terminal-cursor"></span>
              </div>
              {scenarios[scenarioIdx].logs.slice(0, visibleLogs).map((log, index) => (
                <div 
                  className="terminal-line log" 
                  key={index}
                  style={{ 
                    opacity: 0, 
                    transform: 'translateY(4px)', 
                    animation: 'terminalLineFade 0.25s ease-out forwards' 
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      <section className="section" id="skills-section">
        <div className="section-title-wrapper">
          <span className="section-tagline">Expertise</span>
          <h2>Technical Skills & Practices</h2>
          <p>My toolbelt is tailored around modern data engineering, cloud-native systems, and agile delivery.</p>
        </div>

        <div className="skills-grid">
          {skillsData.map((group, idx) => (
            <div className="skill-category" key={idx}>
              <h3 className="skill-category-title">
                {group.icon}
                {group.category}
              </h3>
              <div className="skill-tags">
                {group.tags.map((tag, tagIdx) => (
                  <span className="skill-tag" key={tagIdx}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="section" id="projects-section">
        <div className="section-title-wrapper">
          <span className="section-tagline">Featured Projects</span>
          <h2>Selected Work & Research</h2>
          <p>Highlighting core data engineering pipelines and published research studies.</p>
        </div>

        <div className="projects-grid">
          {featuredProjects.map((project, idx) => (
            <div className="project-card" key={idx}>
              <div className="project-card-image">
                {idx === 0 ? <Database size={48} /> : <BookOpen size={48} />}
              </div>
              <div className="project-card-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <ul style={{ paddingLeft: '18px', margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  {project.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} style={{ marginBottom: '4px' }}>{highlight}</li>
                  ))}
                </ul>

                <div className="project-tech">
                  {project.stack.map((tech, techIdx) => (
                    <span className="project-tech-badge" key={techIdx}>{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
