import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calculator, Home, Building2 } from "lucide-react";

interface CostInputToggleProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMethod: 'perUnit' | 'perSqFt' | 'percentage';
  onToggleMethod: (method: 'perUnit' | 'perSqFt' | 'percentage') => void;
  disabled?: boolean;
  placeholder?: string;
  squareFootage?: number;
  isSalesCosts?: boolean;
  salesPrice?: number;
  isContingency?: boolean;
  totalCosts?: number;
  lawyerFees?: string;
  onLawyerFeesChange?: (value: string) => void;
  tier1Rate?: number;
  tier2Rate?: number;
  onTierRateChange?: (tier: 1 | 2, rate: number) => void;
  isConstructionFinancing?: boolean;
  useConstructionFinancing?: boolean;
  onToggleConstructionFinancing?: (enabled: boolean) => void;
}

export default function CostInputToggle({
  label,
  value,
  onChange,
  inputMethod,
  onToggleMethod,
  disabled = false,
  placeholder = "Enter amount",
  squareFootage = 1,
  isSalesCosts = false,
  salesPrice = 0,
  isContingency = false,
  totalCosts = 0,
  lawyerFees = "0",
  onLawyerFeesChange,
  tier1Rate = 5,
  tier2Rate = 3,
  onTierRateChange,
  isConstructionFinancing = false,
  useConstructionFinancing = false,
  onToggleConstructionFinancing
}: CostInputToggleProps) {
  const numericValue = parseFloat(value) || 0;

  // Calculate the converted value
  const getConvertedValue = () => {
    if (!numericValue) return null;

    if (inputMethod === 'perSqFt' && squareFootage) {
      // Show per unit equivalent
      return numericValue * squareFootage;
    } else if (inputMethod === 'perUnit' && squareFootage) {
      // Show per sq ft equivalent
      return numericValue / squareFootage;
    } else if (inputMethod === 'percentage' && totalCosts) {
      // Show dollar amount from percentage
      return (numericValue / 100) * totalCosts;
    }
    return null;
  };

  // Calculate tiered commission if this is sales costs
  const calculateTieredCommission = () => {
    if (!isSalesCosts || !salesPrice) return null;

    const first100k = Math.min(salesPrice, 100000);
    const balance = Math.max(0, salesPrice - 100000);
    return (first100k * (tier1Rate / 100)) + (balance * (tier2Rate / 100));
  };

  const convertedValue = getConvertedValue();
  const tieredCommission = calculateTieredCommission();

  return (
    <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        {label}
      </Label>

      {isSalesCosts && (
        <div className="space-y-3">
          <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Tiered Commission Structure</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium mb-1">First $100k Rate</label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={tier1Rate}
                    onChange={(e) => onTierRateChange && onTierRateChange(1, parseFloat(e.target.value) || 5)}
                    className="h-6 text-xs w-16"
                    step="0.1"
                    min="0"
                    max="10"
                  />
                  <span className="ml-1 text-xs">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Balance Rate</label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={tier2Rate}
                    onChange={(e) => onTierRateChange && onTierRateChange(2, parseFloat(e.target.value) || 3)}
                    className="h-6 text-xs w-16"
                    step="0.1"
                    min="0"
                    max="10"
                  />
                  <span className="ml-1 text-xs">%</span>
                </div>
              </div>
            </div>
            {tieredCommission !== null && salesPrice > 0 && (
              <div className="mt-2 font-medium text-blue-700">
                Auto-calculated Commission: ${tieredCommission.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="block text-xs font-medium mb-2 text-gray-700">Lawyer Fees</label>
            <Input
              type="number"
              value={lawyerFees}
              onChange={(e) => onLawyerFeesChange && onLawyerFeesChange(e.target.value)}
              placeholder="Enter lawyer fees"
              className="h-8 text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">Included in total sales costs</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex rounded bg-gray-100 p-0.5 text-xs">
          <Button
            type="button"
            size="sm"
            className={`
              rounded px-2 py-1 text-xs font-medium transition-all
              ${inputMethod === 'perUnit' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            onClick={() => onToggleMethod('perUnit')}
            disabled={disabled}
          >
            <Home className="w-3 h-3 mr-1" />
            Unit
          </Button>
          <Button
            type="button"
            size="sm"
            className={`
              rounded px-2 py-1 text-xs font-medium transition-all
              ${inputMethod === 'perSqFt' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            onClick={() => onToggleMethod('perSqFt')}
            disabled={disabled}
          >
            <Calculator className="w-3 h-3 mr-1" />
            SqFt
          </Button>
          {isContingency && (
            <Button
              type="button"
              size="sm"
              className={`
                rounded px-2 py-1 text-xs font-medium transition-all
                ${inputMethod === 'percentage' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
              onClick={() => onToggleMethod('percentage')}
              disabled={disabled}
            >
              <span className="text-xs font-bold">%</span>
            </Button>
          )}
        </div>

        <div className="flex-1 relative">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isSalesCosts ? "0 = auto-calc, or enter amount" : placeholder || "Enter amount"}
            disabled={disabled}
            className="pr-12 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 font-medium">
            {inputMethod === 'perUnit' ? '/unit' : inputMethod === 'perSqFt' ? '/sqft' : '%'}
          </div>
        </div>
      </div>

      {convertedValue !== null && numericValue > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 ml-2">
          <div className="flex items-center text-sm text-blue-700 font-medium">
            <Calculator className="w-4 h-4 mr-2" />
            <span>
              = ${convertedValue.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 2 
              })} {inputMethod === 'perSqFt' ? 'per unit' : inputMethod === 'perUnit' ? 'per sq ft' : 'total'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}