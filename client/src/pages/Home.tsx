import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Code, Layers, Leaf, ExternalLink, Cloud, Workflow, ShieldCheck, Users } from 'lucide-react';
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

type TerminalEntry = { type: 'command' | 'output'; node: React.ReactNode };

const contactOutput = (
  <div className="terminal-contact">
    <div className="terminal-contact-name">Theo Bernardin <span className="log-dim">— Lead Data Engineer</span></div>
    <div><span className="terminal-contact-label">email</span><a className="terminal-link" href="mailto:contact@theo0x1337.dev">contact@theo0x1337.dev</a></div>
    <div><span className="terminal-contact-label">github</span><a className="terminal-link" href="https://github.com/Theo0x1337" target="_blank" rel="noopener noreferrer">github.com/Theo0x1337</a></div>
    <div><span className="terminal-contact-label">linkedin</span><a className="terminal-link" href="https://www.linkedin.com/in/theo-bernardin/" target="_blank" rel="noopener noreferrer">linkedin.com/in/theo-bernardin</a></div>
  </div>
);

const resumeOutput = (
  <div className="terminal-contact">
    <div className="terminal-contact-name">Theo Bernardin <span className="log-dim">— Lead Data Engineer</span></div>
    <div className="log-dim">Resume / CV</div>
    <div>
      <span className="terminal-contact-label">download</span>
      <a className="terminal-link" href="/resume.pdf" target="_blank" rel="noopener noreferrer" download>
        resume.pdf
      </a>
    </div>
    <div>
      <span className="terminal-contact-label">online</span>
      <Link className="terminal-link" to="/experience">full work history &amp; education &rarr;</Link>
    </div>
  </div>
);

const helpOutput = (
  <div>
    <div>Available commands:</div>
    <div><span className="log-green">resume</span>  <span className="log-dim">— download my resume (CV)</span></div>
    <div><span className="log-green">contact</span> <span className="log-dim">— show how to reach me</span></div>
    <div><span className="log-green">help</span>    <span className="log-dim">— list commands</span></div>
    <div><span className="log-green">clear</span>   <span className="log-dim">— clear the screen</span></div>
  </div>
);

export default function Home() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [typedCommand, setTypedCommand] = useState('');
  const [visibleLogs, setVisibleLogs] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalEntry[]>([]);
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<any>(null);

  const IDLE_TIMEOUT = 120000; // resume the demo after 2 min of inactivity

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsInteractive(false);
      setInput('');
      setHistory([]);
    }, IDLE_TIMEOUT);
  };

  useEffect(() => () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTo({
        top: terminalBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleLogs, typedCommand, history, input]);

  const enterInteractive = () => {
    terminalBodyRef.current?.focus();
    resetIdleTimer();
    if (isInteractive) return;
    setIsInteractive(true);
    setInput(typedCommand);
    setHistory([
      { type: 'output', node: <span className="log-dim">interactive shell — type 'resume', 'contact' or 'help', then press Enter</span> }
    ]);
  };

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (cmd === 'clear') {
      setHistory([]);
      return;
    }
    const entries: TerminalEntry[] = [{ type: 'command', node: <>$ {raw}</> }];
    if (cmd === '') {
      // just a new prompt
    } else if (cmd === 'resume' || cmd === 'cv') {
      entries.push({ type: 'output', node: resumeOutput });
    } else if (cmd === 'contact') {
      entries.push({ type: 'output', node: contactOutput });
    } else if (cmd === 'help') {
      entries.push({ type: 'output', node: helpOutput });
    } else {
      entries.push({
        type: 'output',
        node: <span>command not found: {cmd} <span className="log-dim">(try 'help')</span></span>
      });
    }
    setHistory(prev => [...prev, ...entries]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    resetIdleTimer();
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input);
      setInput('');
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      setInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setInput(prev => prev + e.key);
    }
  };

  useEffect(() => {
    if (isInteractive) return;

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
  }, [scenarioIdx, isInteractive]);

  const skillsData = [
    {
      category: 'Cloud & Data Warehouse',
      icon: <Cloud size={20} />,
      tags: ['Google Cloud (GCP)', 'BigQuery', 'Cloud Functions', 'Pub/Sub', 'Cloud Storage', 'Redis']
    },
    {
      category: 'Transformation & Modeling',
      icon: <Layers size={20} />,
      tags: ['DBT', 'Dimensional Modeling', 'SCD Type 2', 'ELT / ETL Design', 'Data Architecture']
    },
    {
      category: 'Orchestration & Infrastructure',
      icon: <Workflow size={20} />,
      tags: ['Apache Airflow', 'GitLab CI/CD', 'Docker', 'Terraform']
    },
    {
      category: 'Languages',
      icon: <Code size={20} />,
      tags: ['Python', 'SQL (BigQuery / Postgres)', 'TypeScript', 'JavaScript', 'Bash']
    },
    {
      category: 'Data Quality & Governance',
      icon: <ShieldCheck size={20} />,
      tags: ['Testing & Data Quality', 'Pipeline Observability', 'Data Lineage', 'Master Data Management', 'Data Governance']
    },
    {
      category: 'Leadership & Delivery',
      icon: <Users size={20} />,
      tags: ['Tech Lead', 'Mentoring', 'Scrum / Agile', 'Code Reviews', 'Jira & Confluence']
    }
  ];

  const featuredProjects: Project[] = [
    {
      title: 'White Plume Investment (WPI)',
      description: 'A personal end-to-end market intelligence platform for the second-hand luxury watch market. Every two hours, scrapers collect thousands of listings from Chrono24, eBay, and Catawiki into BigQuery, where Gemini normalizes messy listing titles into clean brand, model, and reference data. DBT then builds the warehouse in layers, a FastAPI service exposes it with Redis caching and Postgres-backed user alerts, and a React dashboard lets you explore prices and track market liquidity. A watcher also monitors auctions and fires real-time Discord alerts when a deal drops below market value.',
      highlights: ['Multi-source scraping every 2h', 'Gemini listing normalization & enrichment', 'Real-time Discord deal alerts on auctions'],
      stack: ['Node.js', 'Python', 'FastAPI', 'React', 'DBT', 'BigQuery', 'PostgreSQL', 'Redis', 'Gemini', 'Docker'],
      demoUrl: 'https://whiteplumeinvestments.com/',
      imageUrl: '/lit-wpi-logo-no-bg.png'
    },
    {
      title: 'Hyperspectral Machine Learning classification',
      description: 'Co-authored an Elsevier paper (Procedia Computer Science, CENTERIS 2021) on automatically detecting Flavescence dorée, a grapevine disease, from hyperspectral leaf images. We trained autoencoders to compress the 272 spectral bands into a compact latent space, then reused the encoder as a feature extractor feeding a classifier. On held-out leaves this reached 83% accuracy and a 0.92 AUC, beating a standard CNN while using far less compute.',
      highlights: ['83% accuracy and 0.92 AUC on held-out leaves', 'Autoencoder compresses 272 spectral bands into a compact latent space', 'Encoder reused as a feature extractor, +0.34 AUC over a CNN baseline', 'Elsevier / Procedia Computer Science co-author'],
      stack: ['Python', 'Autoencoders', 'CNN', 'Hyperspectral imaging'],
      demoUrl: 'https://www.sciencedirect.com/science/article/pii/S1877050921022201',
      demoLabel: 'Read paper'
    }
  ];

  return (
    <div className="container home-container" id="home-page">
      {/* Hero Section */}
      <section className="hero" id="home-hero">
        <div className="hero-content">
          <h1>Designing scalable data architectures for cloud environments.</h1>
          <p className="hero-description">
            Hi, I'm <strong>Theo Bernardin</strong>. I build robust <span className="hero-accent">data pipelines</span>,{' '}
            <span className="hero-accent">analytics platforms</span>, and <span className="hero-accent">cloud solutions</span>{' '}
            that turn complex operations into reliable, decision-ready data.
            As a Tech Lead and Scrum Master, I cover data architecture, code reviews, governance, and agile delivery,
            always tied to what the business needs: hitting <span className="hero-accent">SLAs</span>, speeding up{' '}
            <span className="hero-accent">go-to-market</span>, and showing real impact.
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
              tabIndex={0}
              onClick={enterInteractive}
              onKeyDown={handleKeyDown}
              style={{
                opacity: isInteractive ? 1 : (isFadingOut ? 0 : 1),
                transition: 'opacity 0.4s ease',
                height: '240px',
                overflowY: 'auto',
                cursor: 'text',
                outline: 'none'
              }}
            >
              {isInteractive ? (
                <>
                  {history.map((entry, index) => (
                    <div className={`terminal-line ${entry.type}`} key={index}>
                      {entry.node}
                    </div>
                  ))}
                  <div className="terminal-line command" style={{ opacity: 1, transform: 'none', animation: 'none' }}>
                    $ {input}
                    <span className="terminal-cursor"></span>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      <section className="section" id="skills-section">
        <div className="section-title-wrapper">
          <span className="section-tagline">Expertise</span>
          <h2>Engineering the Modern Data Stack</h2>
          <p>The capabilities that turn raw operational data into trusted, decision-ready analytics: cloud warehousing, DBT modeling, orchestration, governance, and the team practices that ship it to production.</p>
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
              <div className={`project-card-image${!project.imageUrl && idx !== 0 ? ' project-card-image-spectral' : ''}`}>
                {project.imageUrl
                  ? <img src={project.imageUrl} alt={`${project.title} logo`} className="project-card-logo" />
                  : idx === 0 ? <Database size={48} /> : <Leaf size={52} className="project-card-spectral-icon" />}
              </div>
              <div className="project-card-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                
                <ul className="project-highlights">
                  {project.highlights.map((highlight, hIdx) => (
                    <li key={hIdx}>{highlight}</li>
                  ))}
                </ul>

                <div className="project-tech">
                  {project.stack.map((tech, techIdx) => (
                    <span className="project-tech-badge" key={techIdx}>{tech}</span>
                  ))}
                </div>

                {project.demoUrl && (
                  <a
                    className="project-link"
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.demoLabel ?? 'Visit site'} <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
