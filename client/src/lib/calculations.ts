export function calculateSalesCosts(salesPrice: number): number {
  const first100k = Math.min(salesPrice, 100000);
  const balance = Math.max(0, salesPrice - 100000);
  return (first100k * 0.05) + (balance * 0.03);
}

export function calculateNetProfitWithCustomCosts(
  salesPrice: number, 
  hardCosts: number, 
  softCosts: number, 
  landCosts: number, 
  contingencyCosts: number,
  salesCosts: number,
  lawyerFees: number
): number {
  const totalCosts = hardCosts + softCosts + landCosts + contingencyCosts + salesCosts + lawyerFees;
  return salesPrice - totalCosts;
}

export function convertCostPerMethod(cost: number, method: string, squareFootage: number): number {
  if (method === 'perSqFt') {
    return cost * squareFootage;
  }
  return cost;
}

export function calculateNetProfit(salesPrice: number, hardCosts: number, softCosts: number, landCosts: number, contingencyCosts: number): number {
  const salesCosts = calculateSalesCosts(salesPrice);
  const totalCosts = hardCosts + softCosts + landCosts + contingencyCosts + salesCosts;
  return salesPrice - totalCosts;
}

export function calculateMargin(salesPrice: number, netProfit: number): number {
  if (salesPrice === 0) return 0;
  return (netProfit / salesPrice) * 100;
}

export function calculateProfitPerSqFt(netProfit: number, squareFootage: number): number {
  if (squareFootage === 0) return 0;
  return netProfit / squareFootage;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateROI(netProfit: number, totalInvestment: number): number {
  if (totalInvestment === 0) return 0;
  return (netProfit / totalInvestment) * 100;
}
