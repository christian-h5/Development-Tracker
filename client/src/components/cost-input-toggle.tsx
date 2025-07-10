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
    <div className="space-y-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
        {label}
      </Label>

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

      <div className="flex items-center space-x-3">
        <div className="flex rounded-lg bg-gray-100 p-1 shadow-sm">
          <Button
            type="button"
            size="sm"
            className={`
              relative rounded-md px-4 py-2 text-sm font-medium transition-all duration-200
              ${inputMethod === 'perUnit' 
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            onClick={() => onToggleMethod('perUnit')}
            disabled={disabled}
          >
            <Home className="w-4 h-4 mr-2" />
            Per Unit
            {inputMethod === 'perUnit' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            className={`
              relative rounded-md px-4 py-2 text-sm font-medium transition-all duration-200
              ${inputMethod === 'perSqFt' 
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            onClick={() => onToggleMethod('perSqFt')}
            disabled={disabled}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Per Sq Ft
            {inputMethod === 'perSqFt' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </Button>
          {isContingency && (
            <Button
              type="button"
              size="sm"
              className={`
                relative rounded-md px-4 py-2 text-sm font-medium transition-all duration-200
                ${inputMethod === 'percentage' 
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              onClick={() => onToggleMethod('percentage')}
              disabled={disabled}
            >
              <span className="text-base font-bold">%</span>
              <span className="ml-1">Percent</span>
              {inputMethod === 'percentage' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </Button>
          )}
        </div>

        <div className="flex-1 relative">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isSalesCosts ? "Override auto-calculation" : placeholder}
            disabled={disabled}
            className="pr-16 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
            {inputMethod === 'perUnit' ? '/ unit' : inputMethod === 'perSqFt' ? '/ sq ft' : '%'}
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