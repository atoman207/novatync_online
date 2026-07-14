"use client";

import { useEffect, useRef, useState } from "react";
import AvatarCoin3D from "./AvatarCoin3D";
import Background3D from "./Background3D";
import SiteShot from "./SiteShot";

/* ---------------- Data ---------------- */

const ROLES = [
  "Full-Stack & AI Engineer",
  "SaaS Platform Builder",
  "AI Integration Specialist",
  "Workflow Automation Expert",
];

const TICKER = [
  "React", "Next.js", "Node.js", "Laravel", "Python", "TypeScript",
  "SaaS", "AI Integrations", "LangChain", "RAG", "Automation", "FastAPI",
  "PostgreSQL", "AWS", "Docker", "Kubernetes", "GraphQL", "Hugging Face",
  "n8n / Zapier", "MLOps",
];

type SkillGroup = {
  icon: string;
  title: string;
  skills: string[];
};

const SKILL_GROUPS: SkillGroup[] = [
  {
    icon: "🎨",
    title: "Frontend Engineering",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript (ES2024)", "Vue.js",
      "Tailwind CSS", "HTML5 / CSS3", "Redux / Zustand", "React Query",
      "Three.js / WebGL", "Framer Motion", "Responsive & A11y", "PWA",
    ],
  },
  {
    icon: "⚙️",
    title: "Backend Engineering",
    skills: [
      "Node.js", "Laravel", "PHP", "Python", "FastAPI", "NestJS",
      "Django", "GraphQL", "REST APIs", "gRPC", "WebSockets",
      "Microservices", "Event-Driven Architecture", "OAuth2 / JWT",
      "Stripe Integrations",
    ],
  },
  {
    icon: "🧠",
    title: "AI / Machine Learning",
    skills: [
      "PyTorch", "TensorFlow", "Large Language Models", "RAG Pipelines",
      "LangChain / LangGraph", "LlamaIndex", "Hugging Face Transformers",
      "OpenAI & Anthropic APIs", "Fine-Tuning (LoRA / QLoRA)",
      "Prompt Engineering", "AI Agents & MCP", "Computer Vision", "NLP",
      "Diffusion Models", "scikit-learn",
    ],
  },
  {
    icon: "🗄️",
    title: "Data & Databases",
    skills: [
      "PostgreSQL", "MongoDB", "Redis", "MySQL", "Elasticsearch",
      "Vector DBs (Pinecone / Weaviate / pgvector)", "Apache Kafka",
      "Apache Spark", "Pandas / NumPy", "ETL Pipelines", "Data Modeling",
    ],
  },
  {
    icon: "☁️",
    title: "Cloud & MLOps",
    skills: [
      "AWS (EC2 / S3 / Lambda / SageMaker)", "Google Cloud (Vertex AI)",
      "Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions CI/CD",
      "Vercel", "MLflow", "Weights & Biases", "Model Serving (Triton / vLLM)",
      "Monitoring (Grafana / Prometheus)",
    ],
  },
  {
    icon: "🛠️",
    title: "Automation, Tools & Practices",
    skills: [
      "Workflow Automation (n8n / Zapier / Make)", "Web Scraping",
      "Cron & Task Queues", "Git / GitHub", "Linux / Bash",
      "Jest / Playwright", "Pytest", "TDD", "System Design",
      "Agile / Scrum", "Code Review", "Figma", "Jira", "Mentorship",
    ],
  },
];

const CORE_BARS: { name: string; level: number }[] = [
  { name: "React / Next.js", level: 96 },
  { name: "Node.js", level: 94 },
  { name: "Laravel / PHP", level: 92 },
  { name: "Python", level: 93 },
  { name: "AI Integrations (LLMs / RAG / Agents)", level: 91 },
  { name: "Workflow Automation", level: 90 },
  { name: "AWS / GCP Cloud", level: 87 },
  { name: "Docker / Kubernetes", level: 85 },
];

type Site = { name: string; url: string; domain: string };

type SiteCategory = {
  title: string;
  icon: string;
  c1: string;
  c2: string;
  sites: Site[];
};

const SITE_CATEGORIES: SiteCategory[] = [
  {
    title: "AI SaaS Platform",
    icon: "🚀",
    c1: "#f0c05a",
    c2: "#b8860b",
    sites: [
      { name: "Nexty", url: "https://demo.nexty.dev/", domain: "demo.nexty.dev" },
      { name: "AnotherWrapper", url: "https://anotherwrapper.com/", domain: "anotherwrapper.com" },
      { name: "FastSaaS", url: "https://www.fast-saas.com/", domain: "fast-saas.com" },
    ],
  },
  {
    title: "AI Chat / Knowledge Base",
    icon: "🧠",
    c1: "#4f7cff",
    c2: "#2a4fd0",
    sites: [
      { name: "Elium", url: "https://elium.com/", domain: "elium.com" },
      { name: "FuseBase", url: "https://thefusebase.com/", domain: "thefusebase.com" },
    ],
  },
  {
    title: "Business Automation",
    icon: "⚡",
    c1: "#4dd6ff",
    c2: "#1898c9",
    sites: [
      { name: "Stepper", url: "https://stepper.io/", domain: "stepper.io" },
      { name: "Flow-Like", url: "https://flow-like.com/", domain: "flow-like.com" },
      { name: "Buda.im", url: "https://buda.im/", domain: "buda.im" },
      { name: "Fast.io", url: "https://fast.io/", domain: "fast.io" },
    ],
  },
  {
    title: "Booking / Reservation",
    icon: "📅",
    c1: "#ff9d5c",
    c2: "#e2691f",
    sites: [
      { name: "Bookitit", url: "https://www.bookitit.com/", domain: "bookitit.com" },
      { name: "ScheduleCtrl", url: "https://schedulectrl.com/", domain: "schedulectrl.com" },
    ],
  },
  {
    title: "E-commerce",
    icon: "🛍️",
    c1: "#ff7ab8",
    c2: "#d4468a",
    sites: [
      { name: "House of Blanks", url: "https://www.houseofblanks.com/", domain: "houseofblanks.com" },
      { name: "Black Ember", url: "https://blackember.com/", domain: "blackember.com" },
      { name: "Phème Paris", url: "https://pheme-paris.com/", domain: "pheme-paris.com" },
      { name: "LAK Gallery", url: "https://www.lakgallery.com/", domain: "lakgallery.com" },
    ],
  },
  {
    title: "Analytics Dashboard",
    icon: "📊",
    c1: "#2dd4bf",
    c2: "#0f9e8c",
    sites: [
      { name: "SimpleKPI", url: "https://www.simplekpi.com/", domain: "simplekpi.com" },
    ],
  },
  {
    title: "Corporate Website",
    icon: "🏛️",
    c1: "#cbd5e1",
    c2: "#8494ab",
    sites: [
      { name: "Rezo Zero", url: "https://www.rezo-zero.com/", domain: "rezo-zero.com" },
      { name: "Starcloud", url: "https://www.starcloud.com/", domain: "starcloud.com" },
      { name: "Makers Den", url: "https://makersden.io/", domain: "makersden.io" },
    ],
  },
];

const TOTAL_SITES = SITE_CATEGORIES.reduce((n, c) => n + c.sites.length, 0);

type Review = {
  name: string;
  role: string;
  rating: number;
  text: string;
  avatarId: number;
};

/* Avatar photos served by pravatar.cc (https://i.pravatar.cc/150?img=N, N = 1-70) */
const REVIEWS: Review[] = [
  {
    name: "Sarah Mitchell",
    role: "Founder, Nexty SaaS",
    rating: 5,
    text: "Yuco rebuilt our entire platform from the ground up and integrated AI features we didn't think were possible on our timeline. Communication was excellent throughout and the code quality is outstanding.",
    avatarId: 47,
  },
  {
    name: "David Chen",
    role: "CTO, FuseBase",
    rating: 5,
    text: "One of the best full-stack engineers we've worked with. He owns problems end-to-end — frontend, backend, infra — and always ships on time with clean, maintainable code.",
    avatarId: 12,
  },
  {
    name: "Amelia Rousseau",
    role: "Product Lead, Elium",
    rating: 5,
    text: "The RAG pipeline Yuco built for our knowledge base cut support response times dramatically. Deep AI expertise combined with strong product sense — rare combination.",
    avatarId: 44,
  },
  {
    name: "Marcus Webb",
    role: "CEO, Stepper.io",
    rating: 5,
    text: "Automated three of our most painful manual workflows in under two weeks. ROI was immediate. Yuco clearly understands business impact, not just code.",
    avatarId: 13,
  },
  {
    name: "Priya Anand",
    role: "Founder, Black Ember",
    rating: 4,
    text: "Great collaborator, very responsive and detail-oriented on the e-commerce build. A couple of minor revisions were needed but he handled feedback fast and professionally.",
    avatarId: 29,
  },
  {
    name: "Lucas Ferreira",
    role: "Head of Eng, Fast.io",
    rating: 5,
    text: "Solid architecture decisions from day one. The Kubernetes setup and CI/CD pipeline he put together have scaled effortlessly as our traffic grew 10x.",
    avatarId: 14,
  },
  {
    name: "Nina Kowalski",
    role: "Operations Director, Bookitit",
    rating: 5,
    text: "Yuco automated our entire booking and reminder system. What used to take our team hours every day now runs itself. Couldn't be happier with the result.",
    avatarId: 45,
  },
  {
    name: "James O'Connor",
    role: "Founder, SimpleKPI",
    rating: 5,
    text: "Exceptional analytics dashboard work — fast, accurate and beautifully designed. Yuco also proactively suggested improvements we hadn't even thought of.",
    avatarId: 15,
  },
  {
    name: "Elena Vasquez",
    role: "Marketing Director, LAK Gallery",
    rating: 4,
    text: "Delivered a gorgeous storefront that matches our brand perfectly. Turnaround was quick and he was patient with our many design change requests.",
    avatarId: 48,
  },
  {
    name: "Tom Richardson",
    role: "VP Engineering, Makers Den",
    rating: 5,
    text: "We brought Yuco in to modernize legacy infrastructure and integrate LLM agents. The migration was seamless with zero downtime — genuinely impressive work.",
    avatarId: 18,
  },
  {
    name: "Hana Kobayashi",
    role: "Founder, Starcloud",
    rating: 5,
    text: "Incredibly reliable and communicative. Every milestone was delivered ahead of schedule, and the AI integrations he built are already driving real revenue for us.",
    avatarId: 49,
  },
  {
    name: "Robert Diaz",
    role: "Product Manager, Rezo Zero",
    rating: 5,
    text: "Top-tier full-stack and AI engineering talent. Yuco translated vague requirements into a polished, production-ready product faster than any contractor we've hired before.",
    avatarId: 22,
  },
];

const REVIEWS_PREVIEW_COUNT = 3;
const AVG_RATING = (
  REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length
).toFixed(1);

const STATS = [
  { value: "7+", label: "Years of Experience" },
  { value: "50+", label: "Projects Delivered" },
  { value: "30+", label: "Workflows Automated" },
  { value: "12", label: "Countries — Clients Served" },
];

/* ---------------- Hooks ---------------- */

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const speed = deleting ? 40 : 85;

    const timer = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) {
          setTimeout(() => setDeleting(true), 1600);
        }
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex, words]);

  return text;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "star filled" : "star"}>
          ★
        </span>
      ))}
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function Home() {
  const typed = useTypewriter(ROLES);
  const [scrolled, setScrolled] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* 3D perspective tilt that follows the cursor (applied to all cards) */
  const handleTilt = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 9).toFixed(
      2
    )}deg) rotateY(${(px * 11).toFixed(2)}deg) translateY(-5px)`;
  };
  const resetTilt = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = "";
  };
  const tilt = { onMouseMove: handleTilt, onMouseLeave: resetTilt };

  /* Full 360° Y-axis spin on hover — JS-triggered so the rotation always
     completes even when the card turns edge-on under the cursor. */
  const spinCard = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.classList.add("spinning");
  };
  const endSpin = (e: React.AnimationEvent<HTMLElement>) => {
    e.currentTarget.classList.remove("spinning");
  };

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".reveal");
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      <Background3D />
      <div className="site-content">
      {/* ===== NAV ===== */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <a href="#home" className="nav-logo">
            <img src="/avatar3.jpg" alt="Yuco" />
            <span>
              Yuco<em>.dev</em>
            </span>
          </a>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#reviews">Reviews</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header id="home" className="hero">
        <div className="hero-orb orb-gold" />
        <div className="hero-orb orb-blue" />
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div>
            <div className="hero-badge">
              <span className="pulse-dot" /> Available for global opportunities
            </div>
            <h1>
              Hi, I&apos;m <span className="gradient-text">Yuco</span>.<br />
              I build intelligent products end&#8209;to&#8209;end.
            </h1>
            <div className="hero-role">
              &gt; {typed}
              <span className="cursor">▌</span>
            </div>
            <p className="lead">
              Full-Stack &amp; AI Engineer with 7+ years of experience building
              SaaS platforms, AI-powered applications, automation systems and
              modern web products. I help businesses automate workflows, reduce
              manual work and ship scalable digital solutions with clean UI/UX
              and reliable performance.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">
                View My Work →
              </a>
              <a href="mailto:borisethem@gmail.com" className="btn btn-ghost">
                ✉ Get in Touch
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="avatar3d-wrap">
              <AvatarCoin3D />
              <div className="avatar-chip chip-1">⚡ LLM · RAG · Agents</div>
              <div className="avatar-chip chip-2">☁ SaaS · Automation · Cloud</div>
              <div className="avatar-chip chip-3">⌨ React · Node · Laravel · Python</div>
              <div className="avatar-hint">⟳ drag or click the orb to spin</div>
            </div>
          </div>
        </div>
        <div className="ticker">
          <div className="ticker-track">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </header>

      {/* ===== ABOUT ===== */}
      <section id="about" className="section">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-eyebrow">About Me</div>
            <h2>
              Engineer by craft, <span className="gradient-text">samurai</span> by discipline
            </h2>
          </div>
          <div className="about-grid">
            <div className="about-text reveal">
              <p>
                I&apos;m a <strong>Full-Stack &amp; AI Engineer</strong> with{" "}
                <strong>7+ years of experience</strong> building SaaS platforms,
                AI-powered applications, automation systems and modern web
                products for clients around the world.
              </p>
              <p>
                I specialize in <strong>React, Next.js, Node.js, Laravel,
                Python and AI integrations</strong> — owning the entire
                lifecycle from clean, polished UI/UX to robust APIs and the
                cloud infrastructure that keeps everything fast and reliable
                at scale.
              </p>
              <p>
                My focus is impact: I help businesses{" "}
                <strong>automate workflows and reduce manual work</strong>,
                replacing repetitive processes with intelligent, scalable
                digital solutions that pay for themselves.
              </p>
            </div>
            <div className="stats-grid reveal">
              {STATS.map((s) => (
                <div key={s.label} className="stat-card" {...tilt}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section id="skills" className="section section-alt">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-eyebrow">Arsenal</div>
            <h2>
              Skills &amp; <span className="gradient-text">Technologies</span>
            </h2>
            <p>
              The complete toolkit — every layer of the stack, from neural
              networks to network requests.
            </p>
          </div>
          <div className="skills-grid">
            {SKILL_GROUPS.map((group) => (
              <div key={group.title} className="skill-card reveal" {...tilt}>
                <div className="skill-card-head">
                  <div className="skill-icon">{group.icon}</div>
                  <h3>{group.title}</h3>
                </div>
                <div className="chips">
                  {group.skills.map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="core-stack reveal">
            <h3>Core Proficiency</h3>
            <div className="bars">
              {CORE_BARS.map((b) => (
                <div key={b.name} className="bar-item">
                  <div className="bar-label">
                    <b>{b.name}</b>
                    <span>{b.level}%</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ "--w": `${b.level}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROJECTS / WEBSITES ===== */}
      <section id="projects" className="section">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-eyebrow">Selected Work</div>
            <h2>
              Websites I&apos;ve <span className="gradient-text">Built</span>
            </h2>
            <p>
              {TOTAL_SITES} production websites across {SITE_CATEGORIES.length}{" "}
              domains — click any card to open the live site.
            </p>
          </div>
          {SITE_CATEGORIES.map((cat) => (
            <div key={cat.title} className="site-category reveal">
              <div className="cat-head">
                <span className="cat-icon">{cat.icon}</span>
                <h3>{cat.title}</h3>
                <span className="cat-count" style={{ color: cat.c1, borderColor: `${cat.c1}55` }}>
                  {cat.sites.length} {cat.sites.length === 1 ? "site" : "sites"}
                </span>
              </div>
              <div className="sites-grid">
                {cat.sites.map((site) => (
                  <a
                    key={site.url}
                    className="shot-card"
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={spinCard}
                    onAnimationEnd={endSpin}
                    style={{ "--accent": cat.c1 } as React.CSSProperties}
                  >
                    <SiteShot
                      url={site.url}
                      name={site.name}
                      domain={site.domain}
                      accent={cat.c1}
                      accent2={cat.c2}
                    >
                      <span
                        className="shot-tag"
                        style={{ color: cat.c1, borderColor: `${cat.c1}55` }}
                      >
                        {cat.icon} {cat.title}
                      </span>
                    </SiteShot>
                    <div className="shot-body">
                      <div
                        className="site-favicon"
                        style={{
                          background: `linear-gradient(135deg, ${cat.c1}2e, ${cat.c2}2e)`,
                          border: `1px solid ${cat.c1}44`,
                        }}
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=128`}
                          alt=""
                          loading="lazy"
                        />
                      </div>
                      <div className="site-meta">
                        <h4>{site.name}</h4>
                        <span>{site.domain}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section id="reviews" className="section section-alt">
        <div className="container">
          <div className="section-head reveal">
            <div className="section-eyebrow">Client Feedback</div>
            <h2>
              What Clients <span className="gradient-text">Say</span>
            </h2>
            <div className="reviews-summary">
              <StarRating rating={Math.round(Number(AVG_RATING))} />
              <span className="reviews-summary-text">
                <b>{AVG_RATING}</b> out of 5 — based on {REVIEWS.length} reviews
              </span>
            </div>
          </div>
          <div className="reviews-grid">
            {(showAllReviews ? REVIEWS : REVIEWS.slice(0, REVIEWS_PREVIEW_COUNT)).map(
              (r, i) => (
                <div
                  key={r.name}
                  className={`review-card${i < REVIEWS_PREVIEW_COUNT ? " reveal" : ""}`}
                  {...tilt}
                >
                  <StarRating rating={r.rating} />
                  <p className="review-text">&ldquo;{r.text}&rdquo;</p>
                  <div className="review-author">
                    <img
                      className="review-avatar"
                      src={`https://i.pravatar.cc/150?img=${r.avatarId}`}
                      alt={r.name}
                      loading="lazy"
                      width={44}
                      height={44}
                    />
                    <div className="review-meta">
                      <h4>{r.name}</h4>
                      <span>{r.role}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          {REVIEWS.length > REVIEWS_PREVIEW_COUNT && (
            <div className="reviews-more reveal">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAllReviews((v) => !v)}
              >
                {showAllReviews ? "See Less ↑" : `See More (${REVIEWS.length - REVIEWS_PREVIEW_COUNT} more) ↓`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="section">
        <div className="container">
          <div className="contact-card reveal">
            <div className="section-eyebrow">Let&apos;s Build Together</div>
            <h2>
              Have an ambitious idea?
              <br />
              <span className="gradient-text">Let&apos;s make it intelligent.</span>
            </h2>
            <p>
              Whether it&apos;s a SaaS platform, an AI-powered application or an
              automation system that erases manual work — I&apos;m open to senior
              roles, consulting engagements and collaborations worldwide.
            </p>
            <a href="mailto:borisethem@gmail.com" className="btn btn-primary">
              ✉ borisethem@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container footer-inner">
          <p>© 2026 Yuco — Full-Stack &amp; AI Engineer. Crafted with Next.js.</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
