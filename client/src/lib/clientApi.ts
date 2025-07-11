import { localStorage as clientStorage } from "./localStorage";
import type {
  Project, Phase, UnitType, CalculatorUnitType, PhaseUnit, CalculatorScenario, FuturePhaseDefaults,
  InsertProject, InsertPhase, InsertUnitType, InsertCalculatorUnitType, InsertPhaseUnit, InsertCalculatorScenario, InsertFuturePhaseDefaults,
  PhaseWithUnits, ProjectSummary
} from "@shared/schema";

// Client-side API handler that intercepts API calls and uses localStorage instead
export async function handleClientApiRequest(method: string, url: string, data?: any): Promise<any> {
  // Parse the URL to determine the route
  const path = url.replace('/api', '');
  const segments = path.split('/').filter(Boolean);

  try {
    switch (method) {
      case 'GET':
        return await handleGet(segments);
      case 'POST':
        return await handlePost(segments, data);
      case 'PUT':
        return await handlePut(segments, data);
      case 'DELETE':
        return await handleDelete(segments);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  } catch (error) {
    console.error('Client API error:', error);
    throw error;
  }
}

async function handleGet(segments: string[]): Promise<any> {
  const [resource, id, subResource, subId] = segments;

  switch (resource) {
    case 'projects':
      if (!id) {
        return await clientStorage.getProjects();
      } else if (subResource === 'phases') {
        return await clientStorage.getPhases(parseInt(id));
      } else if (subResource === 'summary') {
        return await clientStorage.getProjectSummary(parseInt(id));
      } else {
        return await clientStorage.getProject(parseInt(id));
      }

    case 'phases':
      if (id) {
        return await clientStorage.getPhase(parseInt(id));
      }
      break;

    case 'unit-types':
      return await clientStorage.getUnitTypes();

    case 'calculator-unit-types':
      return await clientStorage.getCalculatorUnitTypes();

    case 'calculator':
      if (id) {
        return await clientStorage.getCalculatorScenario(parseInt(id));
      }
      break;

    case 'future-phase-defaults':
      if (segments.length >= 4) {
        // /api/future-phase-defaults/projectId/unitTypeId
        const projectId = parseInt(segments[1]);
        const unitTypeId = parseInt(segments[2]);
        return await clientStorage.getFuturePhaseDefaults(projectId, unitTypeId);
      }
      break;

    default:
      throw new Error(`Unknown GET resource: ${resource}`);
  }
}

async function handlePost(segments: string[], data: any): Promise<any> {
  const [resource] = segments;

  switch (resource) {
    case 'projects':
      return await clientStorage.createProject(data);

    case 'phases':
      return await clientStorage.createPhase(data);

    case 'unit-types':
      return await clientStorage.createUnitType(data);

    case 'calculator-unit-types':
      return await clientStorage.createCalculatorUnitType(data);

    case 'phase-units':
      return await clientStorage.createPhaseUnit(data);

    case 'calculator':
      return await clientStorage.saveCalculatorScenario(data);

    case 'future-phase-defaults':
      return await clientStorage.saveFuturePhaseDefaults(data);

    default:
      throw new Error(`Unknown POST resource: ${resource}`);
  }
}

async function handlePut(segments: string[], data: any): Promise<any> {
  const [resource, id] = segments;
  const resourceId = parseInt(id);

  switch (resource) {
    case 'projects':
      return await clientStorage.updateProject(resourceId, data);

    case 'phases':
      return await clientStorage.updatePhase(resourceId, data);

    case 'unit-types':
      return await clientStorage.updateUnitType(resourceId, data);

    case 'calculator-unit-types':
      return await clientStorage.updateCalculatorUnitType(resourceId, data);

    case 'phase-units':
      return await clientStorage.updatePhaseUnit(resourceId, data);

    default:
      throw new Error(`Unknown PUT resource: ${resource}`);
  }
}

async function handleDelete(segments: string[]): Promise<any> {
  const [resource, id] = segments;
  const resourceId = parseInt(id);

  switch (resource) {
    case 'phases':
      return await clientStorage.deletePhase(resourceId);

    case 'unit-types':
      return await clientStorage.deleteUnitType(resourceId);

    case 'calculator-unit-types':
      return await clientStorage.deleteCalculatorUnitType(resourceId);

    case 'phase-units':
      return await clientStorage.deletePhaseUnit(resourceId);

    default:
      throw new Error(`Unknown DELETE resource: ${resource}`);
  }
}