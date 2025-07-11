import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import SensitivityTable from "./sensitivity-table";
import CostInputToggle from "./cost-input-toggle";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { calculateSalesCosts, calculateMargin, calculateProfitPerSqFt, calculateROI, formatCurrency } from "@/lib/calculations";
import type { CalculatorUnitType, CalculatorScenario, InsertCalculatorScenario } from "@shared/schema";

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

export default function UnitCalculatorForm() {
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<number | null>(null);
  const [squareFootage, setSquareFootage] = useState("");
  
  // Cost states
  const [hardCosts, setHardCosts] = useState("");
  const [softCosts, setSoftCosts] = useState("");
  const [landCosts, setLandCosts] = useState("");
  const [salesCosts, setSalesCosts] = useState("");
  const [contingencyCosts, setContingencyCosts] = useState("");
  const [lawyerFees, setLawyerFees] = useState("");
  const [constructionFinancing, setConstructionFinancing] = useState("");
  const [useConstructionFinancing, setUseConstructionFinancing] = useState(false);

  // Input method states
  const [hardCostsInputMethod, setHardCostsInputMethod] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [softCostsInputMethod, setSoftCostsInputMethod] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [landCostsInputMethod, setLandCostsInputMethod] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [contingencyCostsInputMethod, setContingencyCostsInputMethod] = useState<'perUnit' | 'perSqFt' | 'percentage'>('perUnit');
  const [salesCostsInputMethod, setSalesCostsInputMethod] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [lawyerFeesInputMethod, setLawyerFeesInputMethod] = useState<'perUnit' | 'perSqFt'>('perUnit');
  const [constructionFinancingInputMethod, setConstructionFinancingInputMethod] = useState<'perUnit' | 'perSqFt'>('perUnit');

  // Commission tier rates
  const [tier1Rate, setTier1Rate] = useState(5);
  const [tier2Rate, setTier2Rate] = useState(3);

  // Scenario price states
  const [scenario1Price, setScenario1Price] = useState("");
  const [additionalScenarios, setAdditionalScenarios] = useState<Array<{id: number, label: string, price: string}>>([]);
  const [nextScenarioId, setNextScenarioId] = useState(2);
  
  const [calculatedScenarios, setCalculatedScenarios] = useState<ScenarioData[]>([]);

  const { toast } = useToast();

  // Helper functions for managing scenarios
  const addScenario = () => {
    setAdditionalScenarios(prev => [...prev, {
      id: nextScenarioId,
      label: `Scenario ${nextScenarioId - 1}`,
      price: ""
    }]);
    setNextScenarioId(prev => prev + 1);
  };

  const removeScenario = (id: number) => {
    setAdditionalScenarios(prev => prev.filter(scenario => scenario.id !== id));
  };

  const updateScenarioPrice = (id: number, price: string) => {
    setAdditionalScenarios(prev =>
      prev.map(scenario =>
        scenario.id === id ? { ...scenario, price } : scenario
      )
    );
  };

  // Query for calculator unit types
  const { data: calculatorUnitTypes = [] } = useQuery({
    queryKey: ["/api/calculator-unit-types"],
  });

  // Query for saved scenario
  const { data: savedScenario } = useQuery<CalculatorScenario>({
    queryKey: ["/api/calculator", selectedUnitTypeId],
    enabled: !!selectedUnitTypeId,
  });

  // Save scenario mutation
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
      setConstructionFinancing(savedScenario.constructionFinancing || "");
      setUseConstructionFinancing(savedScenario.useConstructionFinancing || false);
      setHardCostsInputMethod(savedScenario.hardCostsInputMethod as 'perUnit' | 'perSqFt');
      setSoftCostsInputMethod(savedScenario.softCostsInputMethod as 'perUnit' | 'perSqFt');
      setLandCostsInputMethod(savedScenario.landCostsInputMethod as 'perUnit' | 'perSqFt');
      setContingencyCostsInputMethod(savedScenario.contingencyCostsInputMethod as 'perUnit' | 'perSqFt' | 'percentage');
      setSalesCostsInputMethod(savedScenario.salesCostsInputMethod as 'perUnit' | 'perSqFt');
      setLawyerFeesInputMethod(savedScenario.lawyerFeesInputMethod as 'perUnit' | 'perSqFt');
      setConstructionFinancingInputMethod(savedScenario.constructionFinancingInputMethod as 'perUnit' | 'perSqFt');
      setScenario1Price(savedScenario.scenario1Price || "");
      // Load additional scenarios if they exist in saved data
      const additionalScenariosFromSaved = [];
      if ((savedScenario as any).scenario2Price) {
        additionalScenariosFromSaved.push({ id: 2, label: "Scenario 1", price: (savedScenario as any).scenario2Price });
      }
      if ((savedScenario as any).scenario3Price) {
        additionalScenariosFromSaved.push({ id: 3, label: "Scenario 2", price: (savedScenario as any).scenario3Price });
      }
      if ((savedScenario as any).scenario4Price) {
        additionalScenariosFromSaved.push({ id: 4, label: "Scenario 3", price: (savedScenario as any).scenario4Price });
      }
      setAdditionalScenarios(additionalScenariosFromSaved);
      setNextScenarioId(Math.max(5, ...additionalScenariosFromSaved.map(s => s.id + 1)));
    }
  }, [savedScenario]);

  // Update square footage when unit type changes
  useEffect(() => {
    if (selectedUnitTypeId) {
      const unitType = calculatorUnitTypes.find(ut => ut.id === selectedUnitTypeId);
      if (unitType) {
        setSquareFootage(unitType.squareFootage.toString());
      }
    }
  }, [selectedUnitTypeId, calculatorUnitTypes]);

  const selectedUnitType = calculatorUnitTypes.find(ut => ut.id === selectedUnitTypeId);

  const convertCostPerMethod = (value: number, method: 'perUnit' | 'perSqFt' | 'percentage', sqFt: number, baseValue?: number): number => {
    if (method === 'perSqFt') {
      return value * sqFt;
    } else if (method === 'percentage' && baseValue) {
      return (value / 100) * baseValue;
    }
    return value;
  };

  const calculateBaseCosts = () => {
    const sqFt = parseFloat(squareFootage) || 1;
    const hard = convertCostPerMethod(parseFloat(hardCosts) || 0, hardCostsInputMethod, sqFt);
    const soft = convertCostPerMethod(parseFloat(softCosts) || 0, softCostsInputMethod, sqFt);
    const land = convertCostPerMethod(parseFloat(landCosts) || 0, landCostsInputMethod, sqFt);
    const contingency = convertCostPerMethod(parseFloat(contingencyCosts) || 0, contingencyCostsInputMethod, sqFt);
    const lawyer = convertCostPerMethod(parseFloat(lawyerFees) || 0, lawyerFeesInputMethod, sqFt);
    const construction = useConstructionFinancing ? convertCostPerMethod(parseFloat(constructionFinancing) || 0, constructionFinancingInputMethod, sqFt) : 0;

    // Use manual sales costs if provided, otherwise calculate tiered commission based on base case price
    let sales = convertCostPerMethod(parseFloat(salesCosts) || 0, salesCostsInputMethod, sqFt);
    if (!salesCosts || parseFloat(salesCosts) === 0) {
      const basePrice = parseFloat(scenario1Price) || 0;
      if (basePrice > 0) {
        sales = calculateSalesCosts(basePrice);
      }
    }

    return hard + soft + land + contingency + sales + lawyer + construction;
  };

  const calculateScenarios = () => {
    const sqFt = parseFloat(squareFootage) || 1;
    const hardCost = convertCostPerMethod(parseFloat(hardCosts) || 0, hardCostsInputMethod, sqFt);
    const softCost = convertCostPerMethod(parseFloat(softCosts) || 0, softCostsInputMethod, sqFt);
    const landCost = convertCostPerMethod(parseFloat(landCosts) || 0, landCostsInputMethod, sqFt);
    const contingencyCost = convertCostPerMethod(parseFloat(contingencyCosts) || 0, contingencyCostsInputMethod, sqFt);
    const lawyerFee = convertCostPerMethod(parseFloat(lawyerFees) || 0, lawyerFeesInputMethod, sqFt);
    const constructionCost = useConstructionFinancing ? convertCostPerMethod(parseFloat(constructionFinancing) || 0, constructionFinancingInputMethod, sqFt) : 0;

    const scenarios = [
      { label: "Base Case", price: parseFloat(scenario1Price) || 0 },
      ...additionalScenarios.map(scenario => ({
        label: scenario.label,
        price: parseFloat(scenario.price) || 0
      }))
    ].filter(s => s.price > 0);

    const calculated = scenarios.map(scenario => {
      // Use manual sales costs if provided, otherwise calculate tiered commission
      let salesCost = convertCostPerMethod(parseFloat(salesCosts) || 0, salesCostsInputMethod, sqFt);
      if (!salesCosts || parseFloat(salesCosts) === 0) {
        salesCost = calculateSalesCosts(scenario.price);
      }

      const totalCosts = hardCost + softCost + landCost + contingencyCost + salesCost + lawyerFee + constructionCost;
      const netProfit = scenario.price - totalCosts;
      const margin = calculateMargin(netProfit, scenario.price);
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
      calculatorUnitTypeId: selectedUnitTypeId,
      hardCosts: hardCosts,
      softCosts: softCosts,
      landCosts: landCosts,
      contingencyCosts: contingencyCosts,
      salesCosts: salesCosts,
      lawyerFees: lawyerFees,
      constructionFinancing: constructionFinancing,
      useConstructionFinancing: useConstructionFinancing,
      hardCostsInputMethod: hardCostsInputMethod,
      softCostsInputMethod: softCostsInputMethod,
      landCostsInputMethod: landCostsInputMethod,
      contingencyCostsInputMethod: contingencyCostsInputMethod,
      salesCostsInputMethod: salesCostsInputMethod,
      lawyerFeesInputMethod: lawyerFeesInputMethod,
      constructionFinancingInputMethod: constructionFinancingInputMethod,
      scenario1Price: scenario1Price || null,
      scenario2Price: additionalScenarios.find(s => s.id === 2)?.price || null,
      scenario3Price: additionalScenarios.find(s => s.id === 3)?.price || null,
      scenario4Price: additionalScenarios.find(s => s.id === 4)?.price || null,
    };

    await saveScenarioMutation.mutateAsync(data);
  };



  if (!calculatorUnitTypes) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading calculator unit types...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Profitability Calculator</CardTitle>
        <p className="text-gray-600">Analyze margins and perform sensitivity analysis for individual unit types</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Unit Configuration & Cost Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Configuration</h3>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="unitType">Unit Type</Label>
                <Select onValueChange={(value) => {
                  const unitTypeId = parseInt(value);
                  const selectedUnitType = calculatorUnitTypes.find((ut: CalculatorUnitType) => ut.id === unitTypeId);
                  
                  if (selectedUnitType) {
                    setSelectedUnitTypeId(unitTypeId);
                    setSquareFootage(selectedUnitType.squareFootage.toString());
                  }
                }}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {calculatorUnitTypes.map((unitType: CalculatorUnitType) => (
                      <SelectItem key={unitType.id} value={unitType.id.toString()} className="text-gray-900 hover:bg-gray-100">
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
                  disabled={!!selectedUnitTypeId}
                />
              </div>
            </div>

            <h4 className="text-md font-semibold text-gray-900 mb-4">Cost Breakdown</h4>
            <div className="space-y-4">
              <CostInputToggle
                label="Hard Costs"
                value={hardCosts}
                onChange={setHardCosts}
                inputMethod={hardCostsInputMethod}
                onToggleMethod={setHardCostsInputMethod}
                squareFootage={parseFloat(squareFootage) || 1}
              />

              <CostInputToggle
                label="Soft Costs (excluding Land)"
                value={softCosts}
                onChange={setSoftCosts}
                inputMethod={softCostsInputMethod}
                onToggleMethod={setSoftCostsInputMethod}
                squareFootage={parseFloat(squareFootage) || 1}
              />

              <CostInputToggle
                label="Land Costs"
                value={landCosts}
                onChange={setLandCosts}
                inputMethod={landCostsInputMethod}
                onToggleMethod={setLandCostsInputMethod}
                squareFootage={parseFloat(squareFootage) || 1}
              />

              <CostInputToggle
                label="Sales Costs (Commission + Legal)"
                value={salesCosts}
                onChange={setSalesCosts}
                inputMethod={salesCostsInputMethod}
                onToggleMethod={setSalesCostsInputMethod}
                squareFootage={parseFloat(squareFootage) || 1}
                isSalesCosts={true}
                salesPrice={parseFloat(scenario1Price) || 0}
                lawyerFees={lawyerFees}
                onLawyerFeesChange={setLawyerFees}
                tier1Rate={tier1Rate}
                tier2Rate={tier2Rate}
                onTierRateChange={(tier, rate) => {
                  if (tier === 1) setTier1Rate(rate);
                  if (tier === 2) setTier2Rate(rate);
                }}
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

              <CostInputToggle
                label="Construction Financing"
                value={constructionFinancing}
                onChange={setConstructionFinancing}
                inputMethod={constructionFinancingInputMethod}
                onToggleMethod={setConstructionFinancingInputMethod}
                squareFootage={parseFloat(squareFootage) || 1}
                isConstructionFinancing={true}
                useConstructionFinancing={useConstructionFinancing}
                onToggleConstructionFinancing={setUseConstructionFinancing}
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

              {additionalScenarios.map((scenario) => (
                <div key={scenario.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`scenario${scenario.id}`}>{scenario.label}</Label>
                    <Input
                      id={`scenario${scenario.id}`}
                      type="number"
                      value={scenario.price}
                      onChange={(e) => updateScenarioPrice(scenario.id, e.target.value)}
                      placeholder="Enter sales price"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeScenario(scenario.id)}
                    className="mb-0 h-10 px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addScenario}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Scenario
              </Button>
            </div>

            <Button
              onClick={calculateScenarios}
              disabled={!scenario1Price}
              className="mt-6 w-full"
            >
              Calculate Scenarios
            </Button>

          </div>
        </div>

        {/* Full-width results section */}
        {calculatedScenarios.length > 0 && (
          <div className="mt-10 border-t pt-8">
            <SensitivityTable 
              scenarios={calculatedScenarios} 
              basePrice={parseFloat(scenario1Price) || 0}
              onGenerateSensitivity={setCalculatedScenarios}
              unitTypeName={selectedUnitType?.name || "Unit Type"}
              squareFootage={parseFloat(squareFootage) || 0}
              projectName="Unit Calculator Analysis"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}