import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

interface PDFExportOptions {
  projectName?: string;
  unitTypeName?: string;
  squareFootage?: number;
  scenarios: ScenarioData[];
  analysisDate?: Date;
  costBreakdown?: {
    hardCosts?: number;
    softCosts?: number;
    landCosts?: number;
    contingencyCosts?: number;
    constructionFinancing?: number;
    useConstructionFinancing?: boolean;
  };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportSensitivityAnalysisToPDF(options: PDFExportOptions): void {
  const {
    projectName = "Unit Profitability Analysis",
    unitTypeName = "Unit Type",
    squareFootage = 0,
    scenarios,
    analysisDate = new Date()
  } = options;

  // Create new PDF document
  const doc = new jsPDF();
  
  // Set up document styling
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let currentY = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DevTracker Pro', margin, currentY);
  
  currentY += 10;
  doc.setFontSize(16);
  doc.text('Sensitivity Analysis Report', margin, currentY);
  
  currentY += 20;
  
  // Project Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const infoLines = [
    `Project: ${projectName}`,
    `Unit Type: ${unitTypeName}`,
    `Square Footage: ${squareFootage.toLocaleString()} sq ft`,
    `Analysis Date: ${analysisDate.toLocaleDateString()}`,
    `Generated on: ${new Date().toLocaleString()}`
  ];
  
  infoLines.forEach(line => {
    doc.text(line, margin, currentY);
    currentY += 7;
  });
  
  currentY += 10;
  
  // Summary Section with two columns
  if (scenarios.length > 0) {
    const baseCase = scenarios.find(s => s.label === 'Base Case') || scenarios[0];
    const sortedScenarios = [...scenarios].sort((a, b) => a.salesPrice - b.salesPrice);
    const bestCase = sortedScenarios[sortedScenarios.length - 1];
    const worstCase = sortedScenarios[0];
    
    // Two-column layout setup
    const leftColumnX = margin;
    const rightColumnX = pageWidth / 2 + 10;
    const columnWidth = (pageWidth - margin * 2 - 20) / 2;
    
    // Executive Summary Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Executive Summary', margin, currentY);
    currentY += 12;
    
    // Left Column - Base Case
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Base Case', leftColumnX, currentY);
    
    // Right Column - Cost Breakdown
    doc.text('Cost Breakdown', rightColumnX, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Left column content
    const leftLines = [
      `Sales Price: ${formatCurrency(baseCase.salesPrice)}`,
      `Net Profit: ${formatCurrency(baseCase.netProfit)}`,
      `Margin: ${formatPercent(baseCase.margin)}`,
      `ROI: ${formatPercent(baseCase.roi)}`,
      `Profit per Sq Ft: ${formatCurrency(baseCase.profitPerSqFt)}`
    ];
    
    // Right column content
    const rightLines = [
      `Sales Price: ${formatCurrency(baseCase.salesPrice)}`,
      `Sales Costs: ${formatCurrency(baseCase.salesCosts)}`,
      `Development Costs: ${formatCurrency(baseCase.totalCosts)}`,
      `Net Profit: ${formatCurrency(baseCase.netProfit)}`,
      `Margin: ${formatPercent(baseCase.margin)}`
    ];
    
    const maxLines = Math.max(leftLines.length, rightLines.length);
    const startY = currentY;
    
    for (let i = 0; i < maxLines; i++) {
      if (i < leftLines.length) {
        doc.text(leftLines[i], leftColumnX, currentY);
      }
      if (i < rightLines.length) {
        doc.text(rightLines[i], rightColumnX, currentY);
      }
      currentY += 6;
    }
    
    currentY = startY + (maxLines * 6) + 10;
    
    // Risk Analysis Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Risk Analysis', leftColumnX, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const riskLines = [
      `Best Case (${bestCase.label}): ${formatCurrency(bestCase.salesPrice)} → ${formatPercent(bestCase.margin)} margin`,
      `Worst Case (${worstCase.label}): ${formatCurrency(worstCase.salesPrice)} → ${formatPercent(worstCase.margin)} margin`,
      `Price Range: ${formatCurrency(worstCase.salesPrice)} - ${formatCurrency(bestCase.salesPrice)}`,
      `Margin Range: ${formatPercent(worstCase.margin)} - ${formatPercent(bestCase.margin)}`
    ];
    
    riskLines.forEach(line => {
      doc.text(line, leftColumnX, currentY);
      currentY += 6;
    });
    
    currentY += 15;
  }
  
  // Detailed Analysis Table
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Scenario Analysis', margin, currentY);
  currentY += 10;
  
  // Summary table (first page)
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary Table', margin, currentY);
  currentY += 10;
  
  const summaryHeaders = [
    'Scenario',
    'Sales Price',
    'Total Costs',
    'Net Profit',
    'Margin %',
    'ROI %',
    'Profit/SqFt'
  ];
  
  // Sort scenarios by sales price (lowest to highest)
  const sortedScenariosForTable = [...scenarios].sort((a, b) => a.salesPrice - b.salesPrice);
  
  const summaryData = sortedScenariosForTable.map(scenario => [
    scenario.label,
    formatCurrency(scenario.salesPrice),
    formatCurrency(scenario.totalCosts),
    formatCurrency(scenario.netProfit),
    formatPercent(scenario.margin),
    formatPercent(scenario.roi),
    formatCurrency(scenario.profitPerSqFt)
  ]);
  
  // Generate summary table
  autoTable(doc, {
    head: [summaryHeaders],
    body: summaryData,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: [248, 249, 250], // Very light gray background
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [200, 200, 200]
    },
    bodyStyles: {
      textColor: [0, 0, 0], // Black text for all body cells
      fontSize: 9,
      lineWidth: 0.5,
      lineColor: [220, 220, 220]
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252] // Very subtle alternating rows
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    },
    didParseCell: function(data) {
      // Highlight base case row
      if (data.row.index !== undefined && summaryData[data.row.index] && summaryData[data.row.index][0] === 'Base Case') {
        data.cell.styles.fillColor = [230, 240, 250]; // Light blue
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Keep all text black for consistency
      data.cell.styles.textColor = [0, 0, 0];
    }
  });
  
  // Start new page for detailed analysis
  doc.addPage();
  currentY = margin;
  
  // Detailed Cost Analysis Table
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Cost Analysis', margin, currentY);
  currentY += 10;
  
  // Use dynamic headers based on available cost data
  
  const { costBreakdown } = options;
  
  // Filter out columns that have no data
  const availableCosts = [];
  const dynamicHeaders = ['Scenario', 'Sales Price'];
  
  if (costBreakdown?.hardCosts && costBreakdown.hardCosts > 0) {
    availableCosts.push('hardCosts');
    dynamicHeaders.push('Hard Costs');
  }
  if (costBreakdown?.softCosts && costBreakdown.softCosts > 0) {
    availableCosts.push('softCosts');
    dynamicHeaders.push('Soft Costs');
  }
  if (costBreakdown?.landCosts && costBreakdown.landCosts > 0) {
    availableCosts.push('landCosts');
    dynamicHeaders.push('Land Costs');
  }
  
  dynamicHeaders.push('Sales Costs'); // Always include sales costs
  
  if (costBreakdown?.contingencyCosts && costBreakdown.contingencyCosts > 0) {
    availableCosts.push('contingencyCosts');
    dynamicHeaders.push('Contingency');
  }
  if (costBreakdown?.constructionFinancing && costBreakdown.constructionFinancing > 0 && costBreakdown.useConstructionFinancing) {
    availableCosts.push('constructionFinancing');
    dynamicHeaders.push('Construction Financing');
  }
  
  dynamicHeaders.push('Net Profit');
  
  // Sort scenarios for detailed table too
  const sortedDetailedScenarios = [...scenarios].sort((a, b) => a.salesPrice - b.salesPrice);
  
  const detailedData = sortedDetailedScenarios.map(scenario => {
    const row = [
      scenario.label,
      formatCurrency(scenario.salesPrice)
    ];
    
    // Add cost columns based on what's available
    if (availableCosts.includes('hardCosts')) {
      row.push(formatCurrency(costBreakdown?.hardCosts || 0));
    }
    if (availableCosts.includes('softCosts')) {
      row.push(formatCurrency(costBreakdown?.softCosts || 0));
    }
    if (availableCosts.includes('landCosts')) {
      row.push(formatCurrency(costBreakdown?.landCosts || 0));
    }
    
    row.push(formatCurrency(scenario.salesCosts)); // Always include sales costs
    
    if (availableCosts.includes('contingencyCosts')) {
      row.push(formatCurrency(costBreakdown?.contingencyCosts || 0));
    }
    if (availableCosts.includes('constructionFinancing')) {
      row.push(formatCurrency(costBreakdown?.constructionFinancing || 0));
    }
    
    row.push(formatCurrency(scenario.netProfit));
    
    return row;
  });
  
  // Generate detailed table
  autoTable(doc, {
    head: [dynamicHeaders],
    body: detailedData,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: [248, 249, 250], // Very light gray background
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      lineWidth: 0.5,
      lineColor: [200, 200, 200]
    },
    bodyStyles: {
      textColor: [0, 0, 0], // Black text for all body cells
      fontSize: 9,
      lineWidth: 0.5,
      lineColor: [220, 220, 220]
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252] // Very subtle alternating rows
    },
    columnStyles: dynamicHeaders.reduce((acc, header, index) => {
      if (index === 0) {
        acc[index] = { fontStyle: 'bold', halign: 'left' };
      } else {
        acc[index] = { halign: 'right' };
      }
      return acc;
    }, {} as any),
    didParseCell: function(data) {
      // Highlight base case row
      if (data.row.index !== undefined && detailedData[data.row.index] && detailedData[data.row.index][0] === 'Base Case') {
        data.cell.styles.fillColor = [230, 240, 250]; // Light blue
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Keep all text black for consistency
      data.cell.styles.textColor = [0, 0, 0];
    }
  });
  

  
  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128);
    doc.text('Generated by DevTracker Pro - Real Estate Development Project Management', margin, pageHeight - 15);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 15);
  }
  
  // Save the PDF
  const fileName = `sensitivity-analysis-${unitTypeName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Export single scenario summary
export function exportScenarioSummaryToPDF(scenario: ScenarioData, options: Partial<PDFExportOptions> = {}): void {
  exportSensitivityAnalysisToPDF({
    ...options,
    scenarios: [scenario]
  });
}