import { localStorageService } from "./localStorage";
import type { Project, Phase, UnitType, CalculatorUnitType, PhaseUnit, CalculatorScenario, FuturePhaseDefaults } from "@shared/schema";

export interface ExportData {
  version: string;
  exportDate: string;
  projects: Project[];
  phases: Phase[];
  unitTypes: UnitType[];
  calculatorUnitTypes: CalculatorUnitType[];
  phaseUnits: PhaseUnit[];
  calculatorScenarios: CalculatorScenario[];
  futurePhaseDefaults: FuturePhaseDefaults[];
}

// Export all data to JSON
export function exportAllData(): ExportData {
  const exportData: ExportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    projects: localStorageService.getProjects(),
    phases: localStorageService.getFromStorage('devtracker_phases', []),
    unitTypes: localStorageService.getUnitTypes(),
    calculatorUnitTypes: localStorageService.getCalculatorUnitTypes(),
    phaseUnits: localStorageService.getFromStorage('devtracker_phase_units', []),
    calculatorScenarios: localStorageService.getFromStorage('devtracker_calculator_scenarios', []),
    futurePhaseDefaults: localStorageService.getFromStorage('devtracker_future_phase_defaults', [])
  };
  
  return exportData;
}

// Download data as JSON file
export function downloadDataAsJson(): void {
  const data = exportAllData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `devtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import data from JSON
export function importDataFromJson(jsonData: string): { success: boolean; message: string } {
  try {
    const data: ExportData = JSON.parse(jsonData);
    
    // Validate the data structure
    if (!data.version || !data.projects || !Array.isArray(data.projects)) {
      return { success: false, message: "Invalid backup file format" };
    }
    
    // Clear existing data
    localStorageService.clearAllData();
    
    // Import all data
    localStorageService.saveToStorage('devtracker_projects', data.projects);
    localStorageService.saveToStorage('devtracker_phases', data.phases || []);
    localStorageService.saveToStorage('devtracker_unit_types', data.unitTypes || []);
    localStorageService.saveToStorage('devtracker_calculator_unit_types', data.calculatorUnitTypes || []);
    localStorageService.saveToStorage('devtracker_phase_units', data.phaseUnits || []);
    localStorageService.saveToStorage('devtracker_calculator_scenarios', data.calculatorScenarios || []);
    localStorageService.saveToStorage('devtracker_future_phase_defaults', data.futurePhaseDefaults || []);
    
    // Update counters to avoid ID conflicts
    const maxProjectId = Math.max(0, ...data.projects.map(p => p.id)) + 1;
    const maxPhaseId = Math.max(0, ...(data.phases || []).map(p => p.id)) + 1;
    const maxUnitTypeId = Math.max(0, ...(data.unitTypes || []).map(ut => ut.id)) + 1;
    const maxCalculatorUnitTypeId = Math.max(0, ...(data.calculatorUnitTypes || []).map(cut => cut.id)) + 1;
    const maxPhaseUnitId = Math.max(0, ...(data.phaseUnits || []).map(pu => pu.id)) + 1;
    const maxScenarioId = Math.max(0, ...(data.calculatorScenarios || []).map(cs => cs.id)) + 1;
    const maxFuturePhaseDefaultsId = Math.max(0, ...(data.futurePhaseDefaults || []).map(fpd => fpd.id)) + 1;
    
    localStorageService.saveToStorage('devtracker_counters', {
      projectId: maxProjectId,
      phaseId: maxPhaseId,
      unitTypeId: maxUnitTypeId,
      calculatorUnitTypeId: maxCalculatorUnitTypeId,
      phaseUnitId: maxPhaseUnitId,
      scenarioId: maxScenarioId,
      futurePhaseDefaultsId: maxFuturePhaseDefaultsId
    });
    
    return { success: true, message: `Successfully imported ${data.projects.length} projects and related data` };
  } catch (error) {
    return { success: false, message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Handle file upload for import
export function handleFileImport(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const importResult = importDataFromJson(result);
        resolve(importResult);
      } else {
        resolve({ success: false, message: "Failed to read file" });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: "Error reading file" });
    };
    
    reader.readAsText(file);
  });
}