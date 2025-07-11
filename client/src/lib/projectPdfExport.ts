import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Project, PhaseWithUnits, ProjectSummary, UnitType } from '@shared/schema';

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

interface ProjectPDFExportOptions {
  project: Project;
  phases: PhaseWithUnits[];
  summary: ProjectSummary;
  unitTypes: UnitType[];
}

export function exportProjectToPDF(options: ProjectPDFExportOptions): void {
  const { project, phases, summary, unitTypes } = options;

  // Create new PDF document
  const doc = new jsPDF();
  
  // Set up document styling
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let currentY = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DevTracker Pro', margin, currentY);
  
  currentY += 10;
  doc.setFontSize(16);
  doc.text('Project Summary Report', margin, currentY);
  
  currentY += 20;
  
  // Project Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Overview', margin, currentY);
  currentY += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const projectLines = [
    `Project Name: ${project.name}`,
    `Description: ${project.description || 'No description provided'}`,
    `Report Generated: ${new Date().toLocaleString()}`
  ];
  
  projectLines.forEach(line => {
    doc.text(line, margin, currentY);
    currentY += 7;
  });
  
  currentY += 15;
  
  // Executive Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, currentY);
  currentY += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const summaryLines = [
    `Total Phases: ${summary.totalPhases}`,
    `Completed Phases: ${summary.completedPhases}`,
    `Total Units: ${summary.totalUnits}`,
    `Total Revenue: ${formatCurrency(summary.totalRevenue)}`,
    `Total Costs: ${formatCurrency(summary.totalCosts)}`,
    `Overall Margin: ${formatPercent(summary.overallMargin)}`,
    `Overall ROI: ${formatPercent(summary.overallROI)}`
  ];
  
  summaryLines.forEach(line => {
    doc.text(line, margin, currentY);
    currentY += 7;
  });
  
  currentY += 15;
  
  // Unit Types Summary
  if (unitTypes.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Unit Types', margin, currentY);
    currentY += 10;
    
    // Unit Types Table
    const unitTypeHeaders = ['Unit Type', 'Square Footage', 'Bedrooms', 'Description'];
    const unitTypeData = unitTypes.map(unitType => [
      unitType.name,
      `${unitType.squareFootage.toLocaleString()} sq ft`,
      unitType.bedrooms.toString(),
      unitType.description || 'No description'
    ]);
    
    autoTable(doc, {
      head: [unitTypeHeaders],
      body: unitTypeData,
      startY: currentY,
      theme: 'striped',
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: 50
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'center' }
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Phase Summary
  if (phases.length > 0) {
    // Check if we need a new page
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Phase Summary', margin, currentY);
    currentY += 10;
    
    // Phase Summary Table
    const phaseHeaders = ['Phase', 'Status', 'Total Units', 'Total Costs', 'Total Revenue', 'Net Profit', 'Margin %'];
    const phaseData = phases.map(phase => {
      let totalUnits = 0;
      let totalCosts = 0;
      let totalRevenue = 0;
      
      phase.units.forEach(unit => {
        const quantity = unit.quantity || 0;
        totalUnits += quantity;
        
        const unitCosts = (
          (parseFloat(unit.hardCosts?.toString() || '0')) +
          (parseFloat(unit.softCosts?.toString() || '0')) +
          (parseFloat(unit.landCosts?.toString() || '0')) +
          (parseFloat(unit.contingencyCosts?.toString() || '0')) +
          (parseFloat(unit.salesCosts?.toString() || '0')) +
          (parseFloat(unit.lawyerFees?.toString() || '0')) +
          (parseFloat(unit.constructionFinancing?.toString() || '0'))
        ) * quantity;
        
        const unitRevenue = (parseFloat(unit.salesPrice?.toString() || '0')) * quantity;
        
        totalCosts += unitCosts;
        totalRevenue += unitRevenue;
      });
      
      const netProfit = totalRevenue - totalCosts;
      const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
      
      return [
        phase.name,
        phase.status || 'planned',
        totalUnits.toString(),
        formatCurrency(totalCosts),
        formatCurrency(totalRevenue),
        formatCurrency(netProfit),
        formatPercent(margin)
      ];
    });
    
    autoTable(doc, {
      head: [phaseHeaders],
      body: phaseData,
      startY: currentY,
      theme: 'striped',
      headStyles: {
        fillColor: [46, 125, 50],
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: 50
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }, // Keep costs black
        4: { halign: 'right' }, // Keep costs black
        5: { halign: 'right' }, // Profit - will be colored based on value
        6: { halign: 'right' }  // Margin - will be colored based on value
      },
      didParseCell: function(data) {
        // Color coding based on status
        if (data.column.index === 1 && data.cell.text[0]) {
          const status = data.cell.text[0].toLowerCase();
          if (status === 'completed') {
            data.cell.styles.fillColor = [200, 230, 201];
          } else if (status === 'in progress') {
            data.cell.styles.fillColor = [255, 243, 224];
          }
        }
        
        // Color profits based on positive/negative values (columns 5 and 6: Net Profit and Margin)
        if (data.column.index >= 5) {
          const cellText = data.cell.text[0];
          if (cellText && cellText.includes('-')) {
            data.cell.styles.textColor = [231, 76, 60]; // Red for negative
          } else if (cellText && (cellText.includes('$') || cellText.includes('%'))) {
            data.cell.styles.textColor = [46, 125, 50]; // Green for positive
          }
        }
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Detailed Phase Breakdown
  if (phases.length > 0) {
    phases.forEach((phase, phaseIndex) => {
      if (phase.units.length === 0) return;
      
      // Check if we need a new page
      if (currentY > pageHeight - 150) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${phase.name} - Unit Details`, margin, currentY);
      currentY += 10;
      
      // Unit Details Table
      const unitHeaders = ['Unit Type', 'Quantity', 'Hard Costs', 'Soft Costs', 'Sales Price', 'Net Profit'];
      const unitData = phase.units.map(unit => {
        const quantity = unit.quantity || 0;
        const hardCosts = parseFloat(unit.hardCosts?.toString() || '0') * quantity;
        const softCosts = parseFloat(unit.softCosts?.toString() || '0') * quantity;
        const totalCosts = hardCosts + softCosts + 
          (parseFloat(unit.landCosts?.toString() || '0') * quantity) +
          (parseFloat(unit.contingencyCosts?.toString() || '0') * quantity) +
          (parseFloat(unit.salesCosts?.toString() || '0') * quantity) +
          (parseFloat(unit.lawyerFees?.toString() || '0') * quantity) +
          (parseFloat(unit.constructionFinancing?.toString() || '0') * quantity);
        const revenue = parseFloat(unit.salesPrice?.toString() || '0') * quantity;
        const profit = revenue - totalCosts;
        
        return [
          unit.unitType.name,
          quantity.toString(),
          formatCurrency(hardCosts),
          formatCurrency(softCosts),
          formatCurrency(revenue),
          formatCurrency(profit)
        ];
      });
      
      autoTable(doc, {
        head: [unitHeaders],
        body: unitData,
        startY: currentY,
        theme: 'grid',
        headStyles: {
          fillColor: [149, 165, 166],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          textColor: 50,
          fontSize: 9
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'right' }, // Keep costs black
          3: { halign: 'right' }, // Keep costs black
          4: { halign: 'right' },
          5: { halign: 'right' }  // Profit - will be colored based on value
        },
        didParseCell: function(data) {
          // Color profits based on positive/negative values (column 5: Net Profit)
          if (data.column.index === 5) {
            const cellText = data.cell.text[0];
            if (cellText && cellText.includes('-')) {
              data.cell.styles.textColor = [231, 76, 60]; // Red for negative
            } else if (cellText && cellText.includes('$')) {
              data.cell.styles.textColor = [46, 125, 50]; // Green for positive
            }
          }
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 10;
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
  
  // Financial Analysis Summary (if space permits on last page)
  if (currentY < pageHeight - 80) {
    doc.setPage(totalPages);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Financial Analysis', margin, currentY);
    currentY += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const netProfit = summary.totalRevenue - summary.totalCosts;
    
    const analysisLines = [
      `Total Development Cost: ${formatCurrency(summary.totalCosts)}`,
      `Expected Revenue: ${formatCurrency(summary.totalRevenue)}`,
      `Net Profit: ${formatCurrency(netProfit)}`,
      `Project Margin: ${formatPercent(summary.overallMargin)}`,
      `Return on Investment: ${formatPercent(summary.overallROI)}`,
      `Cost per Unit: ${summary.totalUnits > 0 ? formatCurrency(summary.totalCosts / summary.totalUnits) : 'N/A'}`,
      `Revenue per Unit: ${summary.totalUnits > 0 ? formatCurrency(summary.totalRevenue / summary.totalUnits) : 'N/A'}`
    ];
    
    analysisLines.forEach(line => {
      if (currentY < pageHeight - 25) {
        doc.text(line, margin, currentY);
        currentY += 6;
      }
    });
    
    // Total Cost Breakdown
    currentY += 10;
    if (currentY < pageHeight - 60) {
      doc.setFont('helvetica', 'bold');
      doc.text('Total Cost Breakdown', margin, currentY);
      currentY += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Calculate total costs by category across all phases
      let totalHardCosts = 0;
      let totalSoftCosts = 0;
      let totalLandCosts = 0;
      let totalContingencyCosts = 0;
      let totalSalesCosts = 0;
      let totalLawyerFees = 0;
      let totalConstructionFinancing = 0;
      
      phases.forEach(phase => {
        phase.units.forEach(unit => {
          const quantity = unit.quantity || 0;
          totalHardCosts += (parseFloat(unit.hardCosts?.toString() || '0')) * quantity;
          totalSoftCosts += (parseFloat(unit.softCosts?.toString() || '0')) * quantity;
          totalLandCosts += (parseFloat(unit.landCosts?.toString() || '0')) * quantity;
          totalContingencyCosts += (parseFloat(unit.contingencyCosts?.toString() || '0')) * quantity;
          totalSalesCosts += (parseFloat(unit.salesCosts?.toString() || '0')) * quantity;
          totalLawyerFees += (parseFloat(unit.lawyerFees?.toString() || '0')) * quantity;
          totalConstructionFinancing += (parseFloat(unit.constructionFinancing?.toString() || '0')) * quantity;
        });
      });
      
      const breakdownLines = [
        `Hard Costs: ${formatCurrency(totalHardCosts)}`,
        `Soft Costs: ${formatCurrency(totalSoftCosts)}`,
        `Land Costs: ${formatCurrency(totalLandCosts)}`,
        `Contingency Costs: ${formatCurrency(totalContingencyCosts)}`,
        `Sales Costs: ${formatCurrency(totalSalesCosts)}`,
        `Lawyer Fees: ${formatCurrency(totalLawyerFees)}`,
        `Construction Financing: ${formatCurrency(totalConstructionFinancing)}`,
        `Total: ${formatCurrency(summary.totalCosts)}`
      ];
      
      breakdownLines.forEach(line => {
        if (currentY < pageHeight - 25) {
          doc.text(line, margin, currentY);
          currentY += 5;
        }
      });
    }
  }
  
  // Save the PDF
  const fileName = `project-summary-${project.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}