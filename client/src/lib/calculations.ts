export const calculateSalesCosts = (salesPrice: number): number => {
  if (salesPrice <= 0) return 0;

  // 5% on first $100k, 3% on balance
  const firstTier = Math.min(salesPrice, 100000);
  const secondTier = Math.max(salesPrice - 100000, 0);

  return (firstTier * 0.05) + (secondTier * 0.03);
};

export const calculateNetProfit = (
  salesPrice: number,
  hardCosts: number,
  softCosts: number,
  landCosts: number,
  salesCosts: number
): number => {
  const totalCosts = hardCosts + softCosts + landCosts + salesCosts;
  return salesPrice - totalCosts;
};

export const calculateMargin = (netProfit: number, salesPrice: number): number => {
  if (salesPrice <= 0) return 0;
  return (netProfit / salesPrice) * 100;
};

export const calculateROI = (netProfit: number, totalCosts: number): number => {
  if (totalCosts <= 0) return 0;
  return (netProfit / totalCosts) * 100;
};

export const calculateProfitPerSqFt = (netProfit: number, squareFootage: number): number => {
  if (squareFootage <= 0) return 0;
  return netProfit / squareFootage;
};

export const calculateNetProfitWithCustomCosts = (
  salesPrice: number,
  totalCosts: number
): number => {
  return salesPrice - totalCosts;
};

export const convertCostPerMethod = (
  value: number, 
  method: 'perUnit' | 'perSqFt' | 'percentage', 
  sqFt: number, 
  baseValue?: number
): number => {
  if (method === 'perSqFt') {
    return value * sqFt;
  } else if (method === 'percentage' && baseValue) {
    return (value / 100) * baseValue;
  }
  return value;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};