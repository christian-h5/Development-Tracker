The code is updated to include missing imports, properly initialize state variables, and address potential type safety issues by modifying state management within the UnitCalculatorForm component.
```

```replit_final_file
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, FileSpreadsheet, Calculator } from "lucide-react";
import SensitivityTable from "./sensitivity-table";
import CostInputToggle from "./cost-input-toggle";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculateSalesCosts, calculateNetProfit, calculateMargin, calculateProfitPerSqFt, calculateROI, calculateNetProfitWithCustomCosts, convertCostPerMethod, formatCurrency, formatPercent } from "@/lib/calculations";
import type { UnitType, CalculatorScenario } from "@shared/schema";
interface ScenarioData {
  salesPrice: number;
  salesCosts: number;
  totalCosts: number;
  netProfit: number;
  margin: number;
  profitPerSqFt: number;
  roi: number;
}

export default function UnitCalculatorForm() {
  const [unitTypeId, setUnitTypeId] = useState<string>("");
  const [unitTypeName, setUnitTypeName] = useState<string>("");
  const [squareFootage, setSquareFootage] = useState<string>("");
  const [salesPrice, setSalesPrice] = useState<string>("");

  // Cost states
  const [hardCosts, setHardCosts] = useState<string>("");
  const [softCosts, setSoftCosts] = useState<string>("");
  const [landCosts, setLandCosts] = useState<string>("");
  const [salesCosts, setSalesCosts] = useState<string>("");

  // Input method states
  const [hardCostsInputMethod, setHardCostsInputMethod] = useState<'total' | 'per_sqft'>('total');
  const [softCostsInputMethod, setSoftCostsInputMethod] = useState<'total' | 'per_sqft'>('total');
  const [landCostsInputMethod, setLandCostsInputMethod] = useState<'total' | 'per_sqft'>('total');
  const [salesCostsInputMethod, setSalesCostsInputMethod] = useState<'total' | 'per_sqft'>('total');

  const [scenarios, setScenarios] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Query for unit types
  const { data: unitTypes = [] } = useQuery({
    queryKey: ["/api/unit-types"],
  });
  const { toast } = useToast();
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<number | null>(null);
  const [hardCostsInputMethodState, setHardCostsInputMethodState] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [softCostsInputMethodState, setSoftCostsInputMethodState] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [landCostsInputMethodState, setLandCostsInputMethodState] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [contingencyCostsInputMethod, setContingencyCostsInputMethod] = useState<'perUnit' | 'perSqFt' | 'percentage'>('perUnit');
  const [salesCostsInputMethodState, setSalesCostsInputMethodState] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [lawyerFeesInputMethod, setLawyerFeesInputMethod] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [contingencyCosts, setContingencyCosts] = useState("");
  const [lawyerFees, setLawyerFees] = useState("");
  const [scenario1Price, setScenario1Price] = useState("");
  const [scenario2Price, setScenario2Price] = useState("");
  const [scenario3Price, setScenario3Price] = useState("");
  const [scenario4Price, setScenario4Price] = useState("");
  const [calculatedScenarios, setCalculatedScenarios] = useState<ScenarioData[]>([]);
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
  useEffect(() => {
    if (savedScenario) {
      setHardCosts(savedScenario.hardCosts || "");
      setSoftCosts(savedScenario.softCosts || "");
      setLandCosts(savedScenario.landCosts || "");
      setContingencyCosts(savedScenario.contingencyCosts || "");
      setSalesCosts(savedScenario.salesCosts || "");
      setLawyerFees(savedScenario.lawyerFees || "");
      setHardCostsInputMethodState(savedScenario.hardCostsInputMethod as 'perUnit' | 'perSqFt');
      setSoftCostsInputMethodState(savedScenario.softCostsInputMethod as 'perUnit' | 'perSqFt');
      setLandCostsInputMethodState(savedScenario.landCostsInputMethod as 'perUnit' | 'perSqFt');
      setContingencyCostsInputMethod(savedScenario.contingencyCostsInputMethod as 'perUnit' | 'perSqFt');
      setSalesCostsInputMethodState(savedScenario.salesCostsInputMethod as 'perUnit' | 'perSqFt');
      setLawyerFeesInputMethod(savedScenario.lawyerFeesInputMethod as 'perUnit' | 'perSqFt');
      setScenario1Price(savedScenario.scenario1Price || "");
      setScenario2Price(savedScenario.scenario2Price || "");
      setScenario3Price(savedScenario.scenario3Price || "");
      setScenario4Price(savedScenario.scenario4Price || "");
    }
  }, [savedScenario]);

  // Update square footage when unit type changes
  useEffect(() => {
    if (selectedUnitTypeId) {
      const unitType = unitTypes.find(ut => ut.id === selectedUnitTypeId);
      if (unitType) {
        setSquareFootage(unitType.squareFootage.toString());
      }
    }
  }, [selectedUnitTypeId, unitTypes]);

  const selectedUnitType = unitTypes.find(ut => ut.id === selectedUnitTypeId);

  const calculateBaseCosts = () => {
    const sqFt = parseFloat(squareFootage) || 1;
    const hard = convertCostPerMethod(parseFloat(hardCosts) || 0, hardCostsInputMethodState, sqFt);
    const soft = convertCostPerMethod(parseFloat(softCosts) || 0, softCostsInputMethodState, sqFt);
    const land = convertCostPerMethod(parseFloat(landCosts) || 0, landCostsInputMethodState, sqFt);
    const contingency = convertCostPerMethod(parseFloat(contingencyCosts) || 0, contingencyCostsInputMethod, sqFt);
    const lawyer = convertCostPerMethod(parseFloat(lawyerFees) || 0, lawyerFeesInputMethod, sqFt);

    // Use manual sales costs if provided, otherwise calculate tiered commission based on base case price
    let sales = convertCostPerMethod(parseFloat(salesCosts) || 0, salesCostsInputMethodState, sqFt);
    if (!salesCosts || parseFloat(salesCosts) === 0) {
      const basePrice = parseFloat(scenario1Price) || 0;
      if (basePrice > 0) {
        sales = calculateSalesCosts(basePrice);
      }
    }

    return hard + soft + land + contingency + sales + lawyer;
  };

  const calculateScenarios = () => {
    const sqFt = parseFloat(squareFootage) || 1;
    const hardCost = convertCostPerMethod(parseFloat(hardCosts) || 0, hardCostsInputMethodState, sqFt);
    const softCost = convertCostPerMethod(parseFloat(softCosts) || 0, softCostsInputMethodState, sqFt);
    const landCost = convertCostPerMethod(parseFloat(landCosts) || 0, landCostsInputMethodState, sqFt);
    const contingencyCost = convertCostPerMethod(parseFloat(contingencyCosts) || 0, contingencyCostsInputMethod, sqFt);
    const lawyerFee = convertCostPerMethod(parseFloat(lawyerFees) || 0, lawyerFeesInputMethod, sqFt);

    const scenarios = [
      { label: "Base Case", price: parseFloat(scenario1Price) || 0 },
      { label: "Scenario 1", price: parseFloat(scenario2Price) || 0 },
      { label: "Scenario 2", price: parseFloat(scenario3Price) || 0 },
      { label: "Scenario 3", price: parseFloat(scenario4Price) || 0 },
    ].filter(s => s.price > 0);

    const calculated = scenarios.map(scenario => {
      // Use manual sales costs if provided, otherwise calculate tiered commission
      let salesCost = convertCostPerMethod(parseFloat(salesCosts) || 0, salesCostsInputMethodState, sqFt);
      if (!salesCosts || parseFloat(salesCosts) === 0) {
        salesCost = calculateSalesCosts(scenario.price);
      }

      const totalCosts = hardCost + softCost + landCost + contingencyCost + salesCost + lawyerFee;
      const netProfit = scenario.price - totalCosts;
      const margin = calculateMargin(scenario.price, netProfit);
      const profitPerSqFt = calculateProfitPerSqFt(netProfit, sqFt);
      const roi = calculateROI(netProfit, totalCosts);

      return {
        label: scenario.label,
        salesPrice: scenario.price,
        salesCosts: salesCost,
        totalCosts,
        netProfit,
        margin,
        profitPerSqFt,
        roi,
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
      salesCosts: salesCosts,
      lawyerFees: lawyerFees,
      hardCostsInputMethod: hardCostsInputMethodState,
      softCostsInputMethod: softCostsInputMethodState,
      landCostsInputMethod: landCostsInputMethodState,
      contingencyCostsInputMethod: contingencyCostsInputMethod,
      salesCostsInputMethod: salesCostsInputMethodState,
      lawyerFeesInputMethod: lawyerFeesInputMethod,
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
              <CostInputToggle
                label="Hard Costs"
                value={hardCosts}
                onChange={setHardCosts}
                inputMethod={hardCostsInputMethodState}
                onToggleMethod={setHardCostsInputMethodState}
                squareFootage={parseFloat(squareFootage) || 1}
              />

              <CostInputToggle
                label="Soft Costs (excluding Land)"
                value={softCosts}
                onChange={setSoftCosts}
                inputMethod={softCostsInputMethodState}
                onToggleMethod={setSoftCostsInputMethodState}
                squareFootage={parseFloat(squareFootage) || 1}
              />

              <CostInputToggle
                label="Land Costs"
                value={landCosts}
                onChange={setLandCosts}
                inputMethod={landCostsInputMethodState}
                onToggleMethod={setLandCostsInputMethodState}
                squareFootage={parseFloat(squareFootage) || 1}
              />

              <CostInputToggle
                label="Sales Costs (5% on first $100k, 3% on balance)"
                value={salesCosts}
                onChange={setSalesCosts}
                inputMethod={salesCostsInputMethodState}
                onToggleMethod={setSalesCostsInputMethodState}
                squareFootage={parseFloat(squareFootage) || 1}
                isSalesCosts={true}
                salesPrice={parseFloat(scenario2Price) || 0}
              />

              <CostInputToggle
                label="Lawyer Fees"
                value={lawyerFees}
                onChange={setLawyerFees}
                inputMethod={lawyerFeesInputMethod}
                onToggleMethod={setLawyerFeesInputMethod}
                squareFootage={parseFloat(squareFootage) || 1}
              />

              <CostInputToggle
                label="Contingency/Other Costs"
                value={contingencyCosts}
                onChange={setContingencyCosts}
                inputMethod={contingencyCostsInputMethod}
                onToggleMethod={setContingencyCostsInputMethod}
                squareFootage={parseFloat(squareFootage) || 1}
                isContingency={true}
                totalCosts={calculateBaseCosts()}
              />
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
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {saveScenarioMutation.isPending ? "Saving Configuration..." : "Save Configuration"}
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
                <Label htmlFor="scenario1">Base Case</Label>
                <Input
                  id="scenario1"
                  type="number"
                  value={scenario1Price}
                  onChange={(e) => setScenario1Price(e.target.value)}
                  placeholder="Enter sales price"
                />
              </div>

              <div>
                <Label htmlFor="scenario2">Scenario 1</Label>
                <Input
                  id="scenario2"
                  type="number"
                  value={scenario2Price}
                  onChange={(e) => setScenario2Price(e.target.value)}
                  placeholder="Enter sales price"
                />
              </div>

              <div>
                <Label htmlFor="scenario3">Scenario 2</Label>
                <Input
                  id="scenario3"
                  type="number"
                  value={scenario3Price}
                  onChange={(e) => setScenario3Price(e.target.value)}
                  placeholder="Enter sales price"
                />
              </div>

              <div>
                <Label htmlFor="scenario4">Scenario 3</Label>
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
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Profitability Scenarios
            </Button>
          </div>
        </div>

        {/* Sensitivity Analysis Results */}
        {calculatedScenarios.length > 0 && (
          <div className="mt-8">
            <SensitivityTable
              scenarios={calculatedScenarios}
              basePrice={parseFloat(scenario1Price) || 0}
              onGenerateSensitivity={setCalculatedScenarios}
            />

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Info className="text-primary mt-1 mr-2 h-4 w-4" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Cost Input Methods:</p>
                  <p>Toggle between "Per Unit" (total cost per unit) and "Per Sq Ft" (cost multiplied by square footage)</p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 font-medium">
                <FileText className="mr-2 h-4 w-4" />
                Export to PDF
              </Button>
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 font-medium">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}