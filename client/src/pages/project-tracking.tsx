import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Edit3 } from "lucide-react";
import ProjectDashboard from "@/components/project-dashboard";
import PhaseTable from "@/components/phase-table";
import PhaseModal from "@/components/phase-modal";
import UnitTypeManager from "@/components/unit-type-manager";
import ProjectEditModal from "@/components/project-edit-modal";
import type { PhaseWithUnits, Project } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FuturePhaseDefaultsComponent from "@/components/future-phase-defaults";

export default function ProjectTracking() {
  const [selectedPhase, setSelectedPhase] = useState<PhaseWithUnits | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewPhase, setIsNewPhase] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  const { data: phases = [], refetch: refetchPhases } = useQuery({
    queryKey: ["/api/projects", selectedProjectId, "phases"],
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleEditPhase = (phase: PhaseWithUnits) => {
    setSelectedPhase(phase);
    setIsNewPhase(false);
    setIsModalOpen(true);
  };

  const handleAddPhase = () => {
    setSelectedPhase(null);
    setIsNewPhase(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhase(null);
    setIsNewPhase(false);
  };

  const handlePhaseSaved = () => {
    refetchPhases();
    handleCloseModal();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsNewProject(false);
    setIsProjectModalOpen(true);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsNewProject(true);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
    setIsNewProject(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Selection</span>
            <Button size="sm" className="gap-2" onClick={handleCreateProject}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </CardTitle>
          <CardDescription>
            Choose a project to view phases and track development progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Project</label>
              <Select
                value={selectedProjectId?.toString() || ""}
                onValueChange={(value) => setSelectedProjectId(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-sm text-gray-500">{project.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProject && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">{selectedProject.name}</h4>
                    <p className="text-sm text-blue-700 mt-1">{selectedProject.description}</p>
                    <p className="text-sm text-blue-600 mt-2">
                      Total Phases: {selectedProject.totalPhases}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-100"
                    onClick={() => handleEditProject(selectedProject)}
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Project Content */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="unit-types">Unit Types</TabsTrigger>
          <TabsTrigger value="defaults">Future Phase Cost Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProjectDashboard projectId={selectedProjectId} onAddPhase={handleAddPhase} />
        </TabsContent>

        <TabsContent value="phases">
          <PhaseTable 
            phases={phases} 
            onEditPhase={handleEditPhase}
            onViewPhase={(phase) => console.log('View phase:', phase)}
          />
        </TabsContent>

        <TabsContent value="unit-types">
          <UnitTypeManager />
        </TabsContent>

        <TabsContent value="defaults">
          <FuturePhaseDefaultsComponent projectId={selectedProjectId} />
        </TabsContent>
      </Tabs>
      <PhaseModal
        phase={selectedPhase}
        isNew={isNewPhase}
        projectId={selectedProjectId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handlePhaseSaved}
      />
      <ProjectEditModal
        project={editingProject}
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        isNew={isNewProject}
      />
    </main>
  );
}