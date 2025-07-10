import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ProjectDashboard from "@/components/project-dashboard";
import PhaseTable from "@/components/phase-table";
import PhaseModal from "@/components/phase-modal";
import UnitTypeManager from "@/components/unit-type-manager";
import type { PhaseWithUnits } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FuturePhaseDefaultsComponent from "@/components/future-phase-defaults";

export default function ProjectTracking() {
  const [selectedPhase, setSelectedPhase] = useState<PhaseWithUnits | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewPhase, setIsNewPhase] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1);


  const projectId = 1; // Default project ID

  const { data: phases = [], refetch: refetchPhases } = useQuery({
    queryKey: ["/api/projects", projectId, "phases"],
  });

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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <button 
          onClick={() => setSelectedProjectId(null)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Projects
        </button>
      </div>

      <ProjectDashboard projectId={projectId} onAddPhase={handleAddPhase} />

      <Tabs defaultValue="phases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="phases">Phase Management</TabsTrigger>
          <TabsTrigger value="unit-types">Unit Types</TabsTrigger>
          <TabsTrigger value="future-defaults">Future Phase Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="phases">
          <PhaseTable phases={phases} onEditPhase={handleEditPhase} />
        </TabsContent>

        <TabsContent value="unit-types">
          <UnitTypeManager />
        </TabsContent>

        <TabsContent value="future-defaults">
          <FuturePhaseDefaultsComponent projectId={projectId} />
        </TabsContent>
      </Tabs>

      <PhaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        phase={selectedPhase}
        projectId={projectId}
        isNew={isNewPhase}
        onSave={handlePhaseSaved}
      />
    </main>
  );
}