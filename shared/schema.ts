import { pgTable, text, serial, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  totalPhases: integer("total_phases").notNull().default(12),
});

export const phases = pgTable("phases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(), // 'completed', 'in_progress', 'future'
  totalSquareFootage: integer("total_square_footage"),
});

export const futurePhaseDefaults = pgTable("future_phase_defaults", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  unitTypeId: integer("unit_type_id").notNull(),
  hardCosts: decimal("hard_costs", { precision: 12, scale: 2 }),
  softCosts: decimal("soft_costs", { precision: 12, scale: 2 }),
  landCosts: decimal("land_costs", { precision: 12, scale: 2 }),
  contingencyCosts: decimal("contingency_costs", { precision: 12, scale: 2 }),
  salesCosts: decimal("sales_costs", { precision: 12, scale: 2 }),
  lawyerFees: decimal("lawyer_fees", { precision: 12, scale: 2 }),
  hardCostsInputMethod: text("hard_costs_input_method").notNull().default("perUnit"),
  softCostsInputMethod: text("soft_costs_input_method").notNull().default("perUnit"),
  landCostsInputMethod: text("land_costs_input_method").notNull().default("perUnit"),
  contingencyCostsInputMethod: text("contingency_costs_input_method").notNull().default("perUnit"),
  salesCostsInputMethod: text("sales_costs_input_method").notNull().default("perUnit"),
  lawyerFeesInputMethod: text("lawyer_fees_input_method").notNull().default("perUnit"),
  isActive: boolean("is_active").notNull().default(false),
});

export const unitTypes = pgTable("unit_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  squareFootage: integer("square_footage").notNull(),
  bedrooms: integer("bedrooms").notNull().default(1),
  lockOffFlexRooms: integer("lock_off_flex_rooms").notNull().default(0),
  totalUnitsInDevelopment: integer("total_units_in_development").notNull().default(0),
  startDate: text("start_date"),
  occupancyDate: text("occupancy_date"),
});

export const phaseUnits = pgTable("phase_units", {
  id: serial("id").primaryKey(),
  phaseId: integer("phase_id").notNull(),
  unitTypeId: integer("unit_type_id").notNull(),
  quantity: integer("quantity").notNull(),
  hardCosts: decimal("hard_costs", { precision: 12, scale: 2 }),
  softCosts: decimal("soft_costs", { precision: 12, scale: 2 }),
  landCosts: decimal("land_costs", { precision: 12, scale: 2 }),
  salesPrice: decimal("sales_price", { precision: 12, scale: 2 }),
  contingencyCosts: decimal("contingency_costs", { precision: 12, scale: 2 }),
  salesCosts: decimal("sales_costs", { precision: 12, scale: 2 }),
  lawyerFees: decimal("lawyer_fees", { precision: 12, scale: 2 }),
  hardCostsInputMethod: text("hard_costs_input_method").notNull().default("perUnit"),
  softCostsInputMethod: text("soft_costs_input_method").notNull().default("perUnit"),
  landCostsInputMethod: text("land_costs_input_method").notNull().default("perUnit"),
  contingencyCostsInputMethod: text("contingency_costs_input_method").notNull().default("perUnit"),
  salesCostsInputMethod: text("sales_costs_input_method").notNull().default("perUnit"),
  lawyerFeesInputMethod: text("lawyer_fees_input_method").notNull().default("perUnit"),
});

export const calculatorScenarios = pgTable("calculator_scenarios", {
  id: serial("id").primaryKey(),
  unitTypeId: integer("unit_type_id").notNull(),
  hardCosts: decimal("hard_costs", { precision: 12, scale: 2 }).notNull(),
  softCosts: decimal("soft_costs", { precision: 12, scale: 2 }).notNull(),
  landCosts: decimal("land_costs", { precision: 12, scale: 2 }).notNull(),
  contingencyCosts: decimal("contingency_costs", { precision: 12, scale: 2 }).notNull(),
  salesCosts: decimal("sales_costs", { precision: 12, scale: 2 }).notNull(),
  lawyerFees: decimal("lawyer_fees", { precision: 12, scale: 2 }).notNull(),
  hardCostsInputMethod: text("hard_costs_input_method").notNull().default("perUnit"),
  softCostsInputMethod: text("soft_costs_input_method").notNull().default("perUnit"),
  landCostsInputMethod: text("land_costs_input_method").notNull().default("perUnit"),
  contingencyCostsInputMethod: text("contingency_costs_input_method").notNull().default("perUnit"),
  salesCostsInputMethod: text("sales_costs_input_method").notNull().default("perUnit"),
  lawyerFeesInputMethod: text("lawyer_fees_input_method").notNull().default("perUnit"),
  scenario1Price: decimal("scenario1_price", { precision: 12, scale: 2 }),
  scenario2Price: decimal("scenario2_price", { precision: 12, scale: 2 }),
  scenario3Price: decimal("scenario3_price", { precision: 12, scale: 2 }),
  scenario4Price: decimal("scenario4_price", { precision: 12, scale: 2 }),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertPhaseSchema = createInsertSchema(phases).omit({ id: true });
export const insertUnitTypeSchema = createInsertSchema(unitTypes).omit({ id: true });
export const insertPhaseUnitSchema = createInsertSchema(phaseUnits).omit({ id: true });
export const insertCalculatorScenarioSchema = createInsertSchema(calculatorScenarios).omit({ id: true });
export const insertFuturePhaseDefaultsSchema = createInsertSchema(futurePhaseDefaults).omit({ id: true });

// Types
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type Phase = typeof phases.$inferSelect;
export type InsertUnitType = z.infer<typeof insertUnitTypeSchema>;
export type UnitType = typeof unitTypes.$inferSelect;
export type InsertPhaseUnit = z.infer<typeof insertPhaseUnitSchema>;
export type PhaseUnit = typeof phaseUnits.$inferSelect;
export type InsertCalculatorScenario = z.infer<typeof insertCalculatorScenarioSchema>;
export type CalculatorScenario = typeof calculatorScenarios.$inferSelect;
export type InsertFuturePhaseDefaults = z.infer<typeof insertFuturePhaseDefaultsSchema>;
export type FuturePhaseDefaults = typeof futurePhaseDefaults.$inferSelect;

export type IndividualUnit = typeof individualUnits.$inferSelect;
export type InsertIndividualUnit = typeof individualUnits.$inferInsert;

// Extended types for UI
export type PhaseWithUnits = Phase & {
  units: (PhaseUnit & { unitType: UnitType })[];
};

export type ProjectSummary = {
  totalPhases: number;
  completedPhases: number;
  totalUnits: number;
  overallMargin: number;
  overallROI: number;
  totalCosts: number;
  totalRevenue: number;
};