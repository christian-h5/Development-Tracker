import { localStorageService } from "./localStorage";
import type {
  Project, Phase, UnitType, CalculatorUnitType, PhaseUnit, CalculatorScenario, FuturePhaseDefaults,
  InsertProject, InsertPhase, InsertUnitType, InsertCalculatorUnitType, InsertPhaseUnit, InsertCalculatorScenario, InsertFuturePhaseDefaults,
  PhaseWithUnits, ProjectSummary
} from "@shared/schema";

// Client-side storage adapter that provides the same interface as server storage
// but uses localStorage instead of server API calls
export class ClientStorage {
  constructor() {
    // Initialize localStorage with default data
    localStorageService.initialize();
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return localStorageService.getProjects();
  }

  async getProject(id: number): Promise<Project | undefined> {
    return localStorageService.getProject(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    return localStorageService.createProject(project);
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    return localStorageService.updateProject(id, project);
  }

  // Phases
  async getPhases(projectId: number): Promise<PhaseWithUnits[]> {
    return localStorageService.getPhases(projectId);
  }

  async getPhase(id: number): Promise<PhaseWithUnits | undefined> {
    return localStorageService.getPhase(id);
  }

  async createPhase(phase: InsertPhase): Promise<Phase> {
    return localStorageService.createPhase(phase);
  }

  async updatePhase(id: number, phase: Partial<InsertPhase>): Promise<Phase> {
    return localStorageService.updatePhase(id, phase);
  }

  async deletePhase(id: number): Promise<void> {
    return localStorageService.deletePhase(id);
  }

  // Unit Types
  async getUnitTypes(): Promise<UnitType[]> {
    return localStorageService.getUnitTypes();
  }

  async createUnitType(unitType: InsertUnitType): Promise<UnitType> {
    return localStorageService.createUnitType(unitType);
  }

  async updateUnitType(id: number, unitType: Partial<InsertUnitType>): Promise<UnitType> {
    return localStorageService.updateUnitType(id, unitType);
  }

  // Calculator Unit Types
  async getCalculatorUnitTypes(): Promise<CalculatorUnitType[]> {
    return localStorageService.getCalculatorUnitTypes();
  }

  async createCalculatorUnitType(unitType: InsertCalculatorUnitType): Promise<CalculatorUnitType> {
    return localStorageService.createCalculatorUnitType(unitType);
  }

  async updateCalculatorUnitType(id: number, unitType: Partial<InsertCalculatorUnitType>): Promise<CalculatorUnitType> {
    return localStorageService.updateCalculatorUnitType(id, unitType);
  }

  async deleteCalculatorUnitType(id: number): Promise<void> {
    return localStorageService.deleteCalculatorUnitType(id);
  }

  // Phase Units
  async createPhaseUnit(phaseUnit: InsertPhaseUnit): Promise<PhaseUnit> {
    return localStorageService.createPhaseUnit(phaseUnit);
  }

  async updatePhaseUnit(id: number, phaseUnit: Partial<InsertPhaseUnit>): Promise<PhaseUnit> {
    return localStorageService.updatePhaseUnit(id, phaseUnit);
  }

  async deletePhaseUnit(id: number): Promise<void> {
    return localStorageService.deletePhaseUnit(id);
  }

  async getPhaseUnits(phaseId: number): Promise<(PhaseUnit & { unitType: UnitType })[]> {
    return localStorageService.getPhaseUnits(phaseId);
  }

  // Calculator Scenarios
  async getCalculatorScenario(calculatorUnitTypeId: number): Promise<CalculatorScenario | undefined> {
    return localStorageService.getCalculatorScenario(calculatorUnitTypeId);
  }

  async saveCalculatorScenario(scenario: InsertCalculatorScenario): Promise<CalculatorScenario> {
    return localStorageService.saveCalculatorScenario(scenario);
  }

  // Future Phase Defaults
  async getFuturePhaseDefaults(projectId: number, unitTypeId: number): Promise<FuturePhaseDefaults | undefined> {
    return localStorageService.getFuturePhaseDefaults(projectId, unitTypeId);
  }

  async saveFuturePhaseDefaults(data: InsertFuturePhaseDefaults): Promise<FuturePhaseDefaults> {
    return localStorageService.saveFuturePhaseDefaults(data);
  }

  // Summary
  async getProjectSummary(projectId: number): Promise<ProjectSummary> {
    return localStorageService.getProjectSummary(projectId);
  }

  // Utility methods
  clearAllData(): void {
    localStorageService.clearAllData();
  }
}

export const clientStorage = new ClientStorage();