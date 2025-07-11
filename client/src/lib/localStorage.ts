import type {
  Project, Phase, UnitType, CalculatorUnitType, PhaseUnit, CalculatorScenario, FuturePhaseDefaults,
  InsertProject, InsertPhase, InsertUnitType, InsertCalculatorUnitType, InsertPhaseUnit, InsertCalculatorScenario, InsertFuturePhaseDefaults,
  PhaseWithUnits, ProjectSummary
} from "@shared/schema";

const STORAGE_KEYS = {
  PROJECTS: 'devtracker_projects',
  PHASES: 'devtracker_phases',
  UNIT_TYPES: 'devtracker_unit_types',
  CALCULATOR_UNIT_TYPES: 'devtracker_calculator_unit_types',
  PHASE_UNITS: 'devtracker_phase_units',
  CALCULATOR_SCENARIOS: 'devtracker_calculator_scenarios',
  FUTURE_PHASE_DEFAULTS: 'devtracker_future_phase_defaults',
  COUNTERS: 'devtracker_counters'
};

interface Counters {
  projectId: number;
  phaseId: number;
  unitTypeId: number;
  calculatorUnitTypeId: number;
  phaseUnitId: number;
  scenarioId: number;
  futurePhaseDefaultsId: number;
}

class LocalStorageService {
  getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return defaultValue;
    }
  }

  saveToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key ${key}:`, error);
    }
  }

  private getCounters(): Counters {
    return this.getFromStorage(STORAGE_KEYS.COUNTERS, {
      projectId: 1,
      phaseId: 1,
      unitTypeId: 4, // Start after initial unit types
      calculatorUnitTypeId: 2, // Start after initial calculator unit type
      phaseUnitId: 1,
      scenarioId: 1,
      futurePhaseDefaultsId: 1
    });
  }

  private updateCounter(counterName: keyof Counters): number {
    const counters = this.getCounters();
    const newId = counters[counterName];
    counters[counterName] = newId + 1;
    this.saveToStorage(STORAGE_KEYS.COUNTERS, counters);
    return newId;
  }

  // Initialize with sample data for development
  initializeWithSampleData(): void {
    const projects = this.getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);
    if (projects.length === 0) {
      // Create default project
      const defaultProject: Project = {
        id: 1,
        name: "Townhome Development Project",
        description: "Mixed-use townhome development with retail space"
      };
      this.saveToStorage(STORAGE_KEYS.PROJECTS, [defaultProject]);

      // Create default unit types
      const defaultUnitTypes: UnitType[] = [
        { id: 1, name: "Type A", squareFootage: 1200, bedrooms: 2, lockOffFlexRooms: 0, description: "2BR/2BA townhome with ground floor retail" },
        { id: 2, name: "Type B", squareFootage: 1400, bedrooms: 3, lockOffFlexRooms: 1, description: "3BR/2.5BA townhome with lock-off suite" },
        { id: 3, name: "Type C", squareFootage: 1600, bedrooms: 3, lockOffFlexRooms: 0, description: "3BR/3BA corner townhome with premium finishes" }
      ];
      this.saveToStorage(STORAGE_KEYS.UNIT_TYPES, defaultUnitTypes);

      // Create default calculator unit type
      const defaultCalculatorUnitType: CalculatorUnitType = {
        id: 1,
        name: "Studio Apartment",
        squareFootage: 750,
        bedrooms: 1,
        lockOffFlexRooms: 0,
        description: "Compact studio unit for urban development"
      };
      this.saveToStorage(STORAGE_KEYS.CALCULATOR_UNIT_TYPES, [defaultCalculatorUnitType]);

      // Initialize empty arrays for other data
      this.saveToStorage(STORAGE_KEYS.PHASES, []);
      this.saveToStorage(STORAGE_KEYS.PHASE_UNITS, []);
      this.saveToStorage(STORAGE_KEYS.CALCULATOR_SCENARIOS, []);
      this.saveToStorage(STORAGE_KEYS.FUTURE_PHASE_DEFAULTS, []);
    }
  }

  // Projects
  getProjects(): Project[] {
    return this.getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);
  }

  getProject(id: number): Project | undefined {
    const projects = this.getProjects();
    return projects.find(p => p.id === id);
  }

  createProject(insertProject: InsertProject): Project {
    const projects = this.getProjects();
    const project: Project = {
      id: this.updateCounter('projectId'),
      ...insertProject
    };
    projects.push(project);
    this.saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return project;
  }

  updateProject(id: number, updateData: Partial<InsertProject>): Project {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Project not found");
    
    projects[index] = { ...projects[index], ...updateData };
    this.saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    return projects[index];
  }

  // Phases
  getPhases(projectId: number): PhaseWithUnits[] {
    const phases = this.getFromStorage<Phase[]>(STORAGE_KEYS.PHASES, []);
    const projectPhases = phases.filter(p => p.projectId === projectId);
    
    return projectPhases.map(phase => ({
      ...phase,
      units: this.getPhaseUnits(phase.id)
    }));
  }

  getPhase(id: number): PhaseWithUnits | undefined {
    const phases = this.getFromStorage<Phase[]>(STORAGE_KEYS.PHASES, []);
    const phase = phases.find(p => p.id === id);
    if (!phase) return undefined;
    
    return {
      ...phase,
      units: this.getPhaseUnits(phase.id)
    };
  }

  createPhase(insertPhase: InsertPhase): Phase {
    const phases = this.getFromStorage<Phase[]>(STORAGE_KEYS.PHASES, []);
    const phase: Phase = {
      id: this.updateCounter('phaseId'),
      ...insertPhase
    };
    phases.push(phase);
    this.saveToStorage(STORAGE_KEYS.PHASES, phases);
    return phase;
  }

  updatePhase(id: number, updateData: Partial<InsertPhase>): Phase {
    const phases = this.getFromStorage<Phase[]>(STORAGE_KEYS.PHASES, []);
    const index = phases.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Phase not found");
    
    phases[index] = { ...phases[index], ...updateData };
    this.saveToStorage(STORAGE_KEYS.PHASES, phases);
    return phases[index];
  }

  deletePhase(id: number): void {
    const phases = this.getFromStorage<Phase[]>(STORAGE_KEYS.PHASES, []);
    const filteredPhases = phases.filter(p => p.id !== id);
    this.saveToStorage(STORAGE_KEYS.PHASES, filteredPhases);
    
    // Also delete associated phase units
    const phaseUnits = this.getFromStorage<PhaseUnit[]>(STORAGE_KEYS.PHASE_UNITS, []);
    const filteredPhaseUnits = phaseUnits.filter(pu => pu.phaseId !== id);
    this.saveToStorage(STORAGE_KEYS.PHASE_UNITS, filteredPhaseUnits);
  }

  // Unit Types
  getUnitTypes(): UnitType[] {
    return this.getFromStorage<UnitType[]>(STORAGE_KEYS.UNIT_TYPES, []);
  }

  createUnitType(insertUnitType: InsertUnitType): UnitType {
    const unitTypes = this.getUnitTypes();
    const unitType: UnitType = {
      id: this.updateCounter('unitTypeId'),
      ...insertUnitType
    };
    unitTypes.push(unitType);
    this.saveToStorage(STORAGE_KEYS.UNIT_TYPES, unitTypes);
    return unitType;
  }

  updateUnitType(id: number, updateData: Partial<InsertUnitType>): UnitType {
    const unitTypes = this.getUnitTypes();
    const index = unitTypes.findIndex(ut => ut.id === id);
    if (index === -1) throw new Error("Unit type not found");
    
    unitTypes[index] = { ...unitTypes[index], ...updateData };
    this.saveToStorage(STORAGE_KEYS.UNIT_TYPES, unitTypes);
    return unitTypes[index];
  }

  deleteUnitType(id: number): void {
    const unitTypes = this.getUnitTypes();
    const filteredUnitTypes = unitTypes.filter(ut => ut.id !== id);
    this.saveToStorage(STORAGE_KEYS.UNIT_TYPES, filteredUnitTypes);
  }

  // Calculator Unit Types
  getCalculatorUnitTypes(): CalculatorUnitType[] {
    return this.getFromStorage<CalculatorUnitType[]>(STORAGE_KEYS.CALCULATOR_UNIT_TYPES, []);
  }

  createCalculatorUnitType(insertUnitType: InsertCalculatorUnitType): CalculatorUnitType {
    const unitTypes = this.getCalculatorUnitTypes();
    const unitType: CalculatorUnitType = {
      id: this.updateCounter('calculatorUnitTypeId'),
      ...insertUnitType
    };
    unitTypes.push(unitType);
    this.saveToStorage(STORAGE_KEYS.CALCULATOR_UNIT_TYPES, unitTypes);
    return unitType;
  }

  updateCalculatorUnitType(id: number, updateData: Partial<InsertCalculatorUnitType>): CalculatorUnitType {
    const unitTypes = this.getCalculatorUnitTypes();
    const index = unitTypes.findIndex(ut => ut.id === id);
    if (index === -1) throw new Error("Calculator unit type not found");
    
    unitTypes[index] = { ...unitTypes[index], ...updateData };
    this.saveToStorage(STORAGE_KEYS.CALCULATOR_UNIT_TYPES, unitTypes);
    return unitTypes[index];
  }

  deleteCalculatorUnitType(id: number): void {
    // Check if there are saved scenarios for this unit type
    const scenarios = this.getFromStorage<CalculatorScenario[]>(STORAGE_KEYS.CALCULATOR_SCENARIOS, []);
    const hasScenarios = scenarios.some(s => s.calculatorUnitTypeId === id);
    
    if (hasScenarios) {
      throw new Error("Cannot delete unit type that has saved scenarios");
    }
    
    const unitTypes = this.getCalculatorUnitTypes();
    const filteredUnitTypes = unitTypes.filter(ut => ut.id !== id);
    this.saveToStorage(STORAGE_KEYS.CALCULATOR_UNIT_TYPES, filteredUnitTypes);
  }

  // Phase Units
  createPhaseUnit(insertPhaseUnit: InsertPhaseUnit): PhaseUnit {
    const phaseUnits = this.getFromStorage<PhaseUnit[]>(STORAGE_KEYS.PHASE_UNITS, []);
    const phaseUnit: PhaseUnit = {
      id: this.updateCounter('phaseUnitId'),
      ...insertPhaseUnit
    };
    phaseUnits.push(phaseUnit);
    this.saveToStorage(STORAGE_KEYS.PHASE_UNITS, phaseUnits);
    return phaseUnit;
  }

  updatePhaseUnit(id: number, updateData: Partial<InsertPhaseUnit>): PhaseUnit {
    const phaseUnits = this.getFromStorage<PhaseUnit[]>(STORAGE_KEYS.PHASE_UNITS, []);
    const index = phaseUnits.findIndex(pu => pu.id === id);
    if (index === -1) throw new Error("Phase unit not found");
    
    phaseUnits[index] = { ...phaseUnits[index], ...updateData };
    this.saveToStorage(STORAGE_KEYS.PHASE_UNITS, phaseUnits);
    return phaseUnits[index];
  }

  deletePhaseUnit(id: number): void {
    const phaseUnits = this.getFromStorage<PhaseUnit[]>(STORAGE_KEYS.PHASE_UNITS, []);
    const filteredPhaseUnits = phaseUnits.filter(pu => pu.id !== id);
    this.saveToStorage(STORAGE_KEYS.PHASE_UNITS, filteredPhaseUnits);
  }

  getPhaseUnits(phaseId: number): (PhaseUnit & { unitType: UnitType })[] {
    const phaseUnits = this.getFromStorage<PhaseUnit[]>(STORAGE_KEYS.PHASE_UNITS, []);
    const unitTypes = this.getUnitTypes();
    
    return phaseUnits
      .filter(pu => pu.phaseId === phaseId)
      .map(pu => {
        const unitType = unitTypes.find(ut => ut.id === pu.unitTypeId);
        if (!unitType) throw new Error(`Unit type ${pu.unitTypeId} not found`);
        return { ...pu, unitType };
      });
  }

  // Calculator Scenarios
  getCalculatorScenario(calculatorUnitTypeId: number): CalculatorScenario | undefined {
    const scenarios = this.getFromStorage<CalculatorScenario[]>(STORAGE_KEYS.CALCULATOR_SCENARIOS, []);
    return scenarios.find(s => s.calculatorUnitTypeId === calculatorUnitTypeId);
  }

  saveCalculatorScenario(insertScenario: InsertCalculatorScenario): CalculatorScenario {
    const scenarios = this.getFromStorage<CalculatorScenario[]>(STORAGE_KEYS.CALCULATOR_SCENARIOS, []);
    const existingIndex = scenarios.findIndex(s => s.calculatorUnitTypeId === insertScenario.calculatorUnitTypeId);
    
    if (existingIndex >= 0) {
      // Update existing scenario
      scenarios[existingIndex] = { ...scenarios[existingIndex], ...insertScenario };
      this.saveToStorage(STORAGE_KEYS.CALCULATOR_SCENARIOS, scenarios);
      return scenarios[existingIndex];
    } else {
      // Create new scenario
      const scenario: CalculatorScenario = {
        id: this.updateCounter('scenarioId'),
        ...insertScenario
      };
      scenarios.push(scenario);
      this.saveToStorage(STORAGE_KEYS.CALCULATOR_SCENARIOS, scenarios);
      return scenario;
    }
  }

  // Future Phase Defaults
  getFuturePhaseDefaults(projectId: number, unitTypeId: number): FuturePhaseDefaults | undefined {
    const defaults = this.getFromStorage<FuturePhaseDefaults[]>(STORAGE_KEYS.FUTURE_PHASE_DEFAULTS, []);
    return defaults.find(d => d.projectId === projectId && d.unitTypeId === unitTypeId);
  }

  saveFuturePhaseDefaults(insertDefaults: InsertFuturePhaseDefaults): FuturePhaseDefaults {
    const allDefaults = this.getFromStorage<FuturePhaseDefaults[]>(STORAGE_KEYS.FUTURE_PHASE_DEFAULTS, []);
    const existingIndex = allDefaults.findIndex(d => 
      d.projectId === insertDefaults.projectId && d.unitTypeId === insertDefaults.unitTypeId
    );
    
    if (existingIndex >= 0) {
      // Update existing defaults
      allDefaults[existingIndex] = { ...allDefaults[existingIndex], ...insertDefaults };
      this.saveToStorage(STORAGE_KEYS.FUTURE_PHASE_DEFAULTS, allDefaults);
      return allDefaults[existingIndex];
    } else {
      // Create new defaults
      const defaults: FuturePhaseDefaults = {
        id: this.updateCounter('futurePhaseDefaultsId'),
        ...insertDefaults
      };
      allDefaults.push(defaults);
      this.saveToStorage(STORAGE_KEYS.FUTURE_PHASE_DEFAULTS, allDefaults);
      return defaults;
    }
  }

  // Project Summary
  getProjectSummary(projectId: number): ProjectSummary {
    const phases = this.getPhases(projectId);
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    
    let totalUnits = 0;
    let totalCosts = 0;
    let totalRevenue = 0;
    
    phases.forEach(phase => {
      phase.units.forEach(unit => {
        const quantity = unit.quantity || 0;
        totalUnits += quantity;
        
        const unitCosts = (
          (parseFloat(unit.hardCosts?.toString() || '0')) +
          (parseFloat(unit.softCosts?.toString() || '0')) +
          (parseFloat(unit.landCosts?.toString() || '0')) +
          (parseFloat(unit.contingencyCosts?.toString() || '0')) +
          (parseFloat(unit.salesCosts?.toString() || '0')) +
          (parseFloat(unit.lawyerFees?.toString() || '0')) +
          (parseFloat(unit.constructionFinancing?.toString() || '0'))
        ) * quantity;
        
        const unitRevenue = (parseFloat(unit.salesPrice?.toString() || '0')) * quantity;
        
        totalCosts += unitCosts;
        totalRevenue += unitRevenue;
      });
    });
    
    const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    const overallROI = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0;
    
    return {
      totalPhases: phases.length,
      completedPhases,
      totalUnits,
      overallMargin,
      overallROI,
      totalCosts,
      totalRevenue
    };
  }

  // Utility method to clear all data (for testing/reset)
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const localStorageService = new LocalStorageService();

// Export as default for easier imports
export { localStorageService as localStorage };