import { BackendService } from './backend';
import axios from 'axios';

jest.mock('axios');

describe('BackendService', () => {
  let backend;
  beforeEach(() => {
    backend = new BackendService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if clientData or prompt is missing in generateCarePlan', async () => {
    await expect(backend.generateCarePlan(null, 'prompt')).rejects.toThrow('Client data and prompt are required');
    await expect(backend.generateCarePlan({}, null)).rejects.toThrow('Client data and prompt are required');
  });

  it('should return care plan string from generateCarePlan', async () => {
    axios.create.mockReturnValue({ post: jest.fn().mockResolvedValue({ data: 'plan' }) });
    backend = new BackendService();
    const result = await backend.generateCarePlan({ name: 'Test' }, 'prompt');
    expect(result).toBe('plan');
  });

  it('should throw error if carePlan is not a non-empty string in assessQuality', async () => {
    await expect(backend.assessQuality('')).rejects.toThrow('Care plan must be a non-empty string');
    await expect(backend.assessQuality(null)).rejects.toThrow('Care plan must be a non-empty string');
  });

  it('should return quality object from assessQuality', async () => {
    axios.create.mockReturnValue({ post: jest.fn().mockResolvedValue({ data: { score: 5 } }) });
    backend = new BackendService();
    const result = await backend.assessQuality('plan');
    expect(result).toEqual({ score: 5 });
  });

  it('should throw error if carePlan is not a non-empty string in enhanceWithResearch', async () => {
    await expect(backend.enhanceWithResearch('')).rejects.toThrow('Care plan must be a non-empty string');
    await expect(backend.enhanceWithResearch(null)).rejects.toThrow('Care plan must be a non-empty string');
  });

  it('should return enhanced plan from enhanceWithResearch', async () => {
    axios.create.mockReturnValue({ post: jest.fn().mockResolvedValue({ data: 'enhanced' }) });
    backend = new BackendService();
    const result = await backend.enhanceWithResearch('plan');
    expect(result).toBe('enhanced');
  });
}); 