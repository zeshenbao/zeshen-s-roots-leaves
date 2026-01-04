import jsPDF from 'jspdf';
import { person, education, experiences, volunteerExperiences, projects, publications, languages } from './content';

// PDF configuration
const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const LINE_HEIGHT = 5;
const SECTION_GAP = 8;

interface PDFState {
  doc: jsPDF;
  y: number;
}

function checkPageBreak(state: PDFState, requiredSpace: number = 20): void {
  if (state.y + requiredSpace > PAGE_HEIGHT - MARGIN) {
    state.doc.addPage();
    state.y = MARGIN;
  }
}

function addSectionTitle(state: PDFState, title: string): void {
  checkPageBreak(state, 15);
  state.y += SECTION_GAP;
  state.doc.setFontSize(12);
  state.doc.setFont('helvetica', 'bold');
  state.doc.setTextColor(40, 40, 40);
  state.doc.text(title.toUpperCase(), MARGIN, state.y);
  state.y += 2;
  state.doc.setDrawColor(100, 100, 100);
  state.doc.line(MARGIN, state.y, PAGE_WIDTH - MARGIN, state.y);
  state.y += LINE_HEIGHT + 2;
}

function addText(state: PDFState, text: string, options?: { 
  bold?: boolean; 
  size?: number; 
  color?: [number, number, number];
  maxWidth?: number;
}): void {
  const { bold = false, size = 10, color = [60, 60, 60], maxWidth = CONTENT_WIDTH } = options || {};
  
  state.doc.setFontSize(size);
  state.doc.setFont('helvetica', bold ? 'bold' : 'normal');
  state.doc.setTextColor(...color);
  
  const lines = state.doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    checkPageBreak(state);
    state.doc.text(line, MARGIN, state.y);
    state.y += LINE_HEIGHT;
  }
}

function addExperienceEntry(state: PDFState, entry: {
  title: string;
  organization: string;
  location: string;
  period: string;
  bullets: string[];
  advisors?: string;
}): void {
  checkPageBreak(state, 25);
  
  // Title and period on same line
  state.doc.setFontSize(10);
  state.doc.setFont('helvetica', 'bold');
  state.doc.setTextColor(40, 40, 40);
  state.doc.text(entry.title, MARGIN, state.y);
  
  state.doc.setFont('helvetica', 'normal');
  state.doc.setTextColor(100, 100, 100);
  const periodWidth = state.doc.getTextWidth(entry.period);
  state.doc.text(entry.period, PAGE_WIDTH - MARGIN - periodWidth, state.y);
  state.y += LINE_HEIGHT;
  
  // Organization and location
  state.doc.setFont('helvetica', 'italic');
  state.doc.setTextColor(80, 80, 80);
  state.doc.text(`${entry.organization}, ${entry.location}`, MARGIN, state.y);
  state.y += LINE_HEIGHT;
  
  // Advisors if present
  if (entry.advisors) {
    state.doc.setFont('helvetica', 'normal');
    state.doc.setTextColor(100, 100, 100);
    state.doc.text(`Advisors: ${entry.advisors}`, MARGIN, state.y);
    state.y += LINE_HEIGHT;
  }
  
  // Bullets
  state.doc.setFont('helvetica', 'normal');
  state.doc.setTextColor(60, 60, 60);
  for (const bullet of entry.bullets) {
    const bulletLines = state.doc.splitTextToSize(`• ${bullet}`, CONTENT_WIDTH - 5);
    for (let i = 0; i < bulletLines.length; i++) {
      checkPageBreak(state);
      state.doc.text(bulletLines[i], MARGIN + (i === 0 ? 0 : 3), state.y);
      state.y += LINE_HEIGHT;
    }
  }
  
  state.y += 2;
}

export function generateResumePDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const state: PDFState = { doc, y: MARGIN };
  
  // Header - Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(person.name, MARGIN, state.y);
  state.y += 10;
  
  // Headline
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const headlineClean = person.headline.replace('×', 'x');
  doc.text(headlineClean, MARGIN, state.y);
  state.y += LINE_HEIGHT + 2;
  
  // Contact info
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const contactInfo = `${person.email}  |  ${person.phone}  |  ${person.location}`;
  doc.text(contactInfo, MARGIN, state.y);
  state.y += LINE_HEIGHT + 4;
  
  // Education Section
  addSectionTitle(state, 'Education');
  for (const edu of education) {
    checkPageBreak(state, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(edu.degree, MARGIN, state.y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const periodWidth = doc.getTextWidth(edu.period);
    doc.text(edu.period, PAGE_WIDTH - MARGIN - periodWidth, state.y);
    state.y += LINE_HEIGHT;
    
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text(edu.institution, MARGIN, state.y);
    state.y += LINE_HEIGHT;
    
    if (edu.description) {
      addText(state, edu.description, { size: 9 });
    }
    state.y += 2;
  }
  
  // Experience Section
  addSectionTitle(state, 'Experience');
  for (const exp of experiences) {
    addExperienceEntry(state, exp);
  }
  
  // Volunteer Experience Section
  addSectionTitle(state, 'Volunteer Experience');
  for (const exp of volunteerExperiences) {
    addExperienceEntry(state, exp);
  }
  
  // Projects Section
  addSectionTitle(state, 'Selected Projects');
  for (const project of projects.slice(0, 4)) {
    checkPageBreak(state, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text(project.title, MARGIN, state.y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const dateWidth = doc.getTextWidth(project.date);
    doc.text(project.date, PAGE_WIDTH - MARGIN - dateWidth, state.y);
    state.y += LINE_HEIGHT;
    
    addText(state, project.description, { size: 9 });
    
    // Skills
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Skills: ${project.skills.join(', ')}`, MARGIN, state.y);
    state.y += LINE_HEIGHT + 2;
  }
  
  // Publications Section
  if (publications.length > 0) {
    addSectionTitle(state, 'Publications');
    for (const pub of publications) {
      checkPageBreak(state, 20);
      addText(state, pub.title, { bold: true, size: 10 });
      addText(state, pub.authors, { size: 9, color: [80, 80, 80] });
      addText(state, `${pub.venue} (${pub.year})`, { size: 9, color: [100, 100, 100] });
      state.y += 2;
    }
  }
  
  // Languages Section
  addSectionTitle(state, 'Languages');
  checkPageBreak(state, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const spokenLangs = languages.spoken.map(l => `${l.name} (${l.level})`).join(', ');
  doc.text(`Spoken: ${spokenLangs}`, MARGIN, state.y);
  state.y += LINE_HEIGHT;
  
  const progLangs = languages.programming.map(l => `${l.name} (${l.level})`).join(', ');
  doc.text(`Programming: ${progLangs}`, MARGIN, state.y);
  state.y += LINE_HEIGHT;
  
  // Save the PDF
  const fileName = `${person.name.replace(/\s+/g, '_')}_Resume.pdf`;
  doc.save(fileName);
}
