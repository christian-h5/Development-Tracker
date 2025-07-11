import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Layers, CheckCircle, Home, PieChart, FileDown } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { exportProjectToPDF } from "@/lib/projectPdfExport";
import { useToast } from "@/hooks/use-toast";
import type { ProjectSummary, PhaseWithUnits, UnitType } from "@shared/schema";

interface ProjectDashboardProps {
  projectId: number;
}

export default function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { toast } = useToast();
  
  const { data: project } = useQuery({
    queryKey: ["/api/projects", projectId],
  });

  const { data: summary } = useQuery<ProjectSummary>({
    queryKey: ["/api/projects", projectId, "summary"],
  });

  const { data: phases } = useQuery<PhaseWithUnits[]>({
    queryKey: ["/api/projects", projectId, "phases"],
  });

  const { data: unitTypes } = useQuery<UnitType[]>({
    queryKey: ["/api/unit-types"],
  });

  const handleExportPDF = () => {
    if (!project || !summary || !phases || !unitTypes) {
      toast({
        title: "Export Failed",
        description: "Project data is still loading. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      exportProjectToPDF({
        project,
        phases,
        summary,
        unitTypes
      });
      
      toast({
        title: "PDF Exported",
        description: "Project summary has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!project || !summary) {
    return (
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{project.name}</h2>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleExportPDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>

            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Phases</p>
                  <p className="text-3xl font-bold">{summary.totalPhases}</p>
                </div>
                <Layers className="text-2xl text-blue-200 h-8 w-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed Phases</p>
                  <p className="text-3xl font-bold">{summary.completedPhases}</p>
                </div>
                <CheckCircle className="text-2xl text-green-200 h-8 w-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Units</p>
                  <p className="text-3xl font-bold">{summary.totalUnits}</p>
                </div>
                <Home className="text-2xl text-orange-200 h-8 w-8" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Project Margin</p>
                  <p className="text-3xl font-bold">{formatPercent(summary.overallMargin)}</p>
                </div>
                <PieChart className="text-2xl text-purple-200 h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalCosts)}</div>
                <div className="text-sm text-gray-600">Total Costs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{formatCurrency(summary.totalRevenue - summary.totalCosts)}</div>
                <div className="text-sm text-gray-600">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatPercent(summary.overallROI || 0)}</div>
                <div className="text-sm text-gray-600">Overall ROI</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}