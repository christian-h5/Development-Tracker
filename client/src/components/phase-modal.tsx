import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, calculateSalesCosts, calculateNetProfit, calculateMargin, convertCostPerMethod } from "@/lib/calculations";
import CostInputToggle from "@/components/cost-input-toggle";
import type { PhaseWithUnits, UnitType, PhaseUnit } from "@shared/schema";

interface PhaseModalProps {
  phase: PhaseWithUnits | null;
  isNew: boolean;
  projectId: number;
  onClose: () => void;
  onSave: () => void;
}

interface UnitConfig {
  id?: number;
  unitTypeId: number;
  quantity: number;
  hardCosts: number;
  softCosts: number;
  landCosts: number;
  salesPrice: number;
  contingencyCosts: number;
  salesCosts: number;
  lawyerFees: number;
  hardCostsInputMethod: 'perUnit' | 'perSqFt';
  softCostsInputMethod: 'perUnit' | 'perSqFt';
  landCostsInputMethod: 'perUnit' | 'perSqFt';
  contingencyCostsInputMethod: 'perUnit' | 'perSqFt';
  salesCostsInputMethod: 'perUnit' | 'perSqFt';
  lawyerFeesInputMethod: 'perUnit' | 'perSqFt';
}

export default function PhaseModal({ phase, isNew, projectId, onClose, onSave }: PhaseModalProps) {
  const { toast } = useToast();
  const [phaseName, setPhaseName] = useState(phase?.name || "");
  const [phaseStatus, setPhaseStatus] = useState(phase?.status || "planned");
  const [totalSquareFootage, setTotalSquareFootage] = useState(phase?.totalSquareFootage?.toString() || "");
  const [unitConfigs, setUnitConfigs] = useState<UnitConfig[]>([]);

  const { data: unitTypes = [] } = useQuery<UnitType[]>({
    queryKey: ["/api/unit-types"],
  });

  const savePhaseMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isNew) {
        return apiRequest("POST", "/api/phases", data);
      } else {
        return apiRequest("PUT", `/api/phases/${phase!.id}`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "phases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "summary"] });
      toast({ title: "Phase saved successfully" });
      onSave();
    },
    onError: () => {
      toast({ title: "Failed to save phase", variant: "destructive" });
    },
  });

  const savePhaseUnitMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        return apiRequest("PUT", `/api/phase-units/${data.id}`, data);
      } else {
        return apiRequest("POST", "/api/phase-units", data);
      }
    },
  });

  useEffect(() => {
    if (phase?.units) {
      const configs = phase.units.map(unit => ({
        id: unit.id,
        unitTypeId: unit.unitTypeId,
        quantity: unit.quantity,
        hardCosts: parseFloat(unit.hardCosts || "0"),
        softCosts: parseFloat(unit.softCosts || "0"),
        landCosts: parseFloat(unit.landCosts || "0"),
        salesPrice: parseFloat(unit.salesPrice || "0"),
        contingencyCosts: parseFloat(unit.contingencyCosts || "0"),
        salesCosts: parseFloat(unit.salesCosts || "0"),
        lawyerFees: parseFloat(unit.lawyerFees || "0"),
        hardCostsInputMethod: (unit.hardCostsInputMethod as 'perUnit' | 'perSqFt') || 'perUnit',
        softCostsInputMethod: (unit.softCostsInputMethod as 'perUnit' | 'perSqFt') || 'perUnit',
        landCostsInputMethod: (unit.landCostsInputMethod as 'perUnit' | 'perSqFt') || 'perUnit',
        contingencyCostsInputMethod: (unit.contingencyCostsInputMethod as 'perUnit' | 'perSqFt') || 'perUnit',
        salesCostsInputMethod: (unit.salesCostsInputMethod as 'perUnit' | 'perSqFt') || 'perUnit',
        lawyerFeesInputMethod: (unit.lawyerFeesInputMethod as 'perUnit' | 'perSqFt') || 'perUnit',
      }));
      setUnitConfigs(configs);
    }
  }, [phase]);

  const addUnitConfig = () => {
    if (unitTypes.length > 0) {
      setUnitConfigs([...unitConfigs, {
        unitTypeId: unitTypes[0].id,
        quantity: 1,
        hardCosts: 0,
        softCosts: 0,
        landCosts: 0,
        salesPrice: 0,
        contingencyCosts: 0,
        salesCosts: 0,
        lawyerFees: 0,
        hardCostsInputMethod: 'perUnit',
        softCostsInputMethod: 'perUnit',
        landCostsInputMethod: 'perUnit',
        contingencyCostsInputMethod: 'perUnit',
        salesCostsInputMethod: 'perUnit',
        lawyerFeesInputMethod: 'perUnit',
      }]);
    }
  };

  const removeUnitConfig = (index: number) => {
    setUnitConfigs(unitConfigs.filter((_, i) => i !== index));
  };

  const updateUnitConfig = (index: number, field: keyof UnitConfig, value: any) => {
    const updated = [...unitConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setUnitConfigs(updated);
  };

  const getUnitType = (unitTypeId: number) => {
    return unitTypes.find(ut => ut.id === unitTypeId);
  };

  const calculateUnitMetrics = (config: UnitConfig) => {
    const unitType = getUnitType(config.unitTypeId);
    if (!unitType) return { salesCosts: 0, totalCosts: 0, netProfit: 0, margin: 0 };

    const hardCosts = convertCostPerMethod(config.hardCosts, config.hardCostsInputMethod, unitType.squareFootage);
    const softCosts = convertCostPerMethod(config.softCosts, config.softCostsInputMethod, unitType.squareFootage);
    const landCosts = convertCostPerMethod(config.landCosts, config.landCostsInputMethod, unitType.squareFootage);
    const contingencyCosts = convertCostPerMethod(config.contingencyCosts, config.contingencyCostsInputMethod, unitType.squareFootage);
    const salesCosts = convertCostPerMethod(config.salesCosts, config.salesCostsInputMethod, unitType.squareFootage);
    const lawyerFees = convertCostPerMethod(config.lawyerFees, config.lawyerFeesInputMethod, unitType.squareFootage);

    const totalCosts = hardCosts + softCosts + landCosts + contingencyCosts + salesCosts + lawyerFees;
    const netProfit = config.salesPrice - totalCosts;
    const margin = calculateMargin(config.salesPrice, netProfit);

    return { salesCosts, totalCosts, netProfit, margin };
  };

  const handleSave = async () => {
    try {
      // First save the phase
      const phaseData = {
        projectId,
        name: phaseName,
        status: phaseStatus,
        totalSquareFootage: totalSquareFootage ? parseInt(totalSquareFootage) : null,
      };

      const phaseResponse = await savePhaseMutation.mutateAsync(phaseData);
      const savedPhase = await phaseResponse.json();
      const phaseId = isNew ? savedPhase.id : phase!.id;

      // Then save all unit configurations
      for (const config of unitConfigs) {
        const unitType = getUnitType(config.unitTypeId);
        if (!unitType) continue;

        const unitData = {
          id: config.id,
          phaseId,
          unitTypeId: config.unitTypeId,
          quantity: config.quantity,
          hardCosts: config.hardCosts.toString(),
          softCosts: config.softCosts.toString(),
          landCosts: config.landCosts.toString(),
          salesPrice: config.salesPrice.toString(),
          contingencyCosts: config.contingencyCosts.toString(),
          salesCosts: config.salesCosts.toString(),
          lawyerFees: config.lawyerFees.toString(),
          hardCostsInputMethod: config.hardCostsInputMethod,
          softCostsInputMethod: config.softCostsInputMethod,
          landCostsInputMethod: config.landCostsInputMethod,
          contingencyCostsInputMethod: config.contingencyCostsInputMethod,
          salesCostsInputMethod: config.salesCostsInputMethod,
          lawyerFeesInputMethod: config.lawyerFeesInputMethod,
        };

        await savePhaseUnitMutation.mutateAsync(unitData);
      }

      onSave();
    } catch (error) {
      toast({ title: "Failed to save phase", variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add New Phase" : "Edit Phase"} - Details & Cost Input
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Phase Information */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Phase Information</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phaseName">Phase Name</Label>
                <Input
                  id="phaseName"
                  value={phaseName}
                  onChange={(e) => setPhaseName(e.target.value)}
                  placeholder="e.g., Phase 1"
                />
              </div>
              
              <div>
                <Label htmlFor="phaseStatus">Status</Label>
                <Select value={phaseStatus} onValueChange={setPhaseStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="totalSquareFootage">Total Square Footage</Label>
                <Input
                  id="totalSquareFootage"
                  type="number"
                  value={totalSquareFootage}
                  onChange={(e) => setTotalSquareFootage(e.target.value)}
                  placeholder="Total sq ft for phase"
                />
              </div>
            </div>

            {/* Unit Configuration */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-gray-900">Unit Configuration</h4>
                <Button onClick={addUnitConfig} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit Type
                </Button>
              </div>
              
              <div className="space-y-3">
                {unitConfigs.map((config, index) => {
                  const unitType = getUnitType(config.unitTypeId);
                  return (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <Select
                              value={config.unitTypeId.toString()}
                              onValueChange={(value) => updateUnitConfig(index, 'unitTypeId', parseInt(value))}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {unitTypes.map(ut => (
                                  <SelectItem key={ut.id} value={ut.id.toString()}>
                                    {ut.name} - {ut.squareFootage} sq ft
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {unitType && (
                              <Badge variant="outline">{unitType.squareFootage} sq ft each</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUnitConfig(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              value={config.quantity}
                              onChange={(e) => updateUnitConfig(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cost Input Section */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Cost Input</h4>
            
            {unitConfigs.map((config, index) => {
              const unitType = getUnitType(config.unitTypeId);
              const metrics = calculateUnitMetrics(config);
              
              return (
                <Card key={index} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium">{unitType?.name || 'Unit'}</h5>
                      <Badge variant="outline">{unitType?.squareFootage} sq ft</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <CostInputToggle
                        label="Hard Costs"
                        value={config.hardCosts.toString()}
                        onChange={(value) => updateUnitConfig(index, 'hardCosts', parseFloat(value) || 0)}
                        inputMethod={config.hardCostsInputMethod}
                        onToggleMethod={(method) => updateUnitConfig(index, 'hardCostsInputMethod', method)}
                        placeholder="Enter amount"
                      />
                      
                      <CostInputToggle
                        label="Soft Costs (excluding Land)"
                        value={config.softCosts.toString()}
                        onChange={(value) => updateUnitConfig(index, 'softCosts', parseFloat(value) || 0)}
                        inputMethod={config.softCostsInputMethod}
                        onToggleMethod={(method) => updateUnitConfig(index, 'softCostsInputMethod', method)}
                        placeholder="Enter amount"
                      />
                      
                      <CostInputToggle
                        label="Land Costs"
                        value={config.landCosts.toString()}
                        onChange={(value) => updateUnitConfig(index, 'landCosts', parseFloat(value) || 0)}
                        inputMethod={config.landCostsInputMethod}
                        onToggleMethod={(method) => updateUnitConfig(index, 'landCostsInputMethod', method)}
                        placeholder="Enter amount"
                      />
                      
                      <CostInputToggle
                        label="Contingency/Other Costs"
                        value={config.contingencyCosts.toString()}
                        onChange={(value) => updateUnitConfig(index, 'contingencyCosts', parseFloat(value) || 0)}
                        inputMethod={config.contingencyCostsInputMethod}
                        onToggleMethod={(method) => updateUnitConfig(index, 'contingencyCostsInputMethod', method)}
                        placeholder="Enter amount"
                      />
                      
                      <CostInputToggle
                        label="Sales Costs"
                        value={config.salesCosts.toString()}
                        onChange={(value) => updateUnitConfig(index, 'salesCosts', parseFloat(value) || 0)}
                        inputMethod={config.salesCostsInputMethod}
                        onToggleMethod={(method) => updateUnitConfig(index, 'salesCostsInputMethod', method)}
                        placeholder="Enter amount"
                      />
                      
                      <CostInputToggle
                        label="Lawyer Fees"
                        value={config.lawyerFees.toString()}
                        onChange={(value) => updateUnitConfig(index, 'lawyerFees', parseFloat(value) || 0)}
                        inputMethod={config.lawyerFeesInputMethod}
                        onToggleMethod={(method) => updateUnitConfig(index, 'lawyerFeesInputMethod', method)}
                        placeholder="Enter amount"
                      />
                      
                      <div>
                        <Label className="text-sm">Sales Price</Label>
                        <Input
                          type="number"
                          value={config.salesPrice}
                          onChange={(e) => updateUnitConfig(index, 'salesPrice', parseFloat(e.target.value) || 0)}
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 mt-4">
                      <h6 className="font-medium text-gray-900 mb-2">Cost Summary (Per Unit)</h6>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Total Costs:</span>
                          <span className="font-medium">{formatCurrency(metrics.totalCosts)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sales Price:</span>
                          <span className="font-medium">{formatCurrency(config.salesPrice)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-300 pt-1">
                          <span className="font-medium">Net Profit:</span>
                          <span className={`font-semibold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(metrics.netProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Margin:</span>
                          <span className={`font-semibold ${metrics.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metrics.margin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 px-6 pb-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={savePhaseMutation.isPending}>
            {savePhaseMutation.isPending ? "Saving..." : "Save Phase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
