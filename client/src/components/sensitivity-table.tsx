import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { exportSensitivityAnalysisToPDF } from "@/lib/pdfExport";
import { FileDown } from "lucide-react";

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
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercent, calculateROI } from "@/lib/calculations";


interface SensitivityTableProps {
  scenarios: ScenarioData[];
  basePrice?: number;
  onGenerateSensitivity?: (scenarios: ScenarioData[]) => void;
  unitTypeName?: string;
  squareFootage?: number;
  projectName?: string;
}



export default function SensitivityTable({ 
  scenarios, 
  basePrice = 0, 
  onGenerateSensitivity,
  unitTypeName = "Unit Type",
  squareFootage = 0,
  projectName = "Unit Calculator"
}: SensitivityTableProps) {
  const [sensitivityType, setSensitivityType] = useState<'percentage' | 'dollar'>('percentage');
  const [sensitivityValue, setSensitivityValue] = useState('10');
  const [numberOfScenarios, setNumberOfScenarios] = useState('5');

  const generateSensitivityScenarios = () => {
    if (!basePrice || basePrice === 0) return;

    const value = parseFloat(sensitivityValue) || 10;
    const count = parseInt(numberOfScenarios) || 5;
    const newScenarios: ScenarioData[] = [];

    // Generate scenarios from negative to positive
    const halfCount = Math.floor(count / 2);
    for (let i = -halfCount; i <= halfCount; i++) {
      if (i === 0 && count % 2 === 0) continue; // Skip zero for even numbers

      let adjustedPrice: number;
      if (sensitivityType === 'percentage') {
        const adjustment = (value * i) / 100;
        adjustedPrice = basePrice * (1 + adjustment);
      } else {
        adjustedPrice = basePrice + (value * i);
      }

      if (adjustedPrice > 0) {
        const label = i === 0 ? 'Base Case' : 
                    i < 0 ? `${Math.abs(i * (sensitivityType === 'percentage' ? value : value))}${sensitivityType === 'percentage' ? '%' : '$'} Lower` :
                    `${i * (sensitivityType === 'percentage' ? value : value)}${sensitivityType === 'percentage' ? '%' : '$'} Higher`;

        // Calculate costs and metrics for this price
        const baseCaseScenario = scenarios.find(s => s.label === 'Base Case');
        const baseSalesPrice = baseCaseScenario?.salesPrice || basePrice;
        const baseTotalCosts = baseCaseScenario?.totalCosts || 0;
        const baseSalesCosts = baseCaseScenario?.salesCosts || 0;

        // Proportionally adjust sales costs if they change with price
        const salesCostRatio = baseSalesPrice > 0 ? baseSalesCosts / baseSalesPrice : 0;
        const adjustedSalesCosts = adjustedPrice * salesCostRatio;
        const adjustedTotalCosts = baseTotalCosts - baseSalesCosts + adjustedSalesCosts;

        const netProfit = adjustedPrice - adjustedTotalCosts;
        const margin = adjustedPrice > 0 ? (netProfit / adjustedPrice) * 100 : 0;
        const roi = adjustedTotalCosts > 0 ? (netProfit / adjustedTotalCosts) * 100 : 0;
        const profitPerSqFt = squareFootage > 0 ? (netProfit / squareFootage) : 0;

        newScenarios.push({
          label,
          salesPrice: adjustedPrice,
          salesCosts: adjustedSalesCosts,
          totalCosts: adjustedTotalCosts,
          netProfit,
          margin,
          profitPerSqFt,
          roi
        });
      }
    }

    // Include existing custom scenarios (non-generated ones)
    const existingCustomScenarios = scenarios.filter(s => 
      s.label !== 'Base Case' && 
      !s.label.includes('Lower') && 
      !s.label.includes('Higher') &&
      !s.label.includes('%') &&
      !s.label.includes('$')
    );

    // Combine generated scenarios with existing custom scenarios
    const combinedScenarios = [...newScenarios, ...existingCustomScenarios];

    if (onGenerateSensitivity) {
      onGenerateSensitivity(combinedScenarios);
    }
  };
  const getBadgeColor = (label: string) => {
    switch (label) {
      case 'Conservative':
        return 'bg-gray-100 text-gray-800';
      case 'Base Case':
        return 'bg-blue-500 text-white';
      case 'Optimistic':
        return 'bg-green-500 text-white';
      case 'Premium':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin < 5) return 'text-error';
    if (margin < 15) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Profitability Analysis</h3>

        {/* Enhanced Sensitivity Analysis Controls */}
        {basePrice > 0 && onGenerateSensitivity && (
          <Card className="mb-8 border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Advanced Sensitivity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="sensitivityType">Adjustment Type</Label>
                  <Select value={sensitivityType} onValueChange={(value: 'percentage' | 'dollar') => setSensitivityType(value)}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="percentage" className="text-gray-900 hover:bg-gray-100">Percentage (%)</SelectItem>
                      <SelectItem value="dollar" className="text-gray-900 hover:bg-gray-100">Dollar Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sensitivityValue">
                    {sensitivityType === 'percentage' ? 'Percentage Step' : 'Dollar Step'}
                  </Label>
                  <Input
                    id="sensitivityValue"
                    type="number"
                    value={sensitivityValue}
                    onChange={(e) => setSensitivityValue(e.target.value)}
                    placeholder={sensitivityType === 'percentage' ? '10' : '50000'}
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfScenarios">Number of Scenarios</Label>
                  <Select value={numberOfScenarios} onValueChange={setNumberOfScenarios}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="3" className="text-gray-900 hover:bg-gray-100">3</SelectItem>
                      <SelectItem value="5" className="text-gray-900 hover:bg-gray-100">5</SelectItem>
                      <SelectItem value="7" className="text-gray-900 hover:bg-gray-100">7</SelectItem>
                      <SelectItem value="9" className="text-gray-900 hover:bg-gray-100">9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={generateSensitivityScenarios}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generate Analysis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {scenarios.length > 0 && (
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h4 className="font-semibold text-gray-800">Analysis Results</h4>
              <Button
                onClick={() => exportSensitivityAnalysisToPDF({
                  projectName,
                  unitTypeName,
                  squareFootage,
                  scenarios,
                  analysisDate: new Date()
                })}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          )}
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="py-4 px-6 font-semibold text-gray-700">Scenario</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-700">Sales Price</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-700">Sales Costs</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-gray-700">Total Costs</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-white">Net Profit</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-white">Margin %</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-white">ROI %</TableHead>
                <TableHead className="py-4 px-6 font-semibold text-white">$/SqFt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario, index) => (
                <TableRow key={index} className={`hover:bg-gray-50 transition-colors ${scenario.label === 'Base Case' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <TableCell className="py-4 px-6">
                    <Badge className={`px-3 py-1 font-medium ${getBadgeColor(scenario.label)}`}>
                      {scenario.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 font-semibold text-gray-900">{formatCurrency(scenario.salesPrice)}</TableCell>
                  <TableCell className="py-4 px-6 text-gray-900 font-semibold">{formatCurrency(scenario.salesCosts)}</TableCell>
                  <TableCell className="py-4 px-6 text-gray-900 font-semibold">{formatCurrency(scenario.totalCosts)}</TableCell>
                  <TableCell className={`py-4 px-6 font-bold text-lg ${scenario.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(scenario.netProfit)}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className={`font-bold text-lg ${scenario.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(scenario.margin)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className={`font-bold text-lg ${(scenario.roi || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(scenario.roi || 0)}
                    </span>
                  </TableCell>
                  <TableCell className={`py-4 px-6 font-semibold ${scenario.profitPerSqFt >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(scenario.profitPerSqFt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}