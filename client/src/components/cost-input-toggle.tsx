import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Home } from "lucide-react";

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
  totalCosts = 0
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
    return (first100k * 0.05) + (balance * 0.03);
  };

  const convertedValue = getConvertedValue();
  const tieredCommission = calculateTieredCommission();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      {isSalesCosts && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          Tiered Commission: 5% on first $100k, 3% on balance
          {tieredCommission !== null && salesPrice > 0 && (
            <div className="mt-1 font-medium">
              Auto-calculated: ${tieredCommission.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          <Button
            type="button"
            variant={inputMethod === 'perUnit' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-none px-3 py-2 text-xs"
            onClick={() => onToggleMethod('perUnit')}
            disabled={disabled}
          >
            <Home className="w-3 h-3 mr-1" />
            Per Unit
          </Button>
          <Button
            type="button"
            variant={inputMethod === 'perSqFt' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-none px-3 py-2 text-xs"
            onClick={() => onToggleMethod('perSqFt')}
            disabled={disabled}
          >
            <Calculator className="w-3 h-3 mr-1" />
            Per Sq Ft
          </Button>
          {isContingency && (
            <Button
              type="button"
              variant={inputMethod === 'percentage' ? 'default' : 'secondary'}
              size="sm"
              className="rounded-none px-3 py-2 text-xs"
              onClick={() => onToggleMethod('percentage')}
              disabled={disabled}
            >
              %
            </Button>
          )}
        </div>

        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSalesCosts ? "Override auto-calculation" : placeholder}
          disabled={disabled}
          className="flex-1"
        />

        <span className="text-xs text-gray-500 min-w-[60px]">
          {inputMethod === 'perUnit' ? '/ unit' : inputMethod === 'perSqFt' ? '/ sq ft' : '%'}
        </span>
      </div>

      {convertedValue !== null && numericValue > 0 && (
        <div className="text-xs text-gray-500 ml-2">
          = ${convertedValue.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
          })} {inputMethod === 'perSqFt' ? 'per unit' : inputMethod === 'perUnit' ? 'per sq ft' : 'total'}
        </div>
      )}
    </div>
  );
}