import { 
  projects, phases, unitTypes, phaseUnits, calculatorScenarios, users, futurePhaseDefaults,
  type Project, type Phase, type UnitType, type PhaseUnit, type CalculatorScenario, type User, type UpsertUser,
  type InsertProject, type InsertPhase, type InsertUnitType, type InsertPhaseUnit, type InsertCalculatorScenario,
  type PhaseWithUnits, type ProjectSummary, type FuturePhaseDefaults, type InsertFuturePhaseDefaults
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Projects
  async getProjects(userId?: string): Promise<Project[]> {
    if (userId) {
      return await db.select().from(projects).where(eq(projects.userId, userId));
    }
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  // Phases
  async getPhases(projectId: number): Promise<PhaseWithUnits[]> {
    const projectPhases = await db.select().from(phases).where(eq(phases.projectId, projectId));
    
    const phasesWithUnits = await Promise.all(
      projectPhases.map(async (phase) => ({
        ...phase,
        units: await this.getPhaseUnits(phase.id)
      }))
    );

    return phasesWithUnits;
  }

  async getPhase(id: number): Promise<PhaseWithUnits | undefined> {
    const [phase] = await db.select().from(phases).where(eq(phases.id, id));
    if (!phase) return undefined;

    return {
      ...phase,
      units: await this.getPhaseUnits(id)
    };
  }

  async createPhase(insertPhase: InsertPhase): Promise<Phase> {
    const [phase] = await db.insert(phases).values(insertPhase).returning();
    return phase;
  }

  async updatePhase(id: number, updateData: Partial<InsertPhase>): Promise<Phase> {
    const [phase] = await db
      .update(phases)
      .set(updateData)
      .where(eq(phases.id, id))
      .returning();
    return phase;
  }

  async deletePhase(id: number): Promise<void> {
    await db.delete(phaseUnits).where(eq(phaseUnits.phaseId, id));
    await db.delete(phases).where(eq(phases.id, id));
  }

  // Unit Types
  async getUnitTypes(): Promise<UnitType[]> {
    return await db.select().from(unitTypes);
  }

  async createUnitType(insertUnitType: InsertUnitType): Promise<UnitType> {
    const [unitType] = await db.insert(unitTypes).values(insertUnitType).returning();
    return unitType;
  }

  async updateUnitType(id: number, updateData: Partial<InsertUnitType>): Promise<UnitType> {
    const [unitType] = await db
      .update(unitTypes)
      .set(updateData)
      .where(eq(unitTypes.id, id))
      .returning();
    return unitType;
  }

  // Phase Units
  async createPhaseUnit(insertPhaseUnit: InsertPhaseUnit): Promise<PhaseUnit> {
    const [phaseUnit] = await db.insert(phaseUnits).values(insertPhaseUnit).returning();
    return phaseUnit;
  }

  async updatePhaseUnit(id: number, updateData: Partial<InsertPhaseUnit>): Promise<PhaseUnit> {
    const [phaseUnit] = await db
      .update(phaseUnits)
      .set(updateData)
      .where(eq(phaseUnits.id, id))
      .returning();
    return phaseUnit;
  }

  async deletePhaseUnit(id: number): Promise<void> {
    await db.delete(phaseUnits).where(eq(phaseUnits.id, id));
  }

  async getPhaseUnits(phaseId: number): Promise<(PhaseUnit & { unitType: UnitType })[]> {
    const phaseUnitRows = await db
      .select({
        phaseUnit: phaseUnits,
        unitType: unitTypes,
      })
      .from(phaseUnits)
      .leftJoin(unitTypes, eq(phaseUnits.unitTypeId, unitTypes.id))
      .where(eq(phaseUnits.phaseId, phaseId));

    return phaseUnitRows.map(row => ({
      ...row.phaseUnit,
      unitType: row.unitType!
    }));
  }

  // Calculator Scenarios
  async getCalculatorScenario(unitTypeId: number): Promise<CalculatorScenario | undefined> {
    const [scenario] = await db
      .select()
      .from(calculatorScenarios)
      .where(eq(calculatorScenarios.unitTypeId, unitTypeId));
    return scenario || undefined;
  }

  async saveCalculatorScenario(insertScenario: InsertCalculatorScenario): Promise<CalculatorScenario> {
    const existing = await this.getCalculatorScenario(insertScenario.unitTypeId);
    
    if (existing) {
      const [scenario] = await db
        .update(calculatorScenarios)
        .set(insertScenario)
        .where(eq(calculatorScenarios.unitTypeId, insertScenario.unitTypeId))
        .returning();
      return scenario;
    } else {
      const [scenario] = await db.insert(calculatorScenarios).values(insertScenario).returning();
      return scenario;
    }
  }

  // Future Phase Defaults
  async getFuturePhaseDefaults(projectId: number, unitTypeId: number): Promise<FuturePhaseDefaults | undefined> {
    const [defaults] = await db
      .select()
      .from(futurePhaseDefaults)
      .where(eq(futurePhaseDefaults.projectId, projectId))
      .where(eq(futurePhaseDefaults.unitTypeId, unitTypeId));
    return defaults || undefined;
  }

  async saveFuturePhaseDefaults(insertDefaults: InsertFuturePhaseDefaults): Promise<FuturePhaseDefaults> {
    const existing = await this.getFuturePhaseDefaults(insertDefaults.projectId, insertDefaults.unitTypeId);
    
    if (existing) {
      const [defaults] = await db
        .update(futurePhaseDefaults)
        .set(insertDefaults)
        .where(eq(futurePhaseDefaults.projectId, insertDefaults.projectId))
        .where(eq(futurePhaseDefaults.unitTypeId, insertDefaults.unitTypeId))
        .returning();
      return defaults;
    } else {
      const [defaults] = await db.insert(futurePhaseDefaults).values(insertDefaults).returning();
      return defaults;
    }
  }

  // Summary
  async getProjectSummary(projectId: number): Promise<ProjectSummary> {
    const projectPhases = await this.getPhases(projectId);
    
    const totalPhases = projectPhases.length;
    const completedPhases = projectPhases.filter(p => p.status === 'completed').length;
    
    let totalUnits = 0;
    let totalCosts = 0;
    let totalRevenue = 0;
    
    for (const phase of projectPhases) {
      for (const unit of phase.units) {
        totalUnits += unit.quantity;
        
        const unitCosts = Number(unit.hardCosts || 0) + 
                          Number(unit.softCosts || 0) + 
                          Number(unit.landCosts || 0) + 
                          Number(unit.contingencyCosts || 0) + 
                          Number(unit.salesCosts || 0) + 
                          Number(unit.lawyerFees || 0);
        totalCosts += unitCosts * unit.quantity;
        totalRevenue += Number(unit.salesPrice || 0) * unit.quantity;
      }
    }
    
    const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    const overallROI = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0;
    
    return {
      totalPhases,
      completedPhases,
      totalUnits,
      overallMargin,
      overallROI,
      totalCosts,
      totalRevenue
    };
  }
}