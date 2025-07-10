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
  status: text("status").notNull(), // 'completed', 'in_progress', 'planned'
  totalSquareFootage: integer("total_square_footage"),
});

export const unitTypes = pgTable("unit_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  squareFootage: integer("square_footage").notNull(),
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
  inputMethod: text("input_method").notNull().default("perUnit"), // 'perUnit' or 'perSqFt'
});

export const calculatorScenarios = pgTable("calculator_scenarios", {
  id: serial("id").primaryKey(),
  unitTypeId: integer("unit_type_id").notNull(),
  hardCosts: decimal("hard_costs", { precision: 12, scale: 2 }).notNull(),
  softCosts: decimal("soft_costs", { precision: 12, scale: 2 }).notNull(),
  landCosts: decimal("land_costs", { precision: 12, scale: 2 }).notNull(),
  contingencyCosts: decimal("contingency_costs", { precision: 12, scale: 2 }).notNull(),
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

// Extended types for UI
export type PhaseWithUnits = Phase & {
  units: (PhaseUnit & { unitType: UnitType })[];
};

export type ProjectSummary = {
  totalPhases: number;
  completedPhases: number;
  totalUnits: number;
  overallMargin: number;
  totalCosts: number;
  totalRevenue: number;
};
