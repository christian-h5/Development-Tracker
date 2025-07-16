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

// Simple CSV export function
function downloadCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
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
  // Convert to CSV format for now as PDF export is having issues
  const csvData = options.scenarios.map(scenario => ({
    'Scenario': scenario.label,
    'Sales Price': formatCurrency(scenario.salesPrice),
    'Sales Costs': formatCurrency(scenario.salesCosts), 
    'Total Costs': formatCurrency(scenario.totalCosts),
    'Net Profit': formatCurrency(scenario.netProfit),
    'Margin %': formatPercent(scenario.margin),
    'ROI %': formatPercent(scenario.roi),
    'Profit/SqFt': formatCurrency(scenario.profitPerSqFt)
  }));
  
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${options.projectName || 'Sensitivity-Analysis'}_${timestamp}.csv`;
  
  downloadCSV(csvData, filename);
}

export function exportProjectSummaryToPDF(options: any): void {
  // For now, just alert that this feature is coming soon
  alert('Project PDF export coming soon. Use the CSV export for now.');
}