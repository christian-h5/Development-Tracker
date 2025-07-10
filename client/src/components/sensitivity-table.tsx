import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@/lib/calculations";

interface ScenarioData {
  label: string;
  salesPrice: number;
  salesCosts: number;
  totalCosts: number;
  netProfit: number;
  margin: number;
  profitPerSqFt: number;
}

interface SensitivityTableProps {
  scenarios: ScenarioData[];
}

export default function SensitivityTable({ scenarios }: SensitivityTableProps) {
  const getBadgeColor = (label: string) => {
    switch (label) {
      case 'Conservative':
        return 'bg-gray-100 text-gray-800';
      case 'Base Case':
        return 'bg-primary text-white';
      case 'Optimistic':
        return 'bg-success text-white';
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
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profitability Analysis</h3>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scenario</TableHead>
              <TableHead>Sales Price</TableHead>
              <TableHead>Sales Costs</TableHead>
              <TableHead>Total Costs</TableHead>
              <TableHead>Net Profit</TableHead>
              <TableHead>Margin %</TableHead>
              <TableHead>$/SqFt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scenarios.map((scenario, index) => (
              <TableRow key={index} className={scenario.label === 'Base Case' ? 'bg-blue-50' : ''}>
                <TableCell>
                  <Badge className={getBadgeColor(scenario.label)}>
                    {scenario.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(scenario.salesPrice)}</TableCell>
                <TableCell>{formatCurrency(scenario.salesCosts)}</TableCell>
                <TableCell>{formatCurrency(scenario.totalCosts)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(scenario.netProfit)}</TableCell>
                <TableCell>
                  <span className={`font-semibold ${getMarginColor(scenario.margin)}`}>
                    {formatPercent(scenario.margin)}
                  </span>
                </TableCell>
                <TableCell>{formatCurrency(scenario.profitPerSqFt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
