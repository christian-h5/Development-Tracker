import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF interface for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Helper functions for formatting
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

interface ScenarioData {
  label: string;
  salesPrice: number;
  salesCosts: number;
  totalCosts: number;
  netProfit: number;
  margin: number;
  profitPerSqFt: number;
  roi: number;
}

interface CostBreakdown {
  hardCosts?: number;
  softCosts?: number;
  landCosts?: number;
  contingencyCosts?: number;
  constructionFinancing?: number;
  useConstructionFinancing?: boolean;
}

interface PDFReportOptions {
  projectName?: string;
  unitTypeName?: string;
  squareFootage?: number;
  scenarios: ScenarioData[];
  analysisDate?: Date;
  costBreakdown?: CostBreakdown;
}

export function generatePDFReport(options: PDFReportOptions): void {
  generateHTMLReport(options);
}

function generatePDFReportOriginal(options: PDFReportOptions): void {
  const {
    projectName = "Unit Profitability Analysis",
    unitTypeName = "Unit Type",
    squareFootage = 0,
    scenarios,
    analysisDate = new Date(),
    costBreakdown = {}
  } = options;

  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Set fonts and colors
  const primaryColor = [41, 128, 185]; // Blue
  const textColor = [44, 62, 80]; // Dark gray
  const headerColor = [52, 73, 94]; // Darker gray

  // Title
  doc.setFontSize(24);
  doc.setTextColor(...headerColor);
  doc.text(projectName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(16);
  doc.setTextColor(...textColor);
  doc.text(`${unitTypeName} - Profitability Analysis Report`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.text(`Generated: ${analysisDate.toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Executive Summary
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text('Executive Summary', 20, yPosition);
  yPosition += 15;

  const baseScenario = scenarios.find(s => s.label === 'Base Case') || scenarios[0];
  if (baseScenario) {
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    
    const summaryLines = [
      `Unit Type: ${unitTypeName} (${squareFootage} sq ft)`,
      `Base Case Sales Price: ${formatCurrency(baseScenario.salesPrice)}`,
      `Base Case Net Profit: ${formatCurrency(baseScenario.netProfit)}`,
      `Base Case Margin: ${formatPercent(baseScenario.margin)}`,
      `Base Case ROI: ${formatPercent(baseScenario.roi)}`,
      `Profit per Sq Ft: ${formatCurrency(baseScenario.profitPerSqFt)}`
    ];

    summaryLines.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 8;
    });
  }

  yPosition += 10;

  // Executive Summary Table
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Scenario Analysis Overview', 20, yPosition);
  yPosition += 10;

  const executiveSummaryData = scenarios.map(scenario => [
    scenario.label,
    formatCurrency(scenario.salesPrice),
    formatCurrency(scenario.totalCosts),
    formatCurrency(scenario.netProfit),
    formatPercent(scenario.margin),
    formatPercent(scenario.roi),
    formatCurrency(scenario.profitPerSqFt)
  ]);

  doc.autoTable({
    startY: yPosition,
    head: [['Scenario', 'Sales Price', 'Total Costs', 'Net Profit', 'Margin %', 'ROI %', 'Profit/Sq Ft']],
    body: executiveSummaryData,
    theme: 'grid',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [200, 200, 200]
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10, cellPadding: 4 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  // Detailed Cost Analysis
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Detailed Cost Analysis (Per Unit)', 20, yPosition);
  yPosition += 10;

  const detailedCostData = scenarios.map(scenario => {
    const hardCosts = costBreakdown.hardCosts || 0;
    const softCosts = costBreakdown.softCosts || 0;
    const landCosts = costBreakdown.landCosts || 0;
    const constructionFinancing = (costBreakdown.useConstructionFinancing && costBreakdown.constructionFinancing) || 0;
    
    return [
      scenario.label,
      formatCurrency(scenario.salesPrice),
      formatCurrency(hardCosts),
      formatCurrency(softCosts),
      formatCurrency(landCosts),
      formatCurrency(scenario.salesCosts),
      formatCurrency(constructionFinancing),
      formatCurrency(scenario.netProfit)
    ];
  });

  doc.autoTable({
    startY: yPosition,
    head: [['Scenario', 'Sales Price', 'Hard Costs', 'Soft Costs', 'Land Costs', 'Sales Costs', 'Financing', 'Net Profit']],
    body: detailedCostData,
    theme: 'grid',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0]
    },
    bodyStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [200, 200, 200]
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: 20, right: 20 },
    styles: { fontSize: 9, cellPadding: 3 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Check if we need a new page for risk analysis
  if (yPosition > pageHeight - 100) {
    doc.addPage();
    yPosition = 20;
  }

  // Risk Analysis
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('Risk Analysis', 20, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setTextColor(...textColor);

  // Calculate risk metrics
  const margins = scenarios.map(s => s.margin);
  const rois = scenarios.map(s => s.roi);
  const profits = scenarios.map(s => s.netProfit);

  const maxMargin = Math.max(...margins);
  const minMargin = Math.min(...margins);
  const maxROI = Math.max(...rois);
  const minROI = Math.min(...rois);
  const maxProfit = Math.max(...profits);
  const minProfit = Math.min(...profits);

  const riskLines = [
    'PROFITABILITY RANGE:',
    `• Margin Range: ${formatPercent(minMargin)} to ${formatPercent(maxMargin)}`,
    `• ROI Range: ${formatPercent(minROI)} to ${formatPercent(maxROI)}`,
    `• Profit Range: ${formatCurrency(minProfit)} to ${formatCurrency(maxProfit)}`,
    '',
    'RISK ASSESSMENT:',
    `• Best Case Upside: ${formatCurrency(maxProfit - baseScenario.netProfit)} above base case`,
    `• Worst Case Downside: ${formatCurrency(baseScenario.netProfit - minProfit)} below base case`,
    `• Margin Volatility: ${formatPercent(maxMargin - minMargin)} spread`,
    '',
    'KEY RISK FACTORS:',
    '• Sales price sensitivity significantly impacts profitability',
    '• Market conditions and absorption rates affect timeline',
    '• Construction cost inflation risk during development',
    '• Interest rate changes affecting financing costs'
  ];

  riskLines.forEach(line => {
    if (line.startsWith('•')) {
      doc.text(line, 25, yPosition);
    } else if (line === '') {
      yPosition += 4;
      return;
    } else {
      doc.setFont(undefined, 'bold');
      doc.text(line, 20, yPosition);
      doc.setFont(undefined, 'normal');
    }
    yPosition += 8;
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Report generated on ${new Date().toLocaleDateString()} | ${projectName}`, 
    pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${projectName.replace(/\s+/g, '-')}_Analysis_${timestamp}.pdf`;
  doc.save(filename);
}