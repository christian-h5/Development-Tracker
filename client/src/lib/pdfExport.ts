import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  
  // Summary Section
  if (scenarios.length > 0) {
    const baseCase = scenarios.find(s => s.label === 'Base Case') || scenarios[0];
    
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'normal');
    const summaryLines = [
      `Base Case Sales Price: ${formatCurrency(baseCase.salesPrice)}`,
      `Base Case Net Profit: ${formatCurrency(baseCase.netProfit)}`,
      `Base Case Margin: ${formatPercent(baseCase.margin)}`,
      `Base Case ROI: ${formatPercent(baseCase.roi)}`,
      `Base Case Profit per Sq Ft: ${formatCurrency(baseCase.profitPerSqFt)}`
    ];
    
    summaryLines.forEach(line => {
      doc.text(line, margin, currentY);
      currentY += 7;
    });
    
    currentY += 15;

    // Cost Breakdown Section
    doc.setFont('helvetica', 'bold');
    doc.text('Cost Breakdown (Base Case)', margin, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'normal');
    const costLines = [
      `Sales Price: ${formatCurrency(baseCase.salesPrice)}`,
      `Sales Costs: ${formatCurrency(baseCase.salesCosts)}`,
      `Total Development Costs: ${formatCurrency(baseCase.totalCosts)}`,
      `Net Profit: ${formatCurrency(baseCase.netProfit)}`,
      `Profit Margin: ${formatPercent(baseCase.margin)}`,
      `Return on Investment: ${formatPercent(baseCase.roi)}`
    ];
    
    costLines.forEach(line => {
      doc.text(line, margin, currentY);
      currentY += 7;
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
  
  const summaryData = scenarios.map(scenario => [
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
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: 50
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
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
        data.cell.styles.fillColor = [173, 216, 230]; // Light blue
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Color profits based on positive/negative values (columns 3, 4, 5, 6)
      if (data.column.index >= 3) {
        const cellText = data.cell.text[0];
        if (cellText && cellText.includes('-')) {
          data.cell.styles.textColor = [231, 76, 60]; // Red for negative
        } else if (cellText && (cellText.includes('$') || cellText.includes('%'))) {
          data.cell.styles.textColor = [46, 125, 50]; // Green for positive
        }
      }
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
  
  const detailedData = scenarios.map(scenario => {
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
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: 50
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
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
        data.cell.styles.fillColor = [173, 216, 230]; // Light blue
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Color the Net Profit column (last column)
      if (data.column.index === dynamicHeaders.length - 1) {
        const cellText = data.cell.text[0];
        if (cellText && cellText.includes('-')) {
          data.cell.styles.textColor = [231, 76, 60]; // Red for negative
        } else if (cellText && cellText.includes('$')) {
          data.cell.styles.textColor = [46, 125, 50]; // Green for positive
        }
      }
    }
  });
  
  // Add risk analysis section in two columns on first page
  const summaryFinalY = (doc as any).lastAutoTable.finalY;
  const pageHeight = doc.internal.pageSize.height;
  
  if (summaryFinalY < pageHeight - 100) {
    let riskY = summaryFinalY + 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Risk Analysis', margin, riskY);
    riskY += 15;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Calculate risk metrics
    const profits = scenarios.map(s => s.netProfit);
    const margins = scenarios.map(s => s.margin);
    const minProfit = Math.min(...profits);
    const maxProfit = Math.max(...profits);
    const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
    
    const leftColumnLines = [
      `Profit Range: ${formatCurrency(minProfit)} to ${formatCurrency(maxProfit)}`,
      `Average Margin: ${formatPercent(avgMargin)}`,
      `Number of Scenarios: ${scenarios.length}`
    ];
    
    const rightColumnLines = [
      `Break-even: ${scenarios.filter(s => s.netProfit >= 0).length}/${scenarios.length} profitable`,
      `Volatility: ${formatCurrency(maxProfit - minProfit)} spread`,
      `Risk: ${scenarios.filter(s => s.netProfit < 0).length > 0 ? 'Loss scenarios present' : 'All scenarios profitable'}`
    ];
    
    const columnWidth = (pageWidth - 2 * margin) / 2;
    const rightColumnX = margin + columnWidth + 10;
    
    // Left column
    leftColumnLines.forEach((line, index) => {
      if (riskY + (index * 6) < pageHeight - 25) {
        doc.text(line, margin, riskY + (index * 6));
      }
    });
    
    // Right column
    rightColumnLines.forEach((line, index) => {
      if (riskY + (index * 6) < pageHeight - 25) {
        doc.text(line, rightColumnX, riskY + (index * 6));
      }
    });
  }
  
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