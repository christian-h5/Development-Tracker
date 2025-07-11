import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatPercent, calculateSalesCosts, calculateNetProfit, calculateMargin, convertCostPerMethod } from "@/lib/calculations";
import type { PhaseWithUnits } from "@shared/schema";

interface PhaseTableProps {
  phases: PhaseWithUnits[];
  onEditPhase: (phase: PhaseWithUnits) => void;
  onViewPhase: (phase: PhaseWithUnits) => void;
  onDeletePhase: (phase: PhaseWithUnits) => void;
  onAddPhase: () => void;
}

export default function PhaseTable({ phases, onEditPhase, onViewPhase, onDeletePhase, onAddPhase }: PhaseTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in_progress':
        return 'bg-yellow-500 text-white';
      case 'future':
        return 'bg-blue-500 text-white';
      case 'planned':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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
    let unitTypes: { name: string; quantity: number; individuals: { unitName: string; salesPrice: number }[] }[] = [];

    phase.units.forEach(unit => {
      // Calculate individual unit prices from individualPrices array or use base sales price
      const individualPrices = unit.individualPrices ? JSON.parse(unit.individualPrices) : [];
      const baseSalesPrice = parseFloat(unit.salesPrice || "0");
      
      // Create individual unit entries
      const individuals: { unitName: string; salesPrice: number }[] = [];
      for (let i = 0; i < unit.quantity; i++) {
        const price = individualPrices[i] || baseSalesPrice;
        individuals.push({
          unitName: `Unit ${i + 1}`,
          salesPrice: price
        });
      }

      unitTypes.push({
        name: unit.unitType.name,
        quantity: unit.quantity,
        individuals
      });

      // Calculate costs PER UNIT using proper conversion methods
      const unitType = unit.unitType;
      const perUnitHardCosts = convertCostPerMethod(parseFloat(unit.hardCosts || "0"), unit.hardCostsInputMethod || 'perUnit', unitType.squareFootage);
      const perUnitSoftCosts = convertCostPerMethod(parseFloat(unit.softCosts || "0"), unit.softCostsInputMethod || 'perUnit', unitType.squareFootage);
      const perUnitLandCosts = convertCostPerMethod(parseFloat(unit.landCosts || "0"), unit.landCostsInputMethod || 'perUnit', unitType.squareFootage);
      const perUnitContingencyCosts = convertCostPerMethod(parseFloat(unit.contingencyCosts || "0"), unit.contingencyCostsInputMethod || 'perUnit', unitType.squareFootage);
      const perUnitConstructionFinancing = unit.useConstructionFinancing ? 
        convertCostPerMethod(parseFloat(unit.constructionFinancing || "0"), unit.constructionFinancingInputMethod || 'perUnit', unitType.squareFootage) : 0;
      const perUnitLawyerFees = convertCostPerMethod(parseFloat(unit.lawyerFees || "0"), unit.lawyerFeesInputMethod || 'perUnit', unitType.squareFootage);
      
      // Calculate per-unit sales costs based on individual prices or base price
      let totalUnitRevenue = 0;
      let totalUnitSalesCosts = 0;
      
      for (let i = 0; i < unit.quantity; i++) {
        const unitPrice = individualPrices[i] || baseSalesPrice;
        totalUnitRevenue += unitPrice;
        totalUnitSalesCosts += calculateSalesCosts(unitPrice);
      }

      // Total costs for this unit type = (per-unit costs * quantity) + total sales costs
      const unitTypeCosts = (perUnitHardCosts + perUnitSoftCosts + perUnitLandCosts + perUnitContingencyCosts + perUnitConstructionFinancing + perUnitLawyerFees) * unit.quantity + totalUnitSalesCosts;

      totalCosts += unitTypeCosts;
      totalRevenue += totalUnitRevenue;
    });

    const netProfit = totalRevenue - totalCosts;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

    return {
      totalCosts,
      totalRevenue,
      netProfit,
      margin,
      roi,
      unitTypes
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Phase Management</span>
          <Button 
            onClick={onAddPhase}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Phase
          </Button>
        </CardTitle>
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
                <TableHead>Total Profit</TableHead>
                <TableHead>ROI</TableHead>
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
                      <div className="space-y-2">
                        {metrics.unitTypes.map((unitType, index) => (
                          <div key={index} className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {unitType.name} ({unitType.quantity} units)
                            </Badge>
                            <div className="text-xs text-gray-600 ml-2">
                              {unitType.individuals.map((individual, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{unitType.name}: {individual.unitName}</span>
                                  <span className="font-medium">{formatCurrency(individual.salesPrice)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
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
                    <TableCell className={isProjected ? "text-gray-500" : ""}>
                      <span className={`font-semibold ${metrics.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(metrics.netProfit)}
                        {isProjected && "*"}
                      </span>
                    </TableCell>
                    <TableCell className={isProjected ? "text-gray-500" : ""}>
                      <span className={`font-semibold ${metrics.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatPercent(metrics.roi)}
                        {isProjected && "*"}
                      </span>
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
                          className="hover:bg-gray-50 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeletePhase(phase)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
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