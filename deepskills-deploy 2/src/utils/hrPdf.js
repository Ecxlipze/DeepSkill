import { jsPDF } from 'jspdf';

const addWrappedText = (pdf, text, x, y, maxWidth, lineHeight = 7) => {
  const lines = pdf.splitTextToSize(text, maxWidth);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const addBulletSection = (pdf, title, bullets, y) => {
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 15, y);
  let nextY = y + 7;
  pdf.setFont('helvetica', 'normal');
  bullets.forEach((bullet) => {
    nextY = addWrappedText(pdf, `• ${bullet}`, 18, nextY, 175);
  });
  return nextY + 4;
};

const maybeAddSignature = (pdf, signature, x, y, width = 48, height = 18) => {
  if (!signature?.signature_data) {
    return y;
  }
  if (signature.signature_type === 'drawn' && signature.signature_data.startsWith('data:image')) {
    pdf.addImage(signature.signature_data, 'PNG', x, y - height + 2, width, height);
    return y;
  }
  pdf.setFont('times', 'italic');
  pdf.text(signature.signature_data, x, y);
  pdf.setFont('helvetica', 'normal');
  return y;
};

export const createAcceptanceLetterPdf = async ({
  teacher,
  jd,
  signature,
  adminNote,
  date
}) => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 18;

  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DeepSkill Institute', 15, y);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  y += 8;
  pdf.text(date, 15, y);
  y += 12;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Letter of Acceptance', 15, y);
  y += 12;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  y = addWrappedText(pdf, `${teacher.full_name || teacher.name}\n${teacher.current_address || teacher.permanent_address || ''}`, 15, y, 90);
  y += 6;
  y = addWrappedText(pdf, `Dear ${teacher.full_name || teacher.name},`, 15, y, 180);
  y += 6;
  y = addWrappedText(
    pdf,
    `We are pleased to inform you that following your application, profile review, and document verification, DeepSkill Institute has decided to offer you the position of ${jd.position_title || jd.positionTitle}.`,
    15,
    y,
    180
  );
  y += 6;
  y = addWrappedText(
    pdf,
    `Your employment will commence on ${teacher.available_to_join || 'the agreed joining date'}. Your monthly compensation will be ${jd.compensation_text || 'as agreed in your Job Description'}. Reporting manager: ${jd.reporting_to || 'Academic Director'}. Working hours: ${jd.working_hours || 'To be shared by administration'}.`,
    15,
    y,
    180
  );

  if (adminNote) {
    y += 8;
    y = addWrappedText(pdf, adminNote, 15, y, 180);
  }

  y += 8;
  y = addWrappedText(pdf, 'We look forward to welcoming you to the DeepSkill family. Please retain this letter for your records.', 15, y, 180);
  y += 14;
  pdf.text('Sincerely,', 15, y);
  y += 8;
  pdf.text('DeepSkill HR Department', 15, y);

  y += 20;
  pdf.line(15, y, 75, y);
  pdf.line(120, y, 180, y);
  pdf.text('Authorized Signatory', 15, y + 6);
  maybeAddSignature(pdf, signature, 120, y - 2);
  pdf.text(`${teacher.full_name || teacher.name} - Teacher`, 120, y + 6);

  return pdf.output('blob');
};

export const createHiringFilePdf = async ({
  teacher,
  documents,
  jd,
  signature,
  adminNote,
  date
}) => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 16;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('DeepSkill Hiring File', 15, y);
  y += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${date}`, 15, y);
  y += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Personal Information', 15, y);
  y += 7;
  pdf.setFont('helvetica', 'normal');
  const profileLines = [
    `Full Name: ${teacher.full_name || teacher.name || '-'}`,
    `Father's Name: ${teacher.father_name || '-'}`,
    `CNIC: ${teacher.cnic || '-'}`,
    `Email: ${teacher.personal_email || teacher.email || '-'}`,
    `Phone: ${teacher.personal_phone || '-'}`,
    `Specialization: ${teacher.specialization || '-'}`,
    `Years Experience: ${teacher.years_experience || '-'}`,
    `Expected Salary: Rs. ${Number(teacher.expected_salary || 0).toLocaleString()}`,
    `Teaching Mode: ${teacher.teaching_mode || '-'}`,
    `Available to Join: ${teacher.available_to_join || '-'}`
  ];
  profileLines.forEach((line) => {
    y = addWrappedText(pdf, line, 15, y, 180, 6);
  });

  y += 4;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Submitted Documents', 15, y);
  y += 7;
  pdf.setFont('helvetica', 'normal');
  documents.forEach((document) => {
    y = addWrappedText(pdf, `• ${document.doc_type}: ${document.file_name || document.link_url || 'Uploaded'}`, 18, y, 175, 6);
  });

  y += 4;
  y = addBulletSection(pdf, 'Responsibilities', jd.responsibilities || [], y);
  y = addBulletSection(pdf, 'Requirements', jd.requirements || [], y);
  y = addBulletSection(pdf, 'What We Offer', jd.what_we_offer || [], y);

  y += 4;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Signature', 15, y);
  y += 10;
  maybeAddSignature(pdf, signature, 15, y);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Signed At: ${signature?.signed_at || date}`, 15, y + 10);

  if (adminNote) {
    y += 22;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Admin Note', 15, y);
    y += 7;
    pdf.setFont('helvetica', 'normal');
    addWrappedText(pdf, adminNote, 15, y, 180);
  }

  return pdf.output('blob');
};
