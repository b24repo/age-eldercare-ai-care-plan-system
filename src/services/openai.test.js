import { OpenAIService } from './openai';
import { BackendService } from './backend';

beforeAll(() => {
  BackendService.prototype.generateCarePlan = jest.fn().mockResolvedValue('mocked plan');
  BackendService.prototype.assessQuality = jest.fn().mockResolvedValue({ overall: 5 });
  BackendService.prototype.enhanceWithResearch = jest.fn().mockResolvedValue('enhanced plan');
});

describe('OpenAIService', () => {
  let openai;
  beforeEach(() => {
    openai = new OpenAIService();
  });

  it('should throw error if required client fields are missing', async () => {
    await expect(openai.generateCarePlan({}, 1)).rejects.toThrow('Missing required fields');
  });

  it('should throw error for invalid stage', async () => {
    const validClient = { name: 'A', age: '1', medicalHistory: 'x', currentConcerns: 'y' };
    await expect(openai.generateCarePlan(validClient, 99)).rejects.toThrow('Invalid stage: 99');
  });

  it('should return a plan string for valid input', async () => {
    const validClient = { name: 'A', age: '1', medicalHistory: 'x', currentConcerns: 'y' };
    const plan = await openai.generateCarePlan(validClient, 1);
    expect(plan).toBe('mocked plan');
  });

  it('should return quality scores for a care plan', async () => {
    const scores = await openai.validateQuality('mocked plan');
    expect(scores).toEqual({ overall: 5 });
  });

  it('should return enhanced plan', async () => {
    const enhanced = await openai.researchEnhancement('mocked plan');
    expect(enhanced).toBe('enhanced plan');
  });

  it('should run generateAndValidate and return all results', async () => {
    const validClient = { name: 'A', age: '1', medicalHistory: 'x', currentConcerns: 'y' };
    const result = await openai.generateAndValidate(validClient);
    expect(result).toEqual({ plan: 'mocked plan', quality: { overall: 5 }, enhanced: 'enhanced plan' });
  });
}); 