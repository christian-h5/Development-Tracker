import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Eye } from "lucide-react";
import { formatCurrency, formatPercent, calculateSalesCosts, calculateNetProfit, calculateMargin } from "@/lib/calculations";
import type { PhaseWithUnits } from "@shared/schema";

interface PhaseTableProps {
  phases: PhaseWithUnits[];
  onEditPhase: (phase: PhaseWithUnits) => void;
  onViewPhase: (phase: PhaseWithUnits) => void;
}

export default function PhaseTable({ phases, onEditPhase, onViewPhase }: PhaseTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'in_progress':
        return 'bg-warning text-white';
      case 'planned':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'planned':
        return 'Planned';
      default:
        return status;
    }
  };

  const calculatePhaseMetrics = (phase: PhaseWithUnits) => {
    let totalCosts = 0;
    let totalRevenue = 0;
    let unitTypes: { name: string; quantity: number }[] = [];

    phase.units.forEach(unit => {
      unitTypes.push({
        name: unit.unitType.name,
        quantity: unit.quantity
      });

      if (unit.hardCosts && unit.softCosts && unit.landCosts && unit.contingencyCosts && unit.salesPrice) {
        const hardCosts = parseFloat(unit.hardCosts);
        const softCosts = parseFloat(unit.softCosts);
        const landCosts = parseFloat(unit.landCosts);
        const contingencyCosts = parseFloat(unit.contingencyCosts);
        const salesPrice = parseFloat(unit.salesPrice);

        const salesCosts = calculateSalesCosts(salesPrice);
        const unitTotalCosts = (hardCosts + softCosts + landCosts + contingencyCosts + salesCosts) * unit.quantity;
        const unitRevenue = salesPrice * unit.quantity;

        totalCosts += unitTotalCosts;
        totalRevenue += unitRevenue;
      }
    });

    const netProfit = totalRevenue - totalCosts;
    const margin = calculateMargin(totalRevenue, netProfit);

    return {
      totalCosts,
      totalRevenue,
      margin,
      unitTypes
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phase Management</CardTitle>
        <p className="text-gray-600 text-sm">Track costs, sales, and profitability for each development phase</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Types</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phases.map((phase) => {
                const metrics = calculatePhaseMetrics(phase);
                const isProjected = phase.status !== 'completed';
                
                return (
                  <TableRow key={phase.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">{phase.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(phase.status)}>
                        {getStatusLabel(phase.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {metrics.unitTypes.map((unitType, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {unitType.name} ({unitType.quantity})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className={isProjected ? "text-gray-500" : ""}>
                      {formatCurrency(metrics.totalCosts)}
                      {isProjected && "*"}
                    </TableCell>
                    <TableCell className={isProjected ? "text-gray-500" : ""}>
                      {formatCurrency(metrics.totalRevenue)}
                      {isProjected && "*"}
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${isProjected ? "text-gray-500" : "text-success"}`}>
                        {formatPercent(metrics.margin)}
                        {isProjected && "*"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPhase(phase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewPhase(phase)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          * Projected values for future phases
        </div>
      </CardContent>
    </Card>
  );
}
