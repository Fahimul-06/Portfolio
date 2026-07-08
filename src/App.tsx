import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { CustomerLiveCall } from "./components/CustomerLiveCall";
import { VisitorLocationPrompt } from "./components/VisitorLocationPrompt";
import { LiveChatWidget } from "./components/LiveChatWidget";
import {
  Menu,
  X,
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
  HeroMedia,
} from "./lib/supabase";

type View = "portfolio" | "admin";

function App() {
  const [view, setView] = useState<View>(() =>
    window.location.pathname.startsWith("/admin") ? "admin" : "portfolio",
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
            onClick={() => setView("portfolio")}
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
            onClick={() => setView("portfolio")}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
          >
            View Portfolio
          </button>
        </div>
        <AdminDashboard onLogout={() => setIsAdmin(false)} />
      </>
    );
  }

  return <Portfolio onAdminClick={() => setView("admin")} />;
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

function isVideoUrl(url: string) {
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url) ||
    /(youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com)/i.test(url)
  );
}

function getVideoEmbedUrl(url: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url, window.location.origin);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id
        ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1`
        : "";
    }

    if (host.includes("youtube.com")) {
      const id =
        parsed.searchParams.get("v") ||
        parsed.pathname.split("/").filter(Boolean).pop();
      return id
        ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1`
        : "";
    }

    if (host.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id
        ? `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1&playsinline=1`
        : "";
    }

    if (host.includes("drive.google.com")) {
      const match = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
      const id = match?.[1];
      return id ? `https://drive.google.com/file/d/${id}/preview` : "";
    }
  } catch {
    return "";
  }

  return "";
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

function HeroMediaSlide({
  item,
  isActive,
  onEnded,
}: {
  item: HeroMedia;
  isActive: boolean;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldRenderVideo =
    item.media_type === "video" || isVideoUrl(item.media_url);
  const embedUrl = shouldRenderVideo ? getVideoEmbedUrl(item.media_url) : "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive, item.media_url]);

  if (shouldRenderVideo && embedUrl) {
    return (
      <iframe
        src={isActive ? embedUrl : "about:blank"}
        title={item.title || "Hero video"}
        className="h-full w-full border-0 object-cover"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
      />
    );
  }

  if (shouldRenderVideo) {
    return (
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
        muted
        loop
        autoPlay
        playsInline
        preload="metadata"
        controls={false}
        onEnded={onEnded}
      >
        <source src={item.media_url} />
        Your browser does not support this video.
      </video>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <img
        src={item.media_url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
      />
      <img
        src={item.media_url}
        alt={item.title || "Hero media"}
        className="relative z-10 h-full w-full object-contain object-center"
      />
    </div>
  );
}

interface PortfolioProps {
  onAdminClick: () => void;
}

function Portfolio({ onAdminClick }: PortfolioProps) {
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
  const [heroMedia, setHeroMedia] = useState<HeroMedia[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
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
      heroMediaRes,
      skillsRes,
      projectsRes,
      experienceRes,
      educationRes,
      certificatesRes,
      contactRes,
    ] = await Promise.all([
      supabase.from("about_info").select("*").single(),
      supabase
        .from("hero_media")
        .select("*")
        .order("display_order", { ascending: true }),
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
    if (heroMediaRes.data)
      setHeroMedia(
        heroMediaRes.data.filter((item: HeroMedia) => item.is_active),
      );
    if (skillsRes.data) setSkills(skillsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
    if (experienceRes.data) setExperiences(experienceRes.data);
    if (educationRes.data) setEducation(educationRes.data);
    if (certificatesRes.data) setCertificates(certificatesRes.data);
    if (contactRes.data) setContact(contactRes.data);
    setDataLoading(false);
  };

  useEffect(() => {
    if (heroMedia.length <= 1) return;
    const current = heroMedia[activeHeroIndex];
    if (
      current &&
      (current.media_type === "video" || isVideoUrl(current.media_url))
    )
      return;

    const timer = window.setTimeout(() => {
      setActiveHeroIndex((index) => (index + 1) % heroMedia.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [heroMedia, activeHeroIndex]);

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

  const skillCategories = [
    { key: "frontend", label: "Frontend", icon: Code2 },
    { key: "backend", label: "Backend", icon: Server },
    { key: "database", label: "Database", icon: Database },
    { key: "mobile", label: "Mobile", icon: Smartphone },
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

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-slate-900/50 border-b border-slate-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              onClick={() => scrollToSection("home")}
              className="text-xl lg:text-2xl font-bold relative group"
            >
              {about?.logo_url ? (
                <img
                  src={about.logo_url}
                  alt="Logo"
                  className="h-10 lg:h-12 w-auto rounded-lg"
                />
              ) : (
                <span className="text-gradient">FA</span>
              )}
              <span className="absolute -inset-2 bg-cyan-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {[
                "Home",
                "About",
                "Education",
                "Skills",
                "Projects",
                "Experience",
                "Certificates",
                "Contact",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`text-sm font-medium link-underline transition-colors ${
                    activeSection === item.toLowerCase()
                      ? "text-cyan-400"
                      : "text-gray-300 hover:text-cyan-400"
                  }`}
                >
                  {item}
                </button>
              ))}
              <a
                href={about?.resume_url || "#"}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
              >
                <Download size={18} className="animate-bounce-soft" />
                Resume
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 animate-slide-down">
              <div className="px-4 py-4 space-y-2">
                {[
                  "Home",
                  "About",
                  "Education",
                  "Skills",
                  "Projects",
                  "Experience",
                  "Certificates",
                  "Contact",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.toLowerCase()
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-gray-300 hover:bg-slate-800"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative bg-slate-950 px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-28 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="relative h-[260px] overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900 shadow-2xl shadow-cyan-950/30 ring-1 ring-white/10 sm:h-[340px] lg:h-[420px]">
            {heroMedia.length > 0 ? (
              <>
                {heroMedia.map((item, index) => {
                  const isActive = index === activeHeroIndex;
                  return (
                    <div
                      key={item.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    >
                      <HeroMediaSlide
                        item={item}
                        isActive={isActive}
                        onEnded={() =>
                          setActiveHeroIndex(
                            (current) => (current + 1) % heroMedia.length,
                          )
                        }
                      />
                    </div>
                  );
                })}

                <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl bg-gradient-to-t from-slate-950/55 via-transparent to-black/20" />
                <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl border border-white/10" />

                {heroMedia.length > 1 && (
                  <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/40 px-4 py-3 backdrop-blur-md">
                    {heroMedia.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveHeroIndex(index)}
                        aria-label={`Show hero media ${index + 1}`}
                        className={`h-3 rounded-full transition-all ${
                          index === activeHeroIndex
                            ? "w-10 bg-white"
                            : "w-3 bg-white/45 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : about?.hero_background_url ? (
              <div className="relative h-full w-full overflow-hidden bg-slate-950">
                <img
                  src={about.hero_background_url}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                />
                <img
                  src={about.hero_background_url}
                  alt="Hero"
                  className="relative z-10 h-full w-full object-contain object-center"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 text-center">
                <p className="text-lg text-gray-500">No hero media added yet.</p>
              </div>
            )}
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
              <div className="relative max-w-md mx-auto lg:max-w-lg">
                <img
                  src={
                    about?.profile_image_url ||
                    "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"
                  }
                  alt={about?.name || "Profile"}
                  className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
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
                <div className="relative h-56 overflow-hidden">
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
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-3 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                    {project.title}
                    <ArrowRight
                      size={18}
                      className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    />
                  </h3>
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
                  <div className="flex gap-3">
                    <a
                      href={project.live_url || "#"}
                      className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-900 text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                    >
                      <ExternalLink size={16} />
                      Live Demo
                    </a>
                    <a
                      href={project.github_url || "#"}
                      className="btn-secondary flex items-center gap-2 px-5 py-2.5 border border-slate-600 text-gray-300 text-sm font-medium rounded-xl hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
                    >
                      <Github size={16} />
                      Code
                    </a>
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
              <button
                onClick={onAdminClick}
                className="text-xs text-gray-600 hover:text-cyan-400 transition-colors border border-gray-700 hover:border-cyan-500 px-3 py-1 rounded-full"
              >
                Arefin
              </button>
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

export default App;
