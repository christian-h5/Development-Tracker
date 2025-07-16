import { useLocation } from "wouter";
import { Building, ChartLine, Calculator, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadDataAsJson, handleFileImport } from "@/lib/exportImport";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useRef } from "react";

export default function NavigationHeader() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadDataAsJson();
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await handleFileImport(file);
    
    if (result.success) {
      // Invalidate all queries to refresh the UI with imported data
      queryClient.invalidateQueries();
      toast({
        title: "Import Successful",
        description: result.message,
      });
    } else {
      toast({
        title: "Import Failed",
        description: result.message,
        variant: "destructive",
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProjectActive = location === "/" || location === "/project-tracking";
  const isCalculatorActive = location === "/unit-calculator";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-primary flex items-center">
                <Building className="mr-2 h-5 w-5" />
                DevTracker Pro
              </h1>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`px-6 py-2 rounded-md transition-all font-medium ${
                  isProjectActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setLocation("/project-tracking")}
              >
                <ChartLine className="mr-2 h-4 w-4" />
                Project Tracking
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`px-6 py-2 rounded-md transition-all font-medium ${
                  isCalculatorActive 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setLocation("/unit-calculator")}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Unit Calculator
              </Button>
            </div>
            
            {/* Export/Import Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportClick}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
