import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Home } from "lucide-react";

interface CostInputToggleProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMethod: 'perUnit' | 'perSqFt';
  onToggleMethod: (method: 'perUnit' | 'perSqFt') => void;
  disabled?: boolean;
  placeholder?: string;
  squareFootage?: number;
}

export default function CostInputToggle({
  label,
  value,
  onChange,
  inputMethod,
  onToggleMethod,
  disabled = false,
  placeholder = "Enter amount",
  squareFootage = 1
}: CostInputToggleProps) {
  const numericValue = parseFloat(value) || 0;
  
  // Calculate the converted value
  const getConvertedValue = () => {
    if (!numericValue || !squareFootage) return null;
    
    if (inputMethod === 'perSqFt') {
      // Show per unit equivalent
      return numericValue * squareFootage;
    } else {
      // Show per sq ft equivalent
      return numericValue / squareFootage;
    }
  };

  const convertedValue = getConvertedValue();
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      
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
        </div>
        
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        
        <span className="text-xs text-gray-500 min-w-[60px]">
          {inputMethod === 'perUnit' ? '/ unit' : '/ sq ft'}
        </span>
      </div>
      
      {convertedValue !== null && numericValue > 0 && (
        <div className="text-xs text-gray-500 ml-2">
          = ${convertedValue.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
          })} {inputMethod === 'perSqFt' ? 'per unit' : 'per sq ft'}
        </div>
      )}
    </div>
  );
}