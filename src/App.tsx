import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { downloadPortfolioPdf } from "./lib/portfolioPdf";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { CustomerLiveCall } from "./components/CustomerLiveCall";
import { VisitorLocationPrompt } from "./components/VisitorLocationPrompt";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { isAdminPath, isLegacyAdminPath } from "./lib/adminPath";
import {
  Menu,
  X,
  Home,
  UserRound,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Code2,
  Server,
  Database,
  Smartphone,
  Send,
  MapPin,
  Phone,
  PhoneCall,
  Download,
  Award,
  Briefcase,
  GraduationCap,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Star,
  Heart,
} from "lucide-react";
import type {
  AboutInfo,
  Skill,
  Project,
  Experience,
  Education,
  ContactInfo,
  Certificate,
} from "./lib/supabase";

type View = "portfolio" | "admin";

function App() {
  const [view, setView] = useState<View>(() =>
    isAdminPath(window.location.pathname) ? "admin" : "portfolio",
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession();
    setIsAdmin(!!data.session);
    setLoading(false);
  };

  if (window.location.pathname.startsWith("/call")) {
    return <DirectCallPage />;
  }

  if (isLegacyAdminPath(window.location.pathname) && !isAdminPath(window.location.pathname)) {
    return <NotFoundPage />;
  }

  const openPortfolio = () => {
    window.history.pushState(null, "", "/");
    setView("portfolio");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 rounded-full animate-spin-slow" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (view === "admin" && !isAdmin) {
    return (
      <>
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={openPortfolio}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
          >
            Back to Portfolio
          </button>
        </div>
        <AdminLogin onLogin={() => setIsAdmin(true)} />
      </>
    );
  }

  if (view === "admin" && isAdmin) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={openPortfolio}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
          >
            View Portfolio
          </button>
        </div>
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </>
    );
  }

  return <Portfolio />;
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 text-center text-gray-100">
      <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-4xl font-black text-white">404</h1>
        <p className="mt-3 text-gray-300">This page is not available.</p>
        <button
          onClick={() => { window.history.pushState(null, '', '/'); window.location.reload(); }}
          className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

function DirectCallPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-gray-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.20),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.16),_transparent_36%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-200">
          <PhoneCall size={18} />
          Direct Live Call Link
        </div>
        <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
          Start a live browser call
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-300 sm:text-lg">
          This secure link was shared by the admin. Tap the button below, allow
          microphone access, and the admin phone/dashboard will ring.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5 text-left text-sm text-gray-300 shadow-2xl">
          <p className="font-semibold text-gray-100">Before you call:</p>
          <p className="mt-2">
            Keep this page open during the call. Use Chrome/Safari/Edge and
            allow microphone permission when asked.
          </p>
        </div>
      </div>
      <VisitorLocationPrompt directCallMode />
      <CustomerLiveCall
        initiallyOpen
        lockedOpen
        hideFloatingButton
        title="Call admin now"
        description="Enter your name and tap Start Live Call. The admin phone/dashboard will ring immediately."
      />
    </div>
  );
}

function getHomeTitles(about?: AboutInfo | null) {
  const titles = (about?.home_titles || [])
    .map((title) => title.trim())
    .filter(Boolean);

  if (titles.length > 0) return titles;
  if (about?.title?.trim()) return [about.title.trim()];
  return ["Software Developer"];
}

function getHomeShortDescription(about?: AboutInfo | null) {
  if (about?.home_short_description?.trim()) {
    return about.home_short_description.trim();
  }
  if (about?.tagline?.trim()) return about.tagline.trim();
  if (about?.bio?.trim()) return about.bio.trim().split(/\n\s*\n/)[0];
  return "I build modern web applications, smart software systems, and clean digital experiences.";
}

function AnimatedHomeTitle({ titles }: { titles: string[] }) {
  const [titleIndex, setTitleIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentTitle = titles[titleIndex] || "Software Developer";
    const typingDelay = isDeleting ? 45 : 85;
    const pauseDelay = isDeleting ? 350 : 1600;

    if (!isDeleting && visibleText === currentTitle) {
      const pause = window.setTimeout(() => setIsDeleting(true), pauseDelay);
      return () => window.clearTimeout(pause);
    }

    if (isDeleting && visibleText === "") {
      const pause = window.setTimeout(() => {
        setIsDeleting(false);
        setTitleIndex((index) => (index + 1) % Math.max(titles.length, 1));
      }, pauseDelay);
      return () => window.clearTimeout(pause);
    }

    const timer = window.setTimeout(() => {
      setVisibleText((text) =>
        isDeleting
          ? currentTitle.slice(0, Math.max(text.length - 1, 0))
          : currentTitle.slice(0, text.length + 1),
      );
    }, typingDelay);

    return () => window.clearTimeout(timer);
  }, [titles, titleIndex, visibleText, isDeleting]);

  useEffect(() => {
    setTitleIndex(0);
    setVisibleText("");
    setIsDeleting(false);
  }, [titles.join("|")]);

  return (
    <span className="inline-flex min-h-[1.25em] items-center">
      <span>{visibleText || "\u00a0"}</span>
      <span className="ml-2 h-[1em] w-[3px] rounded-full bg-cyan-300 animate-pulse" aria-hidden="true" />
    </span>
  );
}

function renderBioParagraphs(bio?: string | null) {
  const fallback =
    "I'm a passionate full-stack developer with expertise in modern web technologies. I love creating elegant solutions to complex problems and building applications that make a difference.";

  const source = bio && bio.trim() ? bio : fallback;

  return source
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="text-gray-400 leading-relaxed text-lg whitespace-pre-line">
        {paragraph}
      </p>
    ));
}


function usePortfolioScrollReveal(triggerKey: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".portfolio-glass-theme section, .portfolio-glass-theme article, .portfolio-glass-theme form, .portfolio-glass-theme .card-hover, .portfolio-glass-theme .glass-reveal-target",
      ),
    );

    revealTargets.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", `${Math.min(index * 35, 260)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    revealTargets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [triggerKey]);
}

function useTactileUiFeedback(activeSection?: string) {
  const lastSectionRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const windowWithAudio = window as Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };
    let audioContext: AudioContext | null = null;
    let lastFeedbackAt = 0;

    const isFeedbackEnabled = () =>
      window.localStorage.getItem("portfolio_tactile_feedback") !== "off";

    const getAudioContext = () => {
      if (!audioContext) {
        const AudioContextClass = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
        if (!AudioContextClass) return null;
        audioContext = new AudioContextClass();
      }
      return audioContext;
    };

    const vibrate = (duration = 10) => {
      if (!isFeedbackEnabled()) return;
      if ("vibrate" in navigator) {
        try {
          navigator.vibrate(duration);
        } catch {
          // Some browsers expose vibrate but block it silently.
        }
      }
    };

    const playStackSound = (frequency = 540, duration = 0.045, gainValue = 0.035) => {
      if (!isFeedbackEnabled()) return;
      try {
        const context = getAudioContext();
        if (!context) return;
        if (context.state === "suspended") void context.resume();

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(80, frequency * 0.72),
          context.currentTime + duration,
        );
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(gainValue, context.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration + 0.01);
      } catch {
        // Audio feedback is optional and browser-dependent.
      }
    };

    const runFeedback = (kind: "tap" | "section" = "tap") => {
      const now = Date.now();
      const minGap = kind === "section" ? 850 : 90;
      if (now - lastFeedbackAt < minGap) return;
      lastFeedbackAt = now;
      vibrate(kind === "section" ? 8 : 12);
      playStackSound(kind === "section" ? 430 : 620, kind === "section" ? 0.038 : 0.05, kind === "section" ? 0.026 : 0.04);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest(
          "button, a, input, textarea, select, label, [role='button'], [data-haptic='true']",
        )
      ) {
        runFeedback("tap");
      }
    };

    const handleSectionStack = () => runFeedback("section");

    window.addEventListener("pointerdown", handlePointerDown, { capture: true });
    window.addEventListener("portfolio:section-stack", handleSectionStack);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true } as EventListenerOptions);
      window.removeEventListener("portfolio:section-stack", handleSectionStack);
      if (audioContext && audioContext.state !== "closed") void audioContext.close();
    };
  }, []);

  useEffect(() => {
    if (!activeSection || lastSectionRef.current === activeSection) return;
    if (lastSectionRef.current) {
      window.dispatchEvent(new Event("portfolio:section-stack"));
    }
    lastSectionRef.current = activeSection;
  }, [activeSection]);
}

function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [about, setAbout] = useState<AboutInfo | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useTactileUiFeedback(activeSection);
  usePortfolioScrollReveal(`${currentPath}-${dataLoading}-${skills.length}-${projects.length}-${education.length}-${experiences.length}-${certificates.length}`);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = [
        "home",
        "about",
        "education",
        "skills",
        "projects",
        "experience",
        "certificates",
        "contact",
      ];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchAllData = async () => {
    const [
      aboutRes,
      skillsRes,
      projectsRes,
      experienceRes,
      educationRes,
      certificatesRes,
      contactRes,
    ] = await Promise.all([
      supabase.from("about_info").select("*").single(),
      supabase
        .from("skills")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("experience")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("education")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("certificates")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase.from("contact_info").select("*").single(),
    ]);

    if (aboutRes.data) setAbout(aboutRes.data);
    if (skillsRes.data) setSkills(skillsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
    if (experienceRes.data) setExperiences(experienceRes.data);
    if (educationRes.data) setEducation(educationRes.data);
    if (certificatesRes.data) setCertificates(certificatesRes.data);
    if (contactRes.data) setContact(contactRes.data);
    setDataLoading(false);
  };


  const navigateToPortfolioSection = (id: string) => {
    if (currentPath.startsWith("/projects/")) {
      window.history.pushState({}, "", `/#${id}`);
      setCurrentPath(window.location.pathname);
      window.setTimeout(() => scrollToSection(id), 50);
      return;
    }
    scrollToSection(id);
  };

  const openProjectPage = (projectId: string) => {
    window.history.pushState({}, "", `/projects/${projectId}`);
    setCurrentPath(window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    const { error } = await supabase.from("messages").insert({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });

    setIsSubmitting(false);

    if (error) {
      console.error("Message insert error:", error);
      setSubmitError(
        error.message || "Failed to send message. Please try again.",
      );
    } else {
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const projectPageMatch = currentPath.match(/^\/projects\/([^/]+)$/);
  const selectedProject = projectPageMatch
    ? projects.find((project) => project.id === projectPageMatch[1]) || null
    : null;

  const handleDownloadPortfolioPdf = async () => {
    await downloadPortfolioPdf({
      about,
      skills,
      projects,
      experiences,
      education,
      certificates,
      contact,
    });
  };

  const homeTitles = getHomeTitles(about);
  const homeShortDescription = getHomeShortDescription(about);

  const skillCategories = [
    { key: "frontend", label: "Frontend", icon: Code2 },
    { key: "backend", label: "Backend", icon: Server },
    { key: "database", label: "Database", icon: Database },
    { key: "mobile", label: "Mobile", icon: Smartphone },
  ];

  const navigationItems = [
    { label: "Home", id: "home", icon: Home },
    { label: "About", id: "about", icon: UserRound },
    { label: "Education", id: "education", icon: GraduationCap },
    { label: "Skills", id: "skills", icon: Code2 },
    { label: "Projects", id: "projects", icon: Briefcase },
    { label: "Experience", id: "experience", icon: Star },
    { label: "Certificates", id: "certificates", icon: Award },
    { label: "Contact", id: "contact", icon: Mail },
  ];

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
          <span className="text-gray-400 animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  if (projectPageMatch) {
    return (
      <ProjectDetailsPage
        project={selectedProject}
        projects={projects}
        about={about}
        contact={contact}
        onBack={() => {
          window.history.pushState({}, "", "/#projects");
          setCurrentPath(window.location.pathname);
          window.setTimeout(() => scrollToSection("projects"), 50);
        }}
        onOpenProject={openProjectPage}
      />
    );
  }

  return (
    <div className="portfolio-glass-theme min-h-screen bg-slate-950 text-gray-100 overflow-x-hidden">
      {/* Floating pill navigation */}
      <nav className="floating-pill-nav fixed left-4 top-4 z-50 hidden lg:block" aria-label="Portfolio navigation">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => navigateToPortfolioSection("home")}
            className="pill-logo group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-cyan-400/25 bg-cyan-400/10 text-sm font-black text-cyan-200 transition-all hover:scale-105 hover:border-cyan-300/70"
            aria-label="Go to home"
          >
            {about?.logo_url ? (
              <img src={about.logo_url} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <span>FA</span>
            )}
          </button>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`pill-nav-button group relative flex h-10 w-10 items-center justify-center rounded-full text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/25"
                    : "text-gray-300 hover:bg-white/10 hover:text-cyan-300"
                }`}
                aria-label={item.label}
                title={item.label}
              >
                <Icon size={18} />
                <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-cyan-100 opacity-0 shadow-xl shadow-slate-950/40 backdrop-blur-xl transition-all duration-200 group-hover:translate-y-1 group-hover:opacity-100">
                  {item.label}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleDownloadPortfolioPdf}
            className="pill-nav-button group relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
            aria-label="Download resume PDF"
            title="Resume PDF"
          >
            <Download size={18} />
            <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-cyan-100 opacity-0 shadow-xl shadow-slate-950/40 backdrop-blur-xl transition-all duration-200 group-hover:translate-y-1 group-hover:opacity-100">
              Resume PDF
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile floating pill navigation */}
      <nav className="fixed left-3 top-3 z-50 lg:hidden" aria-label="Mobile portfolio navigation">
        <div className="rounded-full border border-white/10 bg-slate-950/75 p-1.5 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateToPortfolioSection("home")}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-cyan-400/25 bg-cyan-400/10 text-xs font-black text-cyan-200"
              aria-label="Go to home"
            >
              {about?.logo_url ? (
                <img src={about.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                "FA"
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-200 transition-colors hover:bg-white/10 hover:text-cyan-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-3 w-64 animate-slide-down rounded-3xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                      activeSection === item.id
                        ? "bg-cyan-400 text-slate-950"
                        : "text-gray-300 hover:bg-white/10 hover:text-cyan-300"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                handleDownloadPortfolioPdf();
                setIsMenuOpen(false);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-3 text-sm font-bold text-slate-950"
            >
              <Download size={18} />
              Resume PDF
            </button>
          </div>
        )}
      </nav>

      {/* Home Section */}
      <section
        id="home"
        className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-transparent px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_75%_10%,rgba(45,212,191,0.14),transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.94))]" />
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="glass-reveal-target relative z-10 mx-auto max-w-6xl text-center">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-white/5 px-5 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200 shadow-2xl shadow-cyan-900/10 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
            Portfolio Home
          </div>

          <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl lg:text-8xl">
            {about?.name || "Fahimul Arefin"}
          </h1>

          <div className="mt-6 min-h-[4rem] text-2xl font-extrabold leading-tight text-gradient sm:text-4xl lg:text-5xl">
            <AnimatedHomeTitle titles={homeTitles} />
          </div>

          <p className="mx-auto mt-8 max-w-4xl text-base leading-8 text-slate-300 sm:text-lg lg:text-xl">
            {homeShortDescription}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => scrollToSection("projects")}
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 px-8 py-4 font-bold text-slate-950 shadow-2xl shadow-cyan-900/30 transition-all hover:-translate-y-1 hover:shadow-cyan-400/30"
            >
              View Projects
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/10"
            >
              Contact Me
              <Mail size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-100">About </span>
              <span className="text-gradient">Me</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full animate-scale-up" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Profile Image */}
            <div className="relative order-1 lg:order-none">
              <div className="relative max-w-xs sm:max-w-sm lg:max-w-md mx-auto">
                <img
                  src={
                    about?.profile_image_url ||
                    "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"
                  }
                  alt={about?.name || "Profile"}
                  className="w-full aspect-square object-cover rounded-2xl shadow-2xl border border-slate-700/70 bg-slate-900"
                />
              </div>
            </div>

            {/* About Content */}
            <div className="space-y-6">
              <h3 className="text-2xl lg:text-3xl font-semibold text-gray-100">
                {about?.tagline ||
                  "Passionate about building digital experiences"}
              </h3>

              <div className="space-y-4">
                {renderBioParagraphs(about?.bio)}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  {
                    icon: Award,
                    value: about?.years_experience || 5,
                    label: "Years Experience",
                    color: "from-cyan-500 to-teal-600",
                  },
                  {
                    icon: Briefcase,
                    value: about?.projects_completed || 50,
                    label: "Projects Completed",
                    color: "from-teal-500 to-red-500",
                  },
                  {
                    icon: GraduationCap,
                    value: skills.length,
                    label: "Technologies",
                    color: "from-cyan-400 to-teal-500",
                  },
                  {
                    icon: Code2,
                    value: "10K+",
                    label: "Lines of Code",
                    color: "from-teal-400 to-cyan-500",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="card-hover glass rounded-xl p-5 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl w-fit mb-3 shadow-lg animate-pulse-soft`}
                    >
                      <stat.icon className="text-white" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-gray-100 mb-1">
                      {stat.value}+
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-100">My </span>
              <span className="text-gradient">Education</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full animate-scale-up" />
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Academic background, degrees, training, and learning milestones.
            </p>
          </div>

          {education.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {education.map((item, index) => (
                <div
                  key={item.id}
                  className="card-hover glass rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/20">
                      <GraduationCap className="text-white" size={28} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-sm font-medium">
                          {item.period}
                        </span>
                        {item.result && (
                          <span className="px-3 py-1 rounded-full bg-slate-800/80 text-gray-300 border border-slate-700/60 text-sm">
                            {item.result}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-100 leading-snug">
                        {item.degree}
                      </h3>
                      <p className="mt-2 text-cyan-400 font-medium">
                        {item.institution}
                      </p>
                      {item.location && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={16} />
                          {item.location}
                        </p>
                      )}
                      {item.description && (
                        <p className="mt-4 text-gray-400 leading-relaxed whitespace-pre-line">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-10 text-center text-gray-500">
              Education information will appear here after admin adds records.
            </div>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />

        {/* Floating particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-cyan-500 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-100">Technical </span>
              <span className="text-gradient">Skills</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full animate-scale-up" />
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
              A comprehensive toolkit spanning frontend, backend, mobile
              development, and databases.
            </p>
          </div>

          {/* Skills Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 stagger-children">
            {skillCategories.map((cat) => {
              const Icon = cat.icon;
              const categorySkills = skills.filter(
                (s) => s.category === cat.key,
              );
              return (
                <div
                  key={cat.key}
                  className="card-hover glass rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl animate-pulse-soft">
                      <Icon className="text-cyan-400" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-100">
                      {cat.label}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {categorySkills.map((skill, skillIndex) => (
                      <div key={skill.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{skill.name}</span>
                          <span className="text-cyan-400 font-medium">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full transition-all duration-1000 neon-glow"
                            style={{
                              width: `${skill.level}%`,
                              transitionDelay: `${skillIndex * 0.1}s`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Skill Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            {skills.map((skill, index) => (
              <span
                key={skill.id}
                className="px-4 py-2 glass rounded-full text-sm text-gray-300 hover:text-cyan-400 transition-all duration-300 cursor-default border border-slate-700/50 hover:border-cyan-500/50 hover:scale-105 animate-float"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: `${4 + Math.random() * 2}s`,
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-24 lg:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />

        {/* Background grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-100">Featured </span>
              <span className="text-gradient">Projects</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full animate-scale-up" />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {["all", "fullstack", "frontend", "backend", "mobile"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn-secondary px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === f
                    ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-900 shadow-lg shadow-cyan-500/30"
                    : "glass text-gray-400 border border-slate-700/50 hover:border-cyan-500/50 hover:text-cyan-400"
                }`}
              >
                {f === "all"
                  ? "All Projects"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8 stagger-children">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="card-hover group glass rounded-2xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
              >
                {/* Project Image */}
                <button type="button" onClick={() => openProjectPage(project.id)} className="relative h-56 w-full overflow-hidden text-left">
                  <img
                    src={
                      project.image_url ||
                      "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800"
                    }
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-slate-900/80 backdrop-blur-sm text-sm text-cyan-400 rounded-full border border-cyan-500/30 animate-float">
                      {project.category}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {project.is_featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-900 text-sm font-medium rounded-full flex items-center gap-1">
                        <Star size={14} className="animate-wiggle" />
                        Featured
                      </span>
                    </div>
                  )}
                </button>

                {/* Project Info */}
                <div className="p-6">
                  <button
                    type="button"
                    onClick={() => openProjectPage(project.id)}
                    className="text-left text-xl font-semibold text-gray-100 mb-3 group-hover:text-cyan-400 transition-colors flex items-center gap-2"
                  >
                    {project.title}
                    <ArrowRight
                      size={18}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    />
                  </button>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 text-xs text-gray-300 rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openProjectPage(project.id)}
                      className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-900 text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                    >
                      <ArrowRight size={16} />
                      View Details
                    </button>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary flex items-center gap-2 px-5 py-2.5 border border-slate-600 text-gray-300 text-sm font-medium rounded-xl hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
                      >
                        <ExternalLink size={16} />
                        Live Demo
                      </a>
                    )}
                    {project.github_url && project.github_url_public !== false && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary flex items-center gap-2 px-5 py-2.5 border border-slate-600 text-gray-300 text-sm font-medium rounded-xl hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
                      >
                        <Github size={16} />
                        Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        className="py-24 lg:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-slate-900" />

        {/* Decorative blobs */}
        <div className="absolute top-1/3 left-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-morph" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-morph animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-100">Work </span>
              <span className="text-gradient">Experience</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full animate-scale-up" />
          </div>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-teal-500 to-teal-400 rounded-full shadow-lg shadow-cyan-500/20" />

              {experiences.map((exp, index) => (
                <div
                  key={exp.id}
                  className={`relative flex items-start gap-8 mb-12 animate-fade-in-up ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="hidden md:block flex-1" />

                  {/* Timeline node */}
                  <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-5 h-5 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-full border-4 border-slate-900 shadow-lg shadow-cyan-500/30 animate-pulse-soft" />
                  </div>

                  <div className="ml-12 md:ml-0 md:flex-1">
                    <div
                      className={`card-hover glass rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 ${
                        index % 2 === 0 ? "md:mr-8" : "md:ml-8"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-100">
                          {exp.title}
                        </h3>
                        <span className="px-4 py-1.5 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-400 text-sm rounded-full border border-cyan-500/30">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-cyan-400/80 mb-4 text-lg font-medium">
                        {exp.company}
                      </p>
                      <p className="text-gray-400 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Section */}
      <section
        id="certificates"
        className="py-24 lg:py-32 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />

        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-morph" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-morph animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-100">Professional </span>
              <span className="text-gradient">Certifications</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full animate-scale-up" />
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
              Industry-recognized certifications that validate my expertise and
              commitment to continuous learning.
            </p>
          </div>

          {/* Certificates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="card-hover group glass rounded-2xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
              >
                {/* Certificate Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      certificate.image_url ||
                      "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800"
                    }
                    alt={certificate.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {/* Award Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl shadow-lg">
                      <Award className="text-white" size={24} />
                    </div>
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-cyan-400 transition-colors">
                    {certificate.title}
                  </h3>
                  <p className="text-cyan-400 text-sm font-medium mb-2">
                    {certificate.issuer}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {certificate.issue_date}
                  </p>

                  {certificate.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {certificate.description}
                    </p>
                  )}

                  {/* Credential Info */}
                  <div className="flex flex-wrap items-center gap-2">
                    {certificate.credential_id && (
                      <span className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 text-xs text-gray-400 rounded-lg">
                        ID: {certificate.credential_id}
                      </span>
                    )}
                    {certificate.credential_url && (
                      <a
                        href={certificate.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        Verify
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {certificates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No certificates to display yet.
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />

        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-morph" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl animate-morph animation-delay-1000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-100">Get In </span>
              <span className="text-gradient">Touch</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-teal-600 mx-auto rounded-full animate-scale-up" />
            <p className="text-gray-400 mt-6 max-w-2xl mx-auto">
              Have a project in mind or want to collaborate? I'd love to hear
              from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="stagger-children space-y-6">
              {[
                { icon: Mail, label: "Email", value: contact?.email },
                { icon: MapPin, label: "Location", value: contact?.location },
                { icon: Phone, label: "Phone", value: contact?.phone },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl animate-pulse-soft">
                    <item.icon className="text-cyan-400" size={28} />
                  </div>
                  <div className="card-hover glass rounded-xl p-4 flex-1 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-gray-100 mb-1">
                      {item.label}
                    </h3>
                    <p className="text-gray-400">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                <a
                  href={contact?.github_url || "#"}
                  className="icon-bounce p-4 glass rounded-xl text-gray-400 hover:text-cyan-400 hover:scale-110 transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50"
                >
                  <Github size={28} />
                </a>
                <a
                  href={contact?.linkedin_url || "#"}
                  className="icon-bounce p-4 glass rounded-xl text-gray-400 hover:text-cyan-400 hover:scale-110 transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50"
                >
                  <Linkedin size={28} />
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-8 border border-slate-700/50"
            >
              <div className="space-y-6">
                {[
                  {
                    label: "Name",
                    type: "text",
                    placeholder: "Your name",
                    key: "name",
                  },
                  {
                    label: "Email",
                    type: "email",
                    placeholder: "your@email.com",
                    key: "email",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={5}
                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 resize-none"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} className="group-hover:animate-wiggle" />
                      Send Message
                      <Heart
                        size={16}
                        className="group-hover:animate-pulse-soft text-red-600"
                      />
                    </>
                  )}
                </button>

                {submitError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center animate-pop">
                    Message sent successfully! I'll get back to you soon.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <VisitorLocationPrompt />
      <CustomerLiveCall
        defaultName={formData.name}
        defaultEmail={formData.email}
      />
      <LiveChatWidget />

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-gray-500 text-sm flex items-center gap-2">
                Made with{" "}
                <Heart size={14} className="text-red-500 animate-pulse" /> by{" "}
                {about?.name || "Fahimul Arefin"}
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                { href: contact?.github_url, icon: Github },
                { href: contact?.linkedin_url, icon: Linkedin },
                { href: `mailto:${contact?.email || ""}`, icon: Mail },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href || "#"}
                  className="p-2 text-gray-500 hover:text-cyan-400 transition-all duration-300 hover:scale-110 animate-float"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <item.icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


type ProjectPublicComment = {
  id: string;
  project_id: string;
  project_title?: string;
  name: string;
  comment: string;
  created_at: string;
  updated_at?: string;
};

type ProjectDetailsPageProps = {
  project: Project | null;
  projects: Project[];
  about: AboutInfo | null;
  contact: ContactInfo | null;
  onBack: () => void;
  onOpenProject: (projectId: string) => void;
};

function ProjectDetailsPage({
  project,
  projects,
  about,
  contact,
  onBack,
  onOpenProject,
}: ProjectDetailsPageProps) {
  const gallery = project
    ? Array.from(new Set([project.image_url, ...(project.gallery_urls || [])].filter(Boolean)))
    : [];
  const relatedProjects = project ? projects.filter((item) => item.id !== project.id).slice(0, 3) : [];
  const [comments, setComments] = useState<ProjectPublicComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });

  const loadProjectComments = async (projectId: string) => {
    setCommentsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`);
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload?.message || 'Could not load comments.');
      setComments(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Project comments load error:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (project?.id) {
      loadProjectComments(project.id);
      setCommentError('');
      setCommentSuccess('');
      setCommentForm({ name: '', email: '', comment: '' });
    }
  }, [project?.id]);

  const submitProjectComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project?.id) return;

    setCommentError('');
    setCommentSuccess('');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(commentForm.email.trim());
    if (!emailOk) {
      setCommentError('Please enter a valid email address.');
      return;
    }

    setCommentSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || 'Comment could not be submitted.');

      setComments((current) => [payload, ...current]);
      setCommentForm({ name: '', email: '', comment: '' });
      setCommentSuccess('Comment posted successfully.');
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : 'Comment could not be submitted.');
    } finally {
      setCommentSubmitting(false);
    }
  };


  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 text-gray-100 flex items-center justify-center px-4">
        <div className="max-w-lg text-center glass rounded-3xl border border-slate-700/60 p-8">
          <h1 className="text-3xl font-bold mb-4">Project not found</h1>
          <p className="text-gray-400 mb-6">This project page may have been removed or the link is incorrect.</p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-5 py-3 font-semibold text-slate-950"
          >
            <ArrowLeft size={18} /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-glass-theme min-h-screen bg-slate-950 text-gray-100 overflow-x-hidden">
      <nav className="fixed left-4 top-4 z-50 hidden lg:block" aria-label="Project page navigation">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/75 px-3 py-2 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
          <button
            type="button"
            onClick={onBack}
            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/25 transition-all hover:scale-105"
            aria-label="Back to projects"
            title="Back to Projects"
          >
            <ArrowLeft size={19} />
            <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-cyan-100 opacity-0 shadow-xl shadow-slate-950/40 backdrop-blur-xl transition-all duration-200 group-hover:translate-y-1 group-hover:opacity-100">
              Back to Projects
            </span>
          </button>

          <a
            href="/#home"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-gray-300 transition-all hover:bg-white/10 hover:text-cyan-300"
            aria-label="Home"
            title="Home"
          >
            <Home size={18} />
            <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-cyan-100 opacity-0 shadow-xl shadow-slate-950/40 backdrop-blur-xl transition-all duration-200 group-hover:translate-y-1 group-hover:opacity-100">
              Home
            </span>
          </a>

          <a
            href="/#contact"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-gray-300 transition-all hover:bg-white/10 hover:text-cyan-300"
            aria-label="Contact"
            title="Contact"
          >
            <Mail size={18} />
            <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.65rem)] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-cyan-100 opacity-0 shadow-xl shadow-slate-950/40 backdrop-blur-xl transition-all duration-200 group-hover:translate-y-1 group-hover:opacity-100">
              Contact
            </span>
          </a>
        </div>
      </nav>

      <nav className="fixed left-3 top-3 z-50 lg:hidden" aria-label="Mobile project page navigation">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/75 p-1.5 shadow-2xl shadow-cyan-950/30 backdrop-blur-2xl">
          <button type="button" onClick={onBack} className="flex h-10 items-center gap-2 rounded-full bg-cyan-400 px-4 text-sm font-bold text-slate-950">
            <ArrowLeft size={18} /> Projects
          </button>
          <a href="/#home" className="flex h-10 w-10 items-center justify-center rounded-full text-gray-200 hover:bg-white/10 hover:text-cyan-300" aria-label="Home">
            <Home size={18} />
          </a>
        </div>
      </nav>

      <main className="pt-16 lg:pt-10">
        <section className="relative overflow-hidden pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.14),_transparent_32%)]" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                  <Briefcase size={16} /> {project.category}
                </div>
                <h1 className="text-4xl font-black leading-tight text-gray-100 sm:text-5xl lg:text-6xl">
                  {project.title}
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-gray-300">
                  {project.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span key={tech} className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-5 py-3 font-semibold text-slate-950 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                      <ExternalLink size={18} /> Live Demo
                    </a>
                  )}
                  {project.github_url && project.github_url_public !== false && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-3 font-semibold text-gray-300 hover:border-cyan-500 hover:text-cyan-400 transition-all"
                    >
                      <Github size={18} /> Source Code
                    </a>
                  )}
                </div>
              </div>

              <div className="glass overflow-hidden rounded-3xl border border-slate-700/60 shadow-2xl shadow-cyan-950/30">
                <img
                  src={project.image_url || gallery[0] || "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1200"}
                  alt={project.title}
                  className="h-72 w-full object-cover sm:h-96 lg:h-[480px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_0.15fr] lg:px-8">
            <div className="glass rounded-3xl border border-slate-700/60 p-6 sm:p-8">
              <h2 className="mb-6 text-2xl font-bold text-gray-100">Project Details</h2>
              <div className="space-y-5 text-gray-300 leading-relaxed">
                {(project.detailed_description || project.description)
                  .split(/\n\s*\n|\n/)
                  .map((paragraph) => paragraph.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </div>

            <div className="glass rounded-3xl border border-slate-700/60 p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-100">Summary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="text-cyan-300">{project.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Featured</p>
                  <p className="text-gray-300">{project.is_featured ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Gallery</p>
                  <p className="text-gray-300">{gallery.length} photo{gallery.length === 1 ? "" : "s"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-100">Project Gallery</h2>
                  <p className="mt-2 text-gray-400">All screenshots and photos added from the admin dashboard.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((url, index) => (
                  <a
                    key={`${url}-${index}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-lg shadow-slate-950/40 transition-all hover:-translate-y-1 hover:border-cyan-500/50"
                  >
                    <img src={url} alt={`${project.title} screenshot ${index + 1}`} className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="glass rounded-3xl border border-slate-700/60 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-100">Comment on this project</h2>
                <p className="mt-2 text-sm text-gray-400">Use a valid email address to post your comment. Your email stays private.</p>

                <form onSubmit={submitProjectComment} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">Name</label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        value={commentForm.name}
                        onChange={(e) => setCommentForm((current) => ({ ...current, name: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-gray-100 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">Valid email</label>
                      <input
                        type="email"
                        required
                        maxLength={160}
                        value={commentForm.email}
                        onChange={(e) => setCommentForm((current) => ({ ...current, email: e.target.value }))}
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-gray-100 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Comment</label>
                    <textarea
                      required
                      minLength={3}
                      maxLength={1500}
                      rows={5}
                      value={commentForm.comment}
                      onChange={(e) => setCommentForm((current) => ({ ...current, comment: e.target.value }))}
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-gray-100 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Write your comment about this project..."
                    />
                    <p className="mt-1 text-right text-xs text-gray-500">{commentForm.comment.length}/1500</p>
                  </div>

                  {commentError && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{commentError}</p>}
                  {commentSuccess && <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{commentSuccess}</p>}

                  <button
                    type="submit"
                    disabled={commentSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 px-5 py-3 font-semibold text-slate-950 transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {commentSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {commentSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              </div>

              <div className="glass rounded-3xl border border-slate-700/60 p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100">Project Comments</h2>
                    <p className="mt-1 text-sm text-gray-400">{comments.length} comment{comments.length === 1 ? '' : 's'}</p>
                  </div>
                </div>

                {commentsLoading ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 size={20} className="animate-spin text-cyan-400" /> Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 text-center text-gray-400">
                    No comments yet. Be the first to comment on this project.
                  </div>
                ) : (
                  <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">
                    {comments.map((item) => (
                      <article key={item.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/75 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-100">{item.name}</h3>
                            <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{item.comment}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {relatedProjects.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-8 text-3xl font-bold text-gray-100">More Projects</h2>
              <div className="grid gap-5 md:grid-cols-3">
                {relatedProjects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenProject(item.id)}
                    className="group overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 text-left transition-all hover:border-cyan-500/50"
                  >
                    <img src={item.image_url || "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800"} alt={item.title} className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-100 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-400">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <VisitorLocationPrompt />
      <CustomerLiveCall />
      <LiveChatWidget />

      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-gray-500 sm:px-6 md:flex-row lg:px-8">
          <p>Made with <Heart size={14} className="inline text-red-500" /> by {about?.name || "Portfolio"}</p>
          <div className="flex items-center gap-4">
            {contact?.github_url && <a href={contact.github_url} className="hover:text-cyan-400"><Github size={20} /></a>}
            {contact?.linkedin_url && <a href={contact.linkedin_url} className="hover:text-cyan-400"><Linkedin size={20} /></a>}
            {contact?.email && <a href={`mailto:${contact.email}`} className="hover:text-cyan-400"><Mail size={20} /></a>}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
