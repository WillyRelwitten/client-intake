const { jsPDF } = window.jspdf;
const form = document.getElementById('intakeForm');
const toast = document.getElementById('toast');
const submitBtn = document.getElementById('submitBtn');

function getFormData() {
  const data = {};
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    data[key] = value.trim();
  }
  ['clientType', 'salesTaxApplicable', 'setupFee'].forEach(name => {
    if (!(name in data)) data[name] = '';
  });
  return data;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function val(v) {
  return (v && v.trim()) ? v.trim() : '\u2014';
}

function generatePDF(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageW = 612, marginL = 42, marginR = 42;
  const contentW = pageW - marginL - marginR;
  let y = 0;
  const navy = [15, 45, 90], charcoal = [40, 40, 42], midGray = [100, 100, 105], lightGray = [230, 232, 236], accent = [13, 71, 161];
  function v(str) { return (str && String(str).trim()) ? String(str).trim() : '\u2014'; }
  function drawHLine(yy, color = lightGray, width = 0.6) {
    doc.setDrawColor(...color); doc.setLineWidth(width); doc.line(marginL, yy, pageW - marginR, yy);
  }
  function sectionTitle(title) {
    y += 2;
    doc.setFillColor(...accent); doc.rect(marginL, y - 1, 2.5, 10, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.8); doc.setTextColor(...accent);
    doc.text(title.toUpperCase(), marginL + 8, y + 7);
    y += 12; drawHLine(y, [215, 218, 224], 0.45); y += 7; doc.setTextColor(...charcoal);
  }
  function field(label, value, x, w) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...midGray); doc.text(label, x, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...charcoal);
    const lines = doc.splitTextToSize(v(value), w);
    doc.text(lines, x, y + 10);
    return 10 + (lines.length * 10);
  }
  function twoCol(a, av, b, bv) {
    const gap = 16, colW = (contentW - gap) / 2;
    const h1 = field(a, av, marginL, colW);
    const h2 = field(b, bv, marginL + colW + gap, colW);
    y += Math.max(h1, h2) + 5;
  }
  function fullField(label, value) { y += field(label, value, marginL, contentW) + 5; }
  doc.setFillColor(...navy); doc.rect(0, 0, pageW, 52, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text('Dickens Wealth Management', marginL, 23);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(180, 195, 220);
  doc.text('Accounting  \u00b7  Tax  \u00b7  Consulting', marginL, 36);
  doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
  doc.text('NEW CLIENT INTAKE', pageW - marginR, 23, { align: 'right' });
  doc.setFontSize(7); doc.setTextColor(180, 195, 220);
  doc.text('813.980.6180  \u00b7  dickenswm.com', pageW - marginR, 36, { align: 'right' });
  doc.setFillColor(200, 175, 120); doc.rect(0, 52, pageW, 2.2, 'F');
  y = 66;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...midGray);
  doc.text('Prepared  ' + dateStr, marginL, y);
  doc.text('CONFIDENTIAL', pageW - marginR, y, { align: 'right' });
  y += 10; drawHLine(y, lightGray, 0.6); y += 9;
  sectionTitle('Client Type'); fullField('Type of Client', data.clientType);
  sectionTitle('Company / Entity');
  fullField('Company / Entity Name', data.companyName); fullField('DBA Name', data.dbaName);
  twoCol('EIN #', data.ein, 'State UE #', data.stateUE);
  fullField('Primary Business Address', data.businessAddress);
  twoCol('State of Incorporation', data.stateOfInc, 'Entity Type', data.entityType);
  sectionTitle('Primary Contact');
  fullField('Contact Name', data.contactName);
  twoCol('Phone', data.contactPhone, 'Email', data.contactEmail);
  fullField('Social Security #', data.contactSSN);
  sectionTitle('Tax Returns');
  fullField('Type of Business Return Filed', data.returnType);
  twoCol('Last Year Filed \u2014 Federal', data.lyfFederal, 'Last Year Filed \u2014 State', data.lyfState);
  sectionTitle('Prior Accountant');
  fullField('Accountant Name', data.priorName);
  twoCol('Phone', data.priorPhone, 'Address', data.priorAddress);
  sectionTitle('Financial Snapshot');
  twoCol('Approximate Annual Sales $', data.annualSales, 'Approximate Annual Income', data.annualIncome);
  fullField('Years in Business', data.yearsInBusiness);
  sectionTitle('Sales & Tangible Tax');
  twoCol('Sales Tax Applicable?', data.salesTaxApplicable, 'Sales Tax #', data.salesTaxNumber);
  fullField('Do You File Tangible Tax Returns?', data.tangibleTax);
  fullField('For What Address', data.tangibleAddress);
  sectionTitle('Critical Needs & Notes');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...charcoal);
  const notesLines = doc.splitTextToSize(v(data.notes), contentW);
  const shown = notesLines.slice(0, 4);
  doc.text(shown, marginL, y + 1);
  y += shown.length * 10 + 3;
  if (notesLines.length > 4) {
    doc.setFontSize(6.5); doc.setTextColor(...midGray);
    doc.text('\u2026 (notes truncated to fit one page)', marginL, y); y += 9;
  }
  sectionTitle('Set-Up Fee');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...midGray);
  doc.text('Selected Fee', marginL, y);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...navy);
  doc.text(v(data.setupFee), marginL, y + 12);
  const footerY = 772;
  drawHLine(footerY - 10, lightGray, 0.6);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...midGray);
  doc.text('Dickens Wealth Management  \u00b7  Confidential Client Intake Document', marginL, footerY);
  doc.text('Page 1 of 1', pageW - marginR, footerY, { align: 'right' });
  const safeName = (data.companyName || data.contactName || 'Client').replace(/[^a-z0-9\s\-]/gi, '').trim().replace(/\s+/g, '_').slice(0, 35) || 'Client';
  const filename = 'Client_Intake_' + safeName + '_' + now.toISOString().slice(0, 10) + '.pdf';
  doc.save(filename);
  return filename;
}

function generateExcel(data) {
  const prepared = new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const fields = [
    ['Client Type', 'Type of Client', data.clientType],
    ['Company / Entity', 'Company / Entity Name', data.companyName],
    ['Company / Entity', 'DBA Name', data.dbaName],
    ['Company / Entity', 'EIN #', data.ein],
    ['Company / Entity', 'State UE #', data.stateUE],
    ['Company / Entity', 'Primary Business Address', data.businessAddress],
    ['Company / Entity', 'State of Incorporation', data.stateOfInc],
    ['Company / Entity', 'Entity Type', data.entityType],
    ['Primary Contact', 'Contact Name', data.contactName],
    ['Primary Contact', 'Phone', data.contactPhone],
    ['Primary Contact', 'Email', data.contactEmail],
    ['Primary Contact', 'Social Security #', data.contactSSN],
    ['Tax Returns', 'Type of Business Return Filed', data.returnType],
    ['Tax Returns', 'Last Year Filed \u2014 Federal', data.lyfFederal],
    ['Tax Returns', 'Last Year Filed \u2014 State', data.lyfState],
    ['Prior Accountant', 'Accountant Name', data.priorName],
    ['Prior Accountant', 'Phone', data.priorPhone],
    ['Prior Accountant', 'Address', data.priorAddress],
    ['Financial Snapshot', 'Approximate Annual Sales $', data.annualSales],
    ['Financial Snapshot', 'Approximate Annual Income', data.annualIncome],
    ['Financial Snapshot', 'Years in Business', data.yearsInBusiness],
    ['Sales & Tangible Tax', 'Sales Tax Applicable?', data.salesTaxApplicable],
    ['Sales & Tangible Tax', 'Sales Tax #', data.salesTaxNumber],
    ['Sales & Tangible Tax', 'Do You File Tangible Tax Returns?', data.tangibleTax],
    ['Sales & Tangible Tax', 'For What Address', data.tangibleAddress],
    ['Critical Needs & Notes', 'Notes Assessment', data.notes],
    ['Set-Up Fee', 'Selected Fee', data.setupFee]
  ];
  const detailRows = [['Dickens Wealth Management'], ['New Client Intake \u2014 Confidential'], ['Prepared', prepared], [], ['Section', 'Field', 'Value']];
  fields.forEach(([section, field, value]) => detailRows.push([section, field, val(value)]));
  const detail = XLSX.utils.aoa_to_sheet(detailRows);
  detail['!cols'] = [{ wch: 26 }, { wch: 36 }, { wch: 52 }];
  detail['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }];
  const headers = fields.map((f) => f[1]);
  const values = fields.map((f) => val(f[2]));
  const importSheet = XLSX.utils.aoa_to_sheet([['Dickens Wealth Management \u2014 Client Intake (one row for import)'], [], ['Prepared', prepared], [], headers, values]);
  importSheet['!cols'] = headers.map((h) => ({ wch: Math.min(36, Math.max(16, String(h).length + 2)) }));
  importSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, detail, 'Client Intake');
  XLSX.utils.book_append_sheet(wb, importSheet, 'Import Row');
  const safeName = (data.companyName || data.contactName || 'Client').replace(/[^a-z0-9\s\-]/gi, '').trim().replace(/\s+/g, '_').slice(0, 35) || 'Client';
  const filename = 'Client_Intake_' + safeName + '_' + new Date().toISOString().slice(0, 10) + '.xlsx';
  XLSX.writeFile(wb, filename);
  return filename;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = getFormData();
  if (!Object.values(data).some(v => v && v.length > 0)) {
    showToast('Please fill in at least some fields first');
    return;
  }
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  submitBtn.textContent = 'Generating PDF\u2026';
  setTimeout(() => {
    try {
      const filename = generatePDF(data);
      window._lastData = data;
      document.getElementById('excelPanel').classList.add('show');
      document.getElementById('excelBtn').hidden = false;
      document.getElementById('excelHint').textContent = 'Downloaded ' + filename + '. Convert the same intake into an Excel spreadsheet for the team file.';
      showToast('PDF saved: ' + filename);
    } catch (err) {
      console.error(err);
      showToast('Error generating PDF. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'Generate 1-Page PDF';
    }
  }, 180);
});

document.getElementById('excelBtn').addEventListener('click', () => {
  const data = window._lastData || getFormData();
  try {
    showToast('Excel saved: ' + generateExcel(data));
  } catch (err) {
    console.error(err);
    showToast('Error creating Excel. Please try again.');
  }
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear all fields?')) {
    form.reset();
    window._lastData = null;
    document.getElementById('excelPanel').classList.remove('show');
    document.getElementById('excelBtn').hidden = true;
    showToast('Form cleared');
  }
});
