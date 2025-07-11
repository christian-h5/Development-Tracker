
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CostInputToggle from "@/components/cost-input-toggle";
import type { UnitType, FuturePhaseDefaults, InsertFuturePhaseDefaults } from "@shared/schema";

interface FuturePhaseDefaultsProps {
  projectId: number;
}

export default function FuturePhaseDefaultsComponent({ projectId }: FuturePhaseDefaultsProps) {
  const [selectedUnitType, setSelectedUnitType] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [formData, setFormData] = useState({
    hardCosts: 0,
    softCosts: 0,
    landCosts: 0,
    contingencyCosts: 0,
    salesCosts: 0,
    lawyerFees: 0,
    hardCostsInputMethod: "perUnit" as const,
    softCostsInputMethod: "perUnit" as const,
    landCostsInputMethod: "perUnit" as const,
    contingencyCostsInputMethod: "perUnit" as const,
    salesCostsInputMethod: "perUnit" as const,
    lawyerFeesInputMethod: "perUnit" as const,
  });
  const { toast } = useToast();

  const { data: unitTypes = [] } = useQuery({
    queryKey: ["/api/unit-types"],
  });

  const { data: currentDefaults } = useQuery({
    queryKey: ["/api/future-phase-defaults", projectId, selectedUnitType],
    enabled: !!selectedUnitType,
  });

  useEffect(() => {
    if (currentDefaults) {
      setIsEnabled(currentDefaults.isActive);
      setFormData({
        hardCosts: parseFloat(currentDefaults.hardCosts || "0"),
        softCosts: parseFloat(currentDefaults.softCosts || "0"),
        landCosts: parseFloat(currentDefaults.landCosts || "0"),
        contingencyCosts: parseFloat(currentDefaults.contingencyCosts || "0"),
        salesCosts: parseFloat(currentDefaults.salesCosts || "0"),
        lawyerFees: parseFloat(currentDefaults.lawyerFees || "0"),
        hardCostsInputMethod: currentDefaults.hardCostsInputMethod || "perUnit",
        softCostsInputMethod: currentDefaults.softCostsInputMethod || "perUnit",
        landCostsInputMethod: currentDefaults.landCostsInputMethod || "perUnit",
        contingencyCostsInputMethod: currentDefaults.contingencyCostsInputMethod || "perUnit",
        salesCostsInputMethod: currentDefaults.salesCostsInputMethod || "perUnit",
        lawyerFeesInputMethod: currentDefaults.lawyerFeesInputMethod || "perUnit",
      });
    }
  }, [currentDefaults]);

  const saveDefaultsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUnitType) return;
      
      const data: InsertFuturePhaseDefaults = {
        projectId,
        unitTypeId: selectedUnitType,
        isActive: isEnabled,
        ...formData,
        hardCosts: formData.hardCosts.toString(),
        softCosts: formData.softCosts.toString(),
        landCosts: formData.landCosts.toString(),
        contingencyCosts: formData.contingencyCosts.toString(),
        salesCosts: formData.salesCosts.toString(),
        lawyerFees: formData.lawyerFees.toString(),
      };

      return await apiRequest("/api/future-phase-defaults", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/future-phase-defaults"] });
      toast({
        title: "Success",
        description: "Future phase defaults saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save future phase defaults",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveDefaultsMutation.mutate();
  };

  const handleCostChange = (
    field: keyof typeof formData,
    value: number,
    inputMethod: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      [`${field}InputMethod`]: inputMethod,
    }));
  };

  if (!selectedUnitType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Future Phase Defaults
          </CardTitle>
          <p className="text-sm text-gray-600">
            Set default cost structures that will automatically apply to new future phases
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select Unit Type</Label>
              <Select onValueChange={(value) => setSelectedUnitType(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a unit type to configure defaults" />
                </SelectTrigger>
                <SelectContent>
                  {unitTypes.map((unitType: UnitType) => (
                    <SelectItem key={unitType.id} value={unitType.id.toString()}>
                      {unitType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedUnitTypeName = unitTypes.find((ut: UnitType) => ut.id === selectedUnitType)?.name || "";
  const selectedUnitTypeSquareFootage = unitTypes.find((ut: UnitType) => ut.id === selectedUnitType)?.squareFootage || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Future Phase Defaults - {selectedUnitTypeName}
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedUnitType(null)}
          >
            Change Unit Type
          </Button>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            className="text-[#302d75]"
          />
          <Label>Apply these defaults to new future phases</Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CostInputToggle
            label="Hard Costs"
            value={formData.hardCosts}
            inputMethod={formData.hardCostsInputMethod}
            squareFootage={selectedUnitTypeSquareFootage}
            onChange={(value) => handleCostChange("hardCosts", parseFloat(value) || 0, formData.hardCostsInputMethod)}
            onToggleMethod={(method) => handleCostChange("hardCosts", parseFloat(formData.hardCosts) || 0, method)}
          />
          
          <CostInputToggle
            label="Soft Costs"
            value={formData.softCosts}
            inputMethod={formData.softCostsInputMethod}
            squareFootage={selectedUnitTypeSquareFootage}
            onChange={(value) => handleCostChange("softCosts", parseFloat(value) || 0, formData.softCostsInputMethod)}
            onToggleMethod={(method) => handleCostChange("softCosts", parseFloat(formData.softCosts) || 0, method)}
          />
          
          <CostInputToggle
            label="Land Costs"
            value={formData.landCosts}
            inputMethod={formData.landCostsInputMethod}
            squareFootage={selectedUnitTypeSquareFootage}
            onChange={(value) => handleCostChange("landCosts", parseFloat(value) || 0, formData.landCostsInputMethod)}
            onToggleMethod={(method) => handleCostChange("landCosts", parseFloat(formData.landCosts) || 0, method)}
          />
          
          <CostInputToggle
            label="Sales Costs"
            value={formData.salesCosts}
            inputMethod={formData.salesCostsInputMethod}
            squareFootage={selectedUnitTypeSquareFootage}
            onChange={(value) => handleCostChange("salesCosts", parseFloat(value) || 0, formData.salesCostsInputMethod)}
            onToggleMethod={(method) => handleCostChange("salesCosts", parseFloat(formData.salesCosts) || 0, method)}
          />
          
          <CostInputToggle
            label="Lawyer Fees"
            value={formData.lawyerFees}
            inputMethod={formData.lawyerFeesInputMethod}
            squareFootage={selectedUnitTypeSquareFootage}
            onChange={(value) => handleCostChange("lawyerFees", parseFloat(value) || 0, formData.lawyerFeesInputMethod)}
            onToggleMethod={(method) => handleCostChange("lawyerFees", parseFloat(formData.lawyerFees) || 0, method)}
          />
          
          <CostInputToggle
            label="Contingency"
            value={formData.contingencyCosts}
            inputMethod={formData.contingencyCostsInputMethod}
            squareFootage={selectedUnitTypeSquareFootage}
            onChange={(value) => handleCostChange("contingencyCosts", parseFloat(value) || 0, formData.contingencyCostsInputMethod)}
            onToggleMethod={(method) => handleCostChange("contingencyCosts", parseFloat(formData.contingencyCosts) || 0, method)}
            isContingency={true}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saveDefaultsMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveDefaultsMutation.isPending ? "Saving..." : "Save Defaults"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
