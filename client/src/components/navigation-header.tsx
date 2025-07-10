import { useLocation } from "wouter";
import { Building, ChartLine, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NavigationHeader() {
  const [location, setLocation] = useLocation();

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
          <nav className="flex space-x-8">
            <Button
              variant={isProjectActive ? "default" : "ghost"}
              className={isProjectActive ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"}
              onClick={() => setLocation("/project-tracking")}
            >
              <ChartLine className="mr-2 h-4 w-4" />
              Project Tracking
            </Button>
            <Button
              variant={isCalculatorActive ? "default" : "ghost"}
              className={isCalculatorActive ? "bg-primary text-white" : "text-gray-500 hover:text-gray-700"}
              onClick={() => setLocation("/unit-calculator")}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Unit Calculator
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
