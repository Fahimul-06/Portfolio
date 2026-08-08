import jsPDF from 'jspdf';
import type {
  AboutInfo,
  Skill,
  Project,
  Experience,
  Education,
  ContactInfo,
  Certificate,
} from './supabase';

export type PortfolioPdfData = {
  about: AboutInfo | null;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  certificates: Certificate[];
  contact: ContactInfo | null;
};

type RGB = [number, number, number];

const sanitize = (value?: string | number | null) => {
  // jsPDF's built-in Helvetica font cannot safely render emojis, surrogate pairs,
  // private-use symbols, or several smart Unicode marks. If those characters are
  // passed directly, the generated resume can show corrupted text such as
  // "Ø=Þ€" before the profile paragraph. Keep PDF text in a safe WinAnsi/Latin
  // range and normalize common punctuation before writing it.
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[\u2022\u25CF\u25E6\u2043]/g, '-')
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\uFE00-\uFE0F]/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[^\n\r\t\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const makeFileName = (name?: string | null) => {
  const safeName = sanitize(name || 'portfolio')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${safeName || 'portfolio'}-cv.pdf`;
};

const toTitleCase = (text: string) =>
  sanitize(text)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const spacedHeading = (title: string) => sanitize(title).toUpperCase().split('').join(' ');

const loadImageAsCircularDataUrl = async (url?: string | null): Promise<string | null> => {
  const imageUrl = sanitize(url);
  if (!imageUrl) return null;

  try {
    const absoluteUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

    const response = await fetch(absoluteUrl, { mode: 'cors', cache: 'force-cache' });
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) return null;

    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.crossOrigin = 'anonymous';
        element.onload = () => resolve(element);
        element.onerror = reject;
        element.src = objectUrl;
      });

      const size = 520;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const dx = (size - drawWidth) / 2;
      const dy = (size - drawHeight) / 2;
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
      ctx.restore();

      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (error) {
    console.warn('Could not add profile image to PDF:', error);
    return null;
  }
};

export async function downloadPortfolioPdf({
  about,
  skills,
  projects,
  experiences,
  education,
  certificates,
  contact,
}: PortfolioPdfData) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const sidebarWidth = 182;
  const leftPadding = 18;
  const rightX = sidebarWidth + 34;
  const rightPadding = 38;
  const rightWidth = pageWidth - rightX - rightPadding;
  const teal: RGB = [96, 125, 126];
  const sidebarGrey: RGB = [218, 218, 218];
  const lightGrey: RGB = [232, 232, 232];
  const body: RGB = [42, 42, 42];
  const muted: RGB = [89, 89, 89];

  const name = sanitize(about?.name) || 'Fahimul Arefin';
  const title = sanitize(about?.title) || 'Software Developer';
  const profileImageDataUrl = await loadImageAsCircularDataUrl(about?.profile_image_url);

  const setFont = (style: 'normal' | 'bold' = 'normal', size = 10, color: RGB = body) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
  };

  const lineHeight = (fontSize: number, multiplier = 1.18) => fontSize * multiplier;

  const drawTemplate = (pageNo: number) => {
    // Keep the grey sidebar on every page for visual continuity, but draw the
    // full CV header (profile image, name, title, and accent bar) only once on
    // page 1. Continuation pages should start cleanly without repeating the
    // name/job-title header.
    pdf.setFillColor(...sidebarGrey);
    pdf.rect(0, 0, sidebarWidth, pageHeight, 'F');

    if (pageNo !== 1) return;

    pdf.setFillColor(...lightGrey);
    pdf.rect(0, 0, sidebarWidth, 112, 'F');

    pdf.setFillColor(...teal);
    pdf.rect(0, 118, pageWidth, 28, 'F');

    const imageSize = 104;
    const cx = sidebarWidth / 2 + 2;
    const cy = 146;
    pdf.setFillColor(255, 255, 255);
    pdf.circle(cx, cy, imageSize / 2 + 11, 'F');
    if (profileImageDataUrl) {
      pdf.addImage(profileImageDataUrl, 'PNG', cx - imageSize / 2, cy - imageSize / 2, imageSize, imageSize);
    } else {
      pdf.setFillColor(245, 245, 245);
      pdf.circle(cx, cy, imageSize / 2, 'F');
      setFont('bold', 35, teal);
      pdf.text(name.charAt(0).toUpperCase(), cx, cy + 12, { align: 'center' });
    }
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(3);
    pdf.circle(cx, cy, imageSize / 2 + 1, 'S');

    setFont('bold', 24, [0, 0, 0]);
    const nameLines = pdf.splitTextToSize(name, rightWidth);
    pdf.text(nameLines.slice(0, 2), rightX + 12, 101);

    setFont('normal', 11, teal);
    const titleLines = pdf.splitTextToSize(title, rightWidth);
    pdf.text(titleLines.slice(0, 1), rightX + 12, 126);
  };

  const addPage = () => {
    pdf.addPage();
    drawTemplate(pdf.getNumberOfPages());
    return { leftY: 40, rightY: 48 };
  };

  drawTemplate(1);
  let leftY = 225;
  let rightY = 198;

  const checkLeft = (needed = 34) => {
    if (leftY + needed <= pageHeight - 30) return;
    const positions = addPage();
    leftY = positions.leftY;
    rightY = positions.rightY;
  };

  const checkRight = (needed = 44) => {
    if (rightY + needed <= pageHeight - 34) return;
    const positions = addPage();
    leftY = positions.leftY;
    rightY = positions.rightY;
  };

  const sidebarHeading = (titleText: string) => {
    checkLeft(38);
    setFont('bold', 13, teal);
    pdf.text(spacedHeading(titleText), leftPadding, leftY);
    leftY += 8;
    pdf.setDrawColor(...teal);
    pdf.setLineWidth(0.7);
    pdf.line(leftPadding, leftY, sidebarWidth - 24, leftY);
    leftY += 16;
  };

  const mainHeading = (titleText: string) => {
    checkRight(42);
    setFont('bold', 13, teal);
    pdf.text(spacedHeading(titleText), rightX, rightY);
    rightY += 8;
    pdf.setDrawColor(155, 164, 164);
    pdf.setLineWidth(0.7);
    pdf.line(rightX, rightY, rightX + Math.min(330, rightWidth), rightY);
    rightY += 16;
  };

  const writeLeft = (text: string, options: { size?: number; bold?: boolean; color?: RGB; bullet?: boolean; maxWidth?: number; gap?: number } = {}) => {
    const clean = sanitize(text);
    if (!clean) return;
    const size = options.size ?? 8.4;
    const maxWidth = options.maxWidth ?? sidebarWidth - leftPadding - 22;
    const x = leftPadding + (options.bullet ? 8 : 0);
    const lines = pdf.splitTextToSize(clean, maxWidth - (options.bullet ? 8 : 0));
    lines.forEach((line: string, index: number) => {
      checkLeft(size + 6);
      setFont(options.bold ? 'bold' : 'normal', size, options.color ?? body);
      if (options.bullet && index === 0) {
        pdf.setFillColor(0, 0, 0);
        pdf.circle(leftPadding + 2, leftY - 2.5, 1.4, 'F');
      }
      pdf.text(line, x, leftY);
      leftY += lineHeight(size, 1.18);
    });
    leftY += options.gap ?? 2;
  };

  const writeRight = (text: string, options: { size?: number; bold?: boolean; color?: RGB; gap?: number; maxWidth?: number } = {}) => {
    const clean = sanitize(text);
    if (!clean) return;
    const size = options.size ?? 9.2;
    const maxWidth = options.maxWidth ?? rightWidth;
    const paragraphs = clean.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lines = pdf.splitTextToSize(paragraph, maxWidth);
      lines.forEach((line: string) => {
        checkRight(size + 7);
        setFont(options.bold ? 'bold' : 'normal', size, options.color ?? body);
        pdf.text(line, rightX, rightY);
        rightY += lineHeight(size, 1.14);
      });
      if (paragraphIndex < paragraphs.length - 1) rightY += 4;
    });
    rightY += options.gap ?? 3;
  };

  const addSidebarContact = () => {
    sidebarHeading('Contact');
    const contactLines = [
      contact?.phone ? `Phone: ${contact.phone}` : '',
      contact?.email ? `Email: ${contact.email}` : '',
      contact?.location ? `Address: ${contact.location}` : '',
      contact?.github_url ? `GitHub: ${contact.github_url.replace(/^https?:\/\//, '')}` : '',
      contact?.linkedin_url ? `LinkedIn: ${contact.linkedin_url.replace(/^https?:\/\//, '')}` : '',
    ].filter(Boolean);
    contactLines.forEach((line) => writeLeft(line, { size: 7.7, gap: 4 }));
    leftY += 7;
  };

  const addSidebarSkills = () => {
    if (!skills.length) return;
    sidebarHeading('Skills');
    Object.entries(groupedSkills).forEach(([category, items]) => {
      const label = toTitleCase(category);
      writeLeft(label, { size: 7.8, bold: true, color: [0, 0, 0], gap: 2 });
      items
        .sort((a, b) => a.display_order - b.display_order)
        .forEach((skill) => writeLeft(skill.name, { size: 7.6, bullet: true, gap: 1 }));
      leftY += 4;
    });
    leftY += 5;
  };

  const addSidebarCertificates = () => {
    if (!certificates.length) return;
    sidebarHeading('Certificates');
    certificates.slice(0, 5).forEach((item) => {
      writeLeft(item.title, { size: 7.6, bullet: true, gap: 1 });
      if (item.issuer) writeLeft(item.issuer, { size: 7.1, color: muted, gap: 2 });
    });
  };

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const key = skill.category || 'other';
    acc[key] = acc[key] || [];
    acc[key].push(skill);
    return acc;
  }, {});

  const addProfile = () => {
    if (!about?.tagline && !about?.bio) return;
    mainHeading('Profile');
    if (about?.tagline) writeRight(about.tagline, { size: 9.2, bold: true, color: [0, 0, 0], gap: 4 });
    if (about?.bio) writeRight(about.bio, { size: 8.9, gap: 3 });
    rightY += 17;
  };

  const addProjects = () => {
    if (!projects.length) return;
    mainHeading('Project Experience');
    projects.slice(0, 6).forEach((project) => {
      writeRight(project.title, { size: 8.8, bold: true, color: [0, 0, 0], gap: 1 });
      if (project.description) writeRight(project.description, { size: 8.3, gap: 1 });
      rightY += 6;
    });
    rightY += 8;
  };

  const addEducationMain = () => {
    if (!education.length) return;
    mainHeading('Education');
    education.slice(0, 5).forEach((item) => {
      writeRight(item.degree, { size: 8.8, bold: true, color: [0, 0, 0], gap: 1 });
      if (item.institution) writeRight(item.institution, { size: 8.2, bold: true, color: body, gap: 1 });
      const meta = [item.period, item.location].filter(Boolean).join(' | ');
      if (meta) writeRight(meta, { size: 7.6, color: muted, gap: 1 });
      if (item.result) writeRight(item.result, { size: 7.9, color: body, gap: 1 });
      if (item.description) writeRight(item.description, { size: 8.1, gap: 4 });
      rightY += 7;
    });
    rightY += 8;
  };

  const addExperienceMain = () => {
    if (!experiences.length) return;
    mainHeading('Professional Experience');
    experiences.slice(0, 4).forEach((item) => {
      const heading = [item.title, item.company].filter(Boolean).join(' - ');
      writeRight(heading, { size: 8.6, bold: true, color: [0, 0, 0], gap: 1 });
      if (item.period) writeRight(item.period, { size: 7.6, color: muted, gap: 1 });
      if (item.description) writeRight(item.description, { size: 8.2, gap: 5 });
    });
  };

  addSidebarContact();
  addSidebarSkills();
  addSidebarCertificates();

  addProfile();
  addProjects();
  addEducationMain();
  addExperienceMain();

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    setFont('normal', 7, muted);
    pdf.text(`${page} / ${totalPages}`, pageWidth - 24, pageHeight - 18, { align: 'right' });
  }

  pdf.save(makeFileName(about?.name));
}
