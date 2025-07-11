import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitCalculatorForm from "@/components/unit-calculator-form";
import CalculatorUnitTypeManager from "@/components/calculator-unit-type-manager";

export default function UnitCalculator() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Unit Calculator</h1>
        <p className="text-gray-600">Analyze unit profitability and pricing scenarios</p>
      </div>
      
      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="unit-types">Unit Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <UnitCalculatorForm />
        </TabsContent>
        
        <TabsContent value="unit-types">
          <CalculatorUnitTypeManager />
        </TabsContent>
      </Tabs>
    </main>
  );
}
