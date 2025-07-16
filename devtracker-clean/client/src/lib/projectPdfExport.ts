import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Project, PhaseWithUnits, ProjectSummary, UnitType } from '@shared/schema';
import { convertCostPerMethod, calculateSalesCosts } from '@/lib/calculations';

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
  doc.text('DevTracker Tool', margin, currentY);
  
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
        
        // Get unit type for square footage
        const unitType = unitTypes.find(ut => ut.id === unit.unitTypeId);
        const squareFootage = unitType?.squareFootage || 1;
        
        // Calculate per-unit costs using proper conversion methods
        const perUnitHardCosts = convertCostPerMethod(parseFloat(unit.hardCosts?.toString() || '0'), unit.hardCostsInputMethod || 'perUnit', squareFootage);
        const perUnitSoftCosts = convertCostPerMethod(parseFloat(unit.softCosts?.toString() || '0'), unit.softCostsInputMethod || 'perUnit', squareFootage);
        const perUnitLandCosts = convertCostPerMethod(parseFloat(unit.landCosts?.toString() || '0'), unit.landCostsInputMethod || 'perUnit', squareFootage);
        const perUnitContingencyCosts = convertCostPerMethod(parseFloat(unit.contingencyCosts?.toString() || '0'), unit.contingencyCostsInputMethod || 'perUnit', squareFootage);
        const perUnitLawyerFees = convertCostPerMethod(parseFloat(unit.lawyerFees?.toString() || '0'), unit.lawyerFeesInputMethod || 'perUnit', squareFootage);
        const perUnitConstructionFinancing = unit.useConstructionFinancing ? 
          convertCostPerMethod(parseFloat(unit.constructionFinancing?.toString() || '0'), unit.constructionFinancingInputMethod || 'perUnit', squareFootage) : 0;
        
        // Calculate revenue and sales costs from individual prices
        const individualPrices = unit.individualPrices ? JSON.parse(unit.individualPrices) : [];
        const baseSalesPrice = parseFloat(unit.salesPrice?.toString() || '0');
        
        let phaseRevenue = 0;
        let phaseSalesCosts = 0;
        
        for (let i = 0; i < quantity; i++) {
          const unitPrice = individualPrices[i] || baseSalesPrice;
          phaseRevenue += unitPrice;
          
          // Calculate sales costs - use custom if entered, otherwise auto-calculate
          const userSalesCosts = parseFloat(unit.salesCosts?.toString() || '0');
          if (userSalesCosts > 0) {
            const perUnitSalesCosts = convertCostPerMethod(userSalesCosts, unit.salesCostsInputMethod || 'perUnit', squareFootage);
            phaseSalesCosts += perUnitSalesCosts;
          } else if (unitPrice > 0) {
            phaseSalesCosts += calculateSalesCosts(unitPrice);
          }
        }
        
        // Total costs for this unit = (per-unit costs * quantity) + total sales costs
        const unitTotalCosts = (perUnitHardCosts + perUnitSoftCosts + perUnitLandCosts + perUnitContingencyCosts + perUnitLawyerFees + perUnitConstructionFinancing) * quantity + phaseSalesCosts;
        
        totalCosts += unitTotalCosts;
        totalRevenue += phaseRevenue;
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
        
        // Get unit type for square footage
        const unitType = unitTypes.find(ut => ut.id === unit.unitTypeId);
        const squareFootage = unitType?.squareFootage || 1;
        
        // Calculate proper costs using conversion methods
        const perUnitHardCosts = convertCostPerMethod(parseFloat(unit.hardCosts?.toString() || '0'), unit.hardCostsInputMethod || 'perUnit', squareFootage);
        const perUnitSoftCosts = convertCostPerMethod(parseFloat(unit.softCosts?.toString() || '0'), unit.softCostsInputMethod || 'perUnit', squareFootage);
        const perUnitLandCosts = convertCostPerMethod(parseFloat(unit.landCosts?.toString() || '0'), unit.landCostsInputMethod || 'perUnit', squareFootage);
        const perUnitContingencyCosts = convertCostPerMethod(parseFloat(unit.contingencyCosts?.toString() || '0'), unit.contingencyCostsInputMethod || 'perUnit', squareFootage);
        const perUnitLawyerFees = convertCostPerMethod(parseFloat(unit.lawyerFees?.toString() || '0'), unit.lawyerFeesInputMethod || 'perUnit', squareFootage);
        const perUnitConstructionFinancing = unit.useConstructionFinancing ? 
          convertCostPerMethod(parseFloat(unit.constructionFinancing?.toString() || '0'), unit.constructionFinancingInputMethod || 'perUnit', squareFootage) : 0;
        
        // Calculate revenue and sales costs from individual prices
        const individualPrices = unit.individualPrices ? JSON.parse(unit.individualPrices) : [];
        const baseSalesPrice = parseFloat(unit.salesPrice?.toString() || '0');
        
        let totalUnitRevenue = 0;
        let totalUnitSalesCosts = 0;
        
        for (let i = 0; i < quantity; i++) {
          const unitPrice = individualPrices[i] || baseSalesPrice;
          totalUnitRevenue += unitPrice;
          
          // Calculate sales costs - use custom if entered, otherwise auto-calculate
          const userSalesCosts = parseFloat(unit.salesCosts?.toString() || '0');
          if (userSalesCosts > 0) {
            const perUnitSalesCosts = convertCostPerMethod(userSalesCosts, unit.salesCostsInputMethod || 'perUnit', squareFootage);
            totalUnitSalesCosts += perUnitSalesCosts;
          } else if (unitPrice > 0) {
            totalUnitSalesCosts += calculateSalesCosts(unitPrice);
          }
        }
        
        const hardCosts = perUnitHardCosts * quantity;
        const softCosts = perUnitSoftCosts * quantity;
        const totalCosts = (perUnitHardCosts + perUnitSoftCosts + perUnitLandCosts + perUnitContingencyCosts + perUnitLawyerFees + perUnitConstructionFinancing) * quantity + totalUnitSalesCosts;
        const netProfit = totalUnitRevenue - totalCosts;
        
        return [
          unit.unitType.name,
          quantity.toString(),
          formatCurrency(hardCosts),
          formatCurrency(softCosts),
          formatCurrency(totalUnitRevenue),
          formatCurrency(netProfit)
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
    doc.text('Generated by DevTracker Tool - Real Estate Development Project Management', margin, pageHeight - 15);
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
      
      // Calculate total costs by category across all phases using proper conversion methods
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
          
          // Get unit type for square footage
          const unitType = unitTypes.find(ut => ut.id === unit.unitTypeId);
          const squareFootage = unitType?.squareFootage || 1;
          
          // Calculate proper costs using conversion methods
          const perUnitHardCosts = convertCostPerMethod(parseFloat(unit.hardCosts?.toString() || '0'), unit.hardCostsInputMethod || 'perUnit', squareFootage);
          const perUnitSoftCosts = convertCostPerMethod(parseFloat(unit.softCosts?.toString() || '0'), unit.softCostsInputMethod || 'perUnit', squareFootage);
          const perUnitLandCosts = convertCostPerMethod(parseFloat(unit.landCosts?.toString() || '0'), unit.landCostsInputMethod || 'perUnit', squareFootage);
          const perUnitContingencyCosts = convertCostPerMethod(parseFloat(unit.contingencyCosts?.toString() || '0'), unit.contingencyCostsInputMethod || 'perUnit', squareFootage);
          const perUnitLawyerFees = convertCostPerMethod(parseFloat(unit.lawyerFees?.toString() || '0'), unit.lawyerFeesInputMethod || 'perUnit', squareFootage);
          const perUnitConstructionFinancing = unit.useConstructionFinancing ? 
            convertCostPerMethod(parseFloat(unit.constructionFinancing?.toString() || '0'), unit.constructionFinancingInputMethod || 'perUnit', squareFootage) : 0;
          
          totalHardCosts += perUnitHardCosts * quantity;
          totalSoftCosts += perUnitSoftCosts * quantity;
          totalLandCosts += perUnitLandCosts * quantity;
          totalContingencyCosts += perUnitContingencyCosts * quantity;
          totalLawyerFees += perUnitLawyerFees * quantity;
          totalConstructionFinancing += perUnitConstructionFinancing * quantity;
          
          // Calculate sales costs from individual prices
          const individualPrices = unit.individualPrices ? JSON.parse(unit.individualPrices) : [];
          const baseSalesPrice = parseFloat(unit.salesPrice?.toString() || '0');
          
          for (let i = 0; i < quantity; i++) {
            const unitPrice = individualPrices[i] || baseSalesPrice;
            
            // Calculate sales costs - use custom if entered, otherwise auto-calculate
            const userSalesCosts = parseFloat(unit.salesCosts?.toString() || '0');
            if (userSalesCosts > 0) {
              const perUnitSalesCosts = convertCostPerMethod(userSalesCosts, unit.salesCostsInputMethod || 'perUnit', squareFootage);
              totalSalesCosts += perUnitSalesCosts;
            } else if (unitPrice > 0) {
              totalSalesCosts += calculateSalesCosts(unitPrice);
            }
          }
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