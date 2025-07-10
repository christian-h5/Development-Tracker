import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ProjectDashboard from "@/components/project-dashboard";
import PhaseTable from "@/components/phase-table";
import PhaseModal from "@/components/phase-modal";
import type { PhaseWithUnits } from "@shared/schema";

export default function ProjectTracking() {
  const [selectedPhase, setSelectedPhase] = useState<PhaseWithUnits | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewPhase, setIsNewPhase] = useState(false);

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
      <ProjectDashboard projectId={projectId} onAddPhase={handleAddPhase} />
      <PhaseTable 
        phases={phases} 
        onEditPhase={handleEditPhase}
        onViewPhase={handleEditPhase}
      />
      
      {isModalOpen && (
        <PhaseModal
          phase={selectedPhase}
          isNew={isNewPhase}
          projectId={projectId}
          onClose={handleCloseModal}
          onSave={handlePhaseSaved}
        />
      )}
    </main>
  );
}
