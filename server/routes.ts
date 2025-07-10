import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertPhaseSchema, 
  insertUnitTypeSchema, 
  insertPhaseUnitSchema,
  insertCalculatorScenarioSchema,
  insertFuturePhaseDefaultsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to get projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to get project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, data);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  // Phase routes
  app.get("/api/projects/:projectId/phases", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const phases = await storage.getPhases(projectId);
      res.json(phases);
    } catch (error) {
      res.status(500).json({ message: "Failed to get phases" });
    }
  });

  app.get("/api/phases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const phase = await storage.getPhase(id);
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
      res.json(phase);
    } catch (error) {
      res.status(500).json({ message: "Failed to get phase" });
    }
  });

  app.post("/api/phases", async (req, res) => {
    try {
      const data = insertPhaseSchema.parse(req.body);
      const phase = await storage.createPhase(data);
      res.json(phase);
    } catch (error) {
      res.status(400).json({ message: "Invalid phase data" });
    }
  });

  app.put("/api/phases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPhaseSchema.partial().parse(req.body);
      const phase = await storage.updatePhase(id, data);
      res.json(phase);
    } catch (error) {
      res.status(400).json({ message: "Failed to update phase" });
    }
  });

  app.delete("/api/phases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhase(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete phase" });
    }
  });

  // Unit Type routes
  app.get("/api/unit-types", async (req, res) => {
    try {
      const unitTypes = await storage.getUnitTypes();
      res.json(unitTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get unit types" });
    }
  });

  app.post("/api/unit-types", async (req, res) => {
    try {
      const data = insertUnitTypeSchema.parse(req.body);
      const unitType = await storage.createUnitType(data);
      res.json(unitType);
    } catch (error) {
      res.status(400).json({ message: "Invalid unit type data" });
    }
  });

  app.put("/api/unit-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertUnitTypeSchema.partial().parse(req.body);
      const unitType = await storage.updateUnitType(id, data);
      res.json(unitType);
    } catch (error) {
      res.status(400).json({ message: "Failed to update unit type" });
    }
  });

  // Phase Unit routes
  app.post("/api/phase-units", async (req, res) => {
    try {
      const data = insertPhaseUnitSchema.parse(req.body);
      const phaseUnit = await storage.createPhaseUnit(data);
      res.json(phaseUnit);
    } catch (error) {
      res.status(400).json({ message: "Invalid phase unit data" });
    }
  });

  app.put("/api/phase-units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPhaseUnitSchema.partial().parse(req.body);
      const phaseUnit = await storage.updatePhaseUnit(id, data);
      res.json(phaseUnit);
    } catch (error) {
      res.status(400).json({ message: "Failed to update phase unit" });
    }
  });

  app.delete("/api/phase-units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhaseUnit(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete phase unit" });
    }
  });

  // Calculator routes
  app.get("/api/calculator/:unitTypeId", async (req, res) => {
    try {
      const unitTypeId = parseInt(req.params.unitTypeId);
      const scenario = await storage.getCalculatorScenario(unitTypeId);
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to get calculator scenario" });
    }
  });

  app.post("/api/calculator", async (req, res) => {
    try {
      const data = insertCalculatorScenarioSchema.parse(req.body);
      const scenario = await storage.saveCalculatorScenario(data);
      res.json(scenario);
    } catch (error) {
      res.status(400).json({ message: "Invalid calculator data" });
    }
  });

  // Future Phase Defaults routes
  app.get("/api/future-phase-defaults/:projectId/:unitTypeId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const unitTypeId = parseInt(req.params.unitTypeId);
      const defaults = await storage.getFuturePhaseDefaults(projectId, unitTypeId);
      res.json(defaults);
    } catch (error) {
      res.status(500).json({ message: "Failed to get future phase defaults" });
    }
  });

  app.post("/api/future-phase-defaults", async (req, res) => {
    try {
      const data = insertFuturePhaseDefaultsSchema.parse(req.body);
      const defaults = await storage.saveFuturePhaseDefaults(data);
      res.json(defaults);
    } catch (error) {
      res.status(400).json({ message: "Invalid future phase defaults data" });
    }
  });

  // Summary route
  app.get("/api/projects/:projectId/summary", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const summary = await storage.getProjectSummary(projectId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to get project summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
