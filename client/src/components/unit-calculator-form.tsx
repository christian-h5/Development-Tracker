import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, FileText, FileSpreadsheet, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculateSalesCosts, calculateNetProfit, calculateMargin, calculateProfitPerSqFt, formatCurrency, formatPercent } from "@/lib/calculations";
import SensitivityTable from "@/components/sensitivity-table";
import type { UnitType, CalculatorScenario } from "@shared/schema";

interface ScenarioData {
  salesPrice: number;
  salesCosts: number;
  totalCosts: number;
  netProfit: number;
  margin: number;
  profitPerSqFt: number;
}

export default function UnitCalculatorForm() {
  const { toast } = useToast();
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<number | null>(null);
  const [squareFootage, setSquareFootage] = useState("");
  const [hardCosts, setHardCosts] = useState("");
  const [softCosts, setSoftCosts] = useState("");
  const [landCosts, setLandCosts] = useState("");
  const [contingencyCosts, setContingencyCosts] = useState("");
  const [scenario1Price, setScenario1Price] = useState("");
  const [scenario2Price, setScenario2Price] = useState("");
  const [scenario3Price, setScenario3Price] = useState("");
  const [scenario4Price, setScenario4Price] = useState("");
  const [calculatedScenarios, setCalculatedScenarios] = useState<ScenarioData[]>([]);

  const { data: unitTypes = [] } = useQuery<UnitType[]>({
    queryKey: ["/api/unit-types"],
  });

  const { data: savedScenario } = useQuery<CalculatorScenario>({
    queryKey: ["/api/calculator", selectedUnitTypeId],
    enabled: !!selectedUnitTypeId,
  });

  const saveScenarioMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/calculator", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculator", selectedUnitTypeId] });
      toast({ title: "Scenario saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save scenario", variant: "destructive" });
    },
  });

  // Load saved scenario data when unit type is selected
  React.useEffect(() => {
    if (savedScenario) {
      setHardCosts(savedScenario.hardCosts || "");
      setSoftCosts(savedScenario.softCosts || "");
      setLandCosts(savedScenario.landCosts || "");
      setContingencyCosts(savedScenario.contingencyCosts || "");
      setScenario1Price(savedScenario.scenario1Price || "");
      setScenario2Price(savedScenario.scenario2Price || "");
      setScenario3Price(savedScenario.scenario3Price || "");
      setScenario4Price(savedScenario.scenario4Price || "");
    }
  }, [savedScenario]);

  // Update square footage when unit type changes
  React.useEffect(() => {
    if (selectedUnitTypeId) {
      const unitType = unitTypes.find(ut => ut.id === selectedUnitTypeId);
      if (unitType) {
        setSquareFootage(unitType.squareFootage.toString());
      }
    }
  }, [selectedUnitTypeId, unitTypes]);

  const selectedUnitType = unitTypes.find(ut => ut.id === selectedUnitTypeId);

  const calculateBaseCosts = () => {
    const hard = parseFloat(hardCosts) || 0;
    const soft = parseFloat(softCosts) || 0;
    const land = parseFloat(landCosts) || 0;
    const contingency = parseFloat(contingencyCosts) || 0;
    return hard + soft + land + contingency;
  };

  const calculateScenarios = () => {
    const baseCosts = calculateBaseCosts();
    const sqFt = parseFloat(squareFootage) || 1;
    
    const scenarios = [
      { label: "Conservative", price: parseFloat(scenario1Price) || 0 },
      { label: "Base Case", price: parseFloat(scenario2Price) || 0 },
      { label: "Optimistic", price: parseFloat(scenario3Price) || 0 },
      { label: "Premium", price: parseFloat(scenario4Price) || 0 },
    ].filter(s => s.price > 0);

    const calculated = scenarios.map(scenario => {
      const salesCosts = calculateSalesCosts(scenario.price);
      const totalCosts = baseCosts + salesCosts;
      const netProfit = scenario.price - totalCosts;
      const margin = calculateMargin(scenario.price, netProfit);
      const profitPerSqFt = calculateProfitPerSqFt(netProfit, sqFt);

      return {
        label: scenario.label,
        salesPrice: scenario.price,
        salesCosts,
        totalCosts,
        netProfit,
        margin,
        profitPerSqFt,
      };
    });

    setCalculatedScenarios(calculated);
  };

  const handleSaveScenario = async () => {
    if (!selectedUnitTypeId) {
      toast({ title: "Please select a unit type", variant: "destructive" });
      return;
    }

    const data = {
      unitTypeId: selectedUnitTypeId,
      hardCosts: hardCosts,
      softCosts: softCosts,
      landCosts: landCosts,
      contingencyCosts: contingencyCosts,
      scenario1Price: scenario1Price || null,
      scenario2Price: scenario2Price || null,
      scenario3Price: scenario3Price || null,
      scenario4Price: scenario4Price || null,
    };

    await saveScenarioMutation.mutateAsync(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Profitability Calculator</CardTitle>
        <p className="text-gray-600">Analyze margins and perform sensitivity analysis for individual unit types</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unit Configuration & Cost Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Configuration</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="unitType">Unit Type</Label>
                <Select onValueChange={(value) => setSelectedUnitTypeId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitTypes.map(unitType => (
                      <SelectItem key={unitType.id} value={unitType.id.toString()}>
                        {unitType.name} - {unitType.squareFootage} sq ft
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="squareFootage">Square Footage</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                  disabled={!!selectedUnitType}
                />
              </div>
            </div>

            <h4 className="text-md font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hardCosts">Hard Costs</Label>
                <Input
                  id="hardCosts"
                  type="number"
                  value={hardCosts}
                  onChange={(e) => setHardCosts(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <Label htmlFor="softCosts">Soft Costs (excluding Land)</Label>
                <Input
                  id="softCosts"
                  type="number"
                  value={softCosts}
                  onChange={(e) => setSoftCosts(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <Label htmlFor="landCosts">Land Costs</Label>
                <Input
                  id="landCosts"
                  type="number"
                  value={landCosts}
                  onChange={(e) => setLandCosts(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <Label htmlFor="contingencyCosts">Contingency/Other Costs</Label>
                <Input
                  id="contingencyCosts"
                  type="number"
                  value={contingencyCosts}
                  onChange={(e) => setContingencyCosts(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Base Costs:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculateBaseCosts())}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSaveScenario}
              disabled={!selectedUnitTypeId || saveScenarioMutation.isPending}
              className="mt-4 w-full"
              variant="outline"
            >
              {saveScenarioMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>

          {/* Sensitivity Analysis Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Scenarios</h3>
            <p className="text-gray-600 text-sm mb-4">
              Enter different sales price scenarios to analyze profitability impact
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="scenario1">Scenario 1 - Conservative</Label>
                <Input
                  id="scenario1"
                  type="number"
                  value={scenario1Price}
                  onChange={(e) => setScenario1Price(e.target.value)}
                  placeholder="Enter sales price"
                />
              </div>
              
              <div>
                <Label htmlFor="scenario2">Scenario 2 - Base Case</Label>
                <Input
                  id="scenario2"
                  type="number"
                  value={scenario2Price}
                  onChange={(e) => setScenario2Price(e.target.value)}
                  placeholder="Enter sales price"
                />
              </div>
              
              <div>
                <Label htmlFor="scenario3">Scenario 3 - Optimistic</Label>
                <Input
                  id="scenario3"
                  type="number"
                  value={scenario3Price}
                  onChange={(e) => setScenario3Price(e.target.value)}
                  placeholder="Enter sales price"
                />
              </div>
              
              <div>
                <Label htmlFor="scenario4">Scenario 4 - Premium</Label>
                <Input
                  id="scenario4"
                  type="number"
                  value={scenario4Price}
                  onChange={(e) => setScenario4Price(e.target.value)}
                  placeholder="Enter sales price"
                />
              </div>
            </div>

            <Button
              onClick={calculateScenarios}
              className="mt-6 w-full bg-primary hover:bg-primary/90"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Scenarios
            </Button>
          </div>
        </div>

        {/* Sensitivity Analysis Results */}
        {calculatedScenarios.length > 0 && (
          <div className="mt-8">
            <SensitivityTable scenarios={calculatedScenarios} />
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="text-primary mt-1 mr-2 h-4 w-4" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Sales Cost Calculation:</p>
                  <p>5% commission on first $100,000 + 3% on remaining balance</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
