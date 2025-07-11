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
  const {
    projectName = "Unit Profitability Analysis",
    unitTypeName = "Unit Type",
    squareFootage = 0,
    scenarios,
    analysisDate = new Date(),
    costBreakdown = {}
  } = options;

  const baseScenario = scenarios.find(s => s.label === 'Base Case') || scenarios[0];
  
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

  // Create HTML content for the report
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${projectName} - Analysis Report</title>
    <style>
        @page {
            margin: 0.5in;
            size: letter;
        }
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            color: #333; 
            line-height: 1.4;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #3498db;
            padding-bottom: 20px;
        }
        .title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 10px; 
        }
        .subtitle { 
            font-size: 16px; 
            color: #34495e; 
            margin-bottom: 5px; 
        }
        .date { 
            font-size: 12px; 
            color: #7f8c8d; 
        }
        .section { 
            margin: 25px 0; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #2980b9; 
            margin-bottom: 15px; 
            border-bottom: 1px solid #3498db; 
            padding-bottom: 5px; 
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 20px; 
        }
        .summary-item { 
            background: #f8f9fa; 
            padding: 12px; 
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .summary-label { 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 4px;
        }
        .summary-value {
            font-size: 16px;
            color: #27ae60;
            font-weight: bold;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            font-size: 11px;
        }
        th { 
            background: #ffffff; 
            color: #000; 
            font-weight: bold; 
            padding: 8px 6px; 
            border: 1px solid #000; 
            text-align: left; 
        }
        td { 
            padding: 6px; 
            border: 1px solid #ddd; 
        }
        tr:nth-child(even) { 
            background: #f8f9fa; 
        }
        .currency { 
            text-align: right; 
        }
        .percent { 
            text-align: right; 
        }
        .risk-section { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }
        .risk-category { 
            margin-bottom: 15px; 
        }
        .risk-title { 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 8px; 
        }
        .risk-item { 
            margin-left: 20px; 
            margin-bottom: 5px; 
        }
        .footer {
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 10px; 
            color: #7f8c8d;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${projectName}</div>
        <div class="subtitle">${unitTypeName} - Profitability Analysis Report</div>
        <div class="date">Generated: ${analysisDate.toLocaleDateString()}</div>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Unit Type:</div>
                <div class="summary-value">${unitTypeName} (${squareFootage} sq ft)</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Base Case Sales Price:</div>
                <div class="summary-value">${formatCurrency(baseScenario?.salesPrice || 0)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Base Case Net Profit:</div>
                <div class="summary-value">${formatCurrency(baseScenario?.netProfit || 0)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Base Case Margin:</div>
                <div class="summary-value">${formatPercent(baseScenario?.margin || 0)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Base Case ROI:</div>
                <div class="summary-value">${formatPercent(baseScenario?.roi || 0)}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Profit per Sq Ft:</div>
                <div class="summary-value">${formatCurrency(baseScenario?.profitPerSqFt || 0)}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Scenario Analysis Overview</div>
        <table>
            <thead>
                <tr>
                    <th>Scenario</th>
                    <th>Sales Price</th>
                    <th>Total Costs</th>
                    <th>Net Profit</th>
                    <th>Margin %</th>
                    <th>ROI %</th>
                    <th>Profit/Sq Ft</th>
                </tr>
            </thead>
            <tbody>
                ${scenarios.map(scenario => `
                    <tr style="${scenario.label === 'Base Case' ? 'background-color: #e3f2fd; font-weight: bold;' : ''}">
                        <td>${scenario.label}</td>
                        <td class="currency">${formatCurrency(scenario.salesPrice)}</td>
                        <td class="currency">${formatCurrency(scenario.totalCosts)}</td>
                        <td class="currency" style="color: ${scenario.netProfit >= 0 ? '#27ae60' : '#e74c3c'};">${formatCurrency(scenario.netProfit)}</td>
                        <td class="percent" style="color: ${scenario.margin >= 0 ? '#27ae60' : '#e74c3c'};">${formatPercent(scenario.margin)}</td>
                        <td class="percent" style="color: ${scenario.roi >= 0 ? '#27ae60' : '#e74c3c'};">${formatPercent(scenario.roi)}</td>
                        <td class="currency">${formatCurrency(scenario.profitPerSqFt)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Detailed Cost Analysis (Per Unit)</div>
        <table>
            <thead>
                <tr>
                    <th>Scenario</th>
                    <th>Sales Price</th>
                    <th>Hard Costs</th>
                    <th>Soft Costs</th>
                    <th>Land Costs</th>
                    <th>Sales Costs</th>
                    <th>Financing</th>
                    <th>Net Profit</th>
                </tr>
            </thead>
            <tbody>
                ${scenarios.map(scenario => `
                    <tr style="${scenario.label === 'Base Case' ? 'background-color: #e3f2fd; font-weight: bold;' : ''}">
                        <td>${scenario.label}</td>
                        <td class="currency">${formatCurrency(scenario.salesPrice)}</td>
                        <td class="currency">${formatCurrency(costBreakdown.hardCosts || 0)}</td>
                        <td class="currency">${formatCurrency(costBreakdown.softCosts || 0)}</td>
                        <td class="currency">${formatCurrency(costBreakdown.landCosts || 0)}</td>
                        <td class="currency">${formatCurrency(scenario.salesCosts)}</td>
                        <td class="currency">${formatCurrency((costBreakdown.useConstructionFinancing && costBreakdown.constructionFinancing) || 0)}</td>
                        <td class="currency" style="color: ${scenario.netProfit >= 0 ? '#27ae60' : '#e74c3c'};">${formatCurrency(scenario.netProfit)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Risk Analysis</div>
        <div class="risk-section">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                <div>
                    <div style="margin-bottom: 10px; font-weight: normal;">Profit Range: ${formatCurrency(minProfit)} to ${formatCurrency(maxProfit)}</div>
                    <div style="margin-bottom: 10px; font-weight: normal;">Average Margin: ${formatPercent(margins.reduce((a, b) => a + b, 0) / margins.length)}</div>
                    <div style="margin-bottom: 10px; font-weight: normal;">Number of Scenarios: ${scenarios.length}</div>
                </div>
                <div>
                    <div style="margin-bottom: 10px; font-weight: normal;">Break-even: ${scenarios.filter(s => s.netProfit >= 0).length}/${scenarios.length} profitable</div>
                    <div style="margin-bottom: 10px; font-weight: normal;">Volatility: ${formatCurrency(maxProfit - minProfit)} spread</div>
                    <div style="margin-bottom: 10px; font-weight: normal;">Risk: ${scenarios.filter(s => s.netProfit < 0).length > 0 ? 'Loss scenarios present' : 'All scenarios profitable'}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        Report generated on ${new Date().toLocaleDateString()} | ${projectName}
    </div>
</body>
</html>
  `;

  // Open the HTML in a new window and trigger print
  const printWindow = window.open('', '_blank', 'width=800,height=1000');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then show print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  } else {
    alert('Please allow popups to generate the PDF report. You can save as PDF from the print dialog.');
  }
}