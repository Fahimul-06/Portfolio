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

const sanitize = (value?: string | number | null) =>
  String(value ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022]/g, '-')
    .replace(/\s+\n/g, '\n')
    .trim();

const makeFileName = (name?: string | null) => {
  const safeName = sanitize(name || 'portfolio')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${safeName || 'portfolio'}-portfolio.pdf`;
};

export function downloadPortfolioPdf({
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
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = 52;

  const checkPage = (needed = 48) => {
    if (y + needed <= pageHeight - margin) return;
    pdf.addPage();
    y = margin;
  };

  const addWrappedText = (
    text: string,
    options: { fontSize?: number; color?: [number, number, number]; lineGap?: number; indent?: number } = {},
  ) => {
    const fontSize = options.fontSize ?? 10;
    const lineGap = options.lineGap ?? 5;
    const indent = options.indent ?? 0;
    const color = options.color ?? [55, 65, 81];
    const cleanText = sanitize(text);
    if (!cleanText) return;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);

    const paragraphs = cleanText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lines = pdf.splitTextToSize(paragraph, contentWidth - indent);
      lines.forEach((line: string) => {
        checkPage(fontSize + lineGap);
        pdf.text(line, margin + indent, y);
        y += fontSize + lineGap;
      });
      if (paragraphIndex < paragraphs.length - 1) y += 5;
    });
  };

  const addSectionTitle = (title: string) => {
    checkPage(48);
    y += y > 64 ? 18 : 0;
    pdf.setDrawColor(6, 182, 212);
    pdf.setLineWidth(1.4);
    pdf.line(margin, y, margin + 34, y);
    y += 18;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.text(title.toUpperCase(), margin, y);
    y += 18;
  };

  const addItemHeading = (text: string, meta?: string) => {
    checkPage(42);
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(17, 24, 39);
    pdf.text(sanitize(text), margin, y);
    if (meta) {
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      const metaText = pdf.splitTextToSize(sanitize(meta), contentWidth * 0.38);
      pdf.text(metaText, pageWidth - margin - contentWidth * 0.38, y, { align: 'left' });
    }
    y += 16;
  };

  const addBullet = (text: string) => {
    checkPage(20);
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(55, 65, 81);
    const lines = pdf.splitTextToSize(sanitize(text), contentWidth - 18);
    pdf.text('-', margin, y);
    pdf.text(lines, margin + 18, y);
    y += lines.length * 14 + 4;
  };

  const name = sanitize(about?.name) || 'Portfolio';
  const title = sanitize(about?.title);

  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 126, 'F');
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text(name, margin, 62);
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(165, 243, 252);
  pdf.text(title || 'Portfolio', margin, 84);
  pdf.setFontSize(9);
  pdf.setTextColor(203, 213, 225);
  pdf.text(`Generated from portfolio website - ${new Date().toLocaleDateString()}`, margin, 106);
  y = 152;

  if (about?.tagline || about?.bio) {
    addSectionTitle('Profile');
    if (about?.tagline) addWrappedText(about.tagline, { fontSize: 11, color: [17, 24, 39] });
    if (about?.bio) addWrappedText(about.bio, { fontSize: 10 });
  }

  if (contact) {
    addSectionTitle('Contact');
    [
      contact.email ? `Email: ${contact.email}` : '',
      contact.phone ? `Phone: ${contact.phone}` : '',
      contact.location ? `Location: ${contact.location}` : '',
      contact.linkedin_url ? `LinkedIn: ${contact.linkedin_url}` : '',
      contact.github_url ? `GitHub: ${contact.github_url}` : '',
    ]
      .filter(Boolean)
      .forEach(addBullet);
  }

  if (education.length) {
    addSectionTitle('Education');
    education.forEach((item) => {
      addItemHeading(item.degree || 'Education', [item.period, item.location].filter(Boolean).join(' | '));
      if (item.institution) addWrappedText(item.institution, { fontSize: 10, color: [17, 24, 39] });
      if (item.result) addWrappedText(`Result: ${item.result}`, { fontSize: 10 });
      if (item.description) addWrappedText(item.description, { fontSize: 10 });
      y += 6;
    });
  }

  if (skills.length) {
    addSectionTitle('Skills');
    const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      const key = skill.category || 'other';
      acc[key] = acc[key] || [];
      acc[key].push(skill);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([category, items]) => {
      addItemHeading(category.charAt(0).toUpperCase() + category.slice(1));
      addWrappedText(items.map((skill) => `${skill.name} (${skill.level}%)`).join(', '), { fontSize: 10 });
      y += 4;
    });
  }

  if (projects.length) {
    addSectionTitle('Projects');
    projects.forEach((project) => {
      addItemHeading(project.title, project.category);
      if (project.description) addWrappedText(project.description, { fontSize: 10 });
      if (project.detailed_description) addWrappedText(project.detailed_description, { fontSize: 10 });
      if (project.tech?.length) addWrappedText(`Technologies: ${project.tech.join(', ')}`, { fontSize: 9 });
      if (project.live_url) addWrappedText(`Live: ${project.live_url}`, { fontSize: 9 });
      if (project.github_url && project.github_url_public) addWrappedText(`Code: ${project.github_url}`, { fontSize: 9 });
      y += 8;
    });
  }

  if (experiences.length) {
    addSectionTitle('Experience');
    experiences.forEach((item) => {
      addItemHeading(item.title, item.period);
      if (item.company) addWrappedText(item.company, { fontSize: 10, color: [17, 24, 39] });
      if (item.description) addWrappedText(item.description, { fontSize: 10 });
      y += 6;
    });
  }

  if (certificates.length) {
    addSectionTitle('Certificates');
    certificates.forEach((item) => {
      addItemHeading(item.title, item.issue_date);
      if (item.issuer) addWrappedText(item.issuer, { fontSize: 10, color: [17, 24, 39] });
      if (item.credential_id) addWrappedText(`Credential ID: ${item.credential_id}`, { fontSize: 9 });
      if (item.credential_url) addWrappedText(`Credential URL: ${item.credential_url}`, { fontSize: 9 });
      if (item.description) addWrappedText(item.description, { fontSize: 10 });
      y += 6;
    });
  }

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${page} / ${totalPages}`, pageWidth - margin, pageHeight - 24, { align: 'right' });
  }

  pdf.save(makeFileName(about?.name));
}
