import { CONFIG } from '../config/openai.config';
import { BackendService } from './backend';

/**
 * @typedef {Object} ClientData
 * @property {string} name - Client's full name
 * @property {string} age - Client's age
 * @property {string} medicalHistory - Client's medical history
 * @property {string} currentConcerns - Current medical concerns
 */

/**
 * @typedef {Object} QualityScores
 * @property {number} specificity - Score for plan specificity (1-5)
 * @property {number} actionability - Score for plan actionability (1-5)
 * @property {number} evidenceConnection - Score for evidence connection (1-5)
 * @property {number} clinicalSafety - Score for clinical safety (1-5)
 * @property {number} researchIntegration - Score for research integration (1-5)
 * @property {number} familyEngagement - Score for family engagement (1-5)
 * @property {number} overall - Overall effectiveness score (1-5)
 */

export class OpenAIService {
  constructor() {
    this.backend = new BackendService();
    this.cache = new Map();
  }

  /**
   * Logs errors in a structured format
   * @param {string} method - Name of the method where error occurred
   * @param {Error} error - The error object
   */
  logError(method, error) {
    console.error({
      timestamp: new Date().toISOString(),
      method,
      error: error.message,
      stack: error.stack,
      status: error.response?.status
    });
  }

  /**
   * Generates a care plan based on client data and stage
   * @param {ClientData} clientData - Client information
   * @param {number} stage - Processing stage (1-3)
   * @returns {Promise<string>} Generated care plan
   */
  async generateCarePlan(clientData, stage) {
    try {
      this.validateClientData(clientData);

      const systemPrompts = {
        1: `You are an expert healthcare AI specializing in eldercare planning. Your task is to analyze the client data and generate initial care recommendations.
            Focus on evidence-based interventions and practical solutions.
            Format your response in a clear, structured manner with sections for:
            - Primary Concerns
            - Clinical Assessment
            - Recommended Interventions
            - Risk Factors
            - Family Involvement Strategy`,
        
        2: `You are a healthcare quality assurance specialist. Review the initial care plan and validate it against:
            - Clinical safety standards
            - Evidence-based practice guidelines
            - Practical feasibility
            - Family engagement opportunities
            Provide specific feedback and suggestions for improvement.`,
        
        3: `You are a clinical research specialist in eldercare. Enhance the validated care plan by:
            - Incorporating relevant research findings
            - Adding specific intervention protocols
            - Suggesting specific outcome measurements
            - Identifying potential barriers and solutions
            Format the final plan professionally with clear sections and actionable steps.`
      };

      return await this.backend.generateCarePlan(clientData, systemPrompts[stage]);
    } catch (error) {
      this.logError('generateCarePlan', error);
      throw error;
    }
  }

  /**
   * Validates the quality of a care plan using the 7-point scorecard
   * @param {string} carePlan - The care plan to validate
   * @returns {Promise<QualityScores>} Quality scores and explanations
   */
  async validateQuality(carePlan) {
    try {
      const scoringPrompt = `
As an expert care plan reviewer, score this care plan on each criterion (1-5 scale):

1. SPECIFICITY: Are instructions detailed and actionable?
2. ACTIONABILITY: Can staff immediately implement this?
3. EVIDENCE CONNECTION: Are recommendations research-backed?
4. CLINICAL SAFETY: Are safety protocols clear and comprehensive?
5. RESEARCH INTEGRATION: Quality of research citations and evidence?
6. FAMILY ENGAGEMENT: Clear family roles and communication?
7. OVERALL EFFECTIVENESS: Holistic assessment of plan quality?

Care Plan:
${carePlan}

Return ONLY a JSON object with scores and brief explanations:
{
  "specificity": { "score": X, "explanation": "..." },
  "actionability": { "score": X, "explanation": "..." },
  "evidenceConnection": { "score": X, "explanation": "..." },
  "clinicalSafety": { "score": X, "explanation": "..." },
  "researchIntegration": { "score": X, "explanation": "..." },
  "familyEngagement": { "score": X, "explanation": "..." },
  "overall": { "score": X, "explanation": "..." }
}`;

      return await this.backend.assessQuality(carePlan);
    } catch (error) {
      this.logError('validateQuality', error);
      throw error;
    }
  }

  /**
   * Enhances a care plan with research findings
   * @param {string} carePlan - The care plan to enhance
   * @returns {Promise<string>} Enhanced care plan
   */
  async researchEnhancement(carePlan) {
    try {
      return await this.backend.enhanceWithResearch(carePlan);
    } catch (error) {
      this.logError('researchEnhancement', error);
      throw error;
    }
  }

  /**
   * Validates client data for required fields
   * @param {ClientData} clientData - Client information to validate
   * @throws {Error} If required fields are missing
   */
  validateClientData(clientData) {
    const required = ['name', 'age', 'medicalHistory', 'currentConcerns'];
    const missing = required.filter(field => !clientData[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Generates and validates a complete care plan
   * @param {ClientData} clientData - Client information
   * @returns {Promise<Object>} Complete care plan with validation and enhancement
   */
  async generateAndValidate(clientData) {
    try {
      const plan = await this.generateCarePlan(clientData, 1);
      const quality = await this.validateQuality(plan);
      const enhanced = await this.researchEnhancement(plan);
      return { plan, quality, enhanced };
    } catch (error) {
      this.logError('generateAndValidate', error);
      throw error;
    }
  }
} 