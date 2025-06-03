import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export class BackendService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Makes a secure API call to the backend
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} API response
   */
  async makeSecureCall(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers.get('retry-after') || 1;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.makeSecureCall(endpoint, data);
      }
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error?.message || 'Invalid request data';
        const errorDetails = error.response.data?.error?.details || [];
        throw new Error(`${errorMessage}${errorDetails.length ? ': ' + errorDetails.map(d => d.msg).join(', ') : ''}`);
      }
      
      throw error;
    }
  }

  /**
   * Generates a care plan using the backend AI service
   * @param {Object} clientData - Client information
   * @param {string} prompt - System prompt
   * @returns {Promise<string>} Generated care plan
   */
  async generateCarePlan(clientData, prompt) {
    if (!clientData || !prompt) {
      throw new Error('Client data and prompt are required');
    }

    try {
      const response = await this.makeSecureCall('/api/ai/care-plan', {
        clientData,
        prompt
      });

      if (!response || !response.content || typeof response.content !== 'string') {
        console.error('Invalid response from API:', response);
        throw new Error('Invalid response from API');
      }

      return response.content;
    } catch (error) {
      console.error('Error in generateCarePlan:', error);
      throw error;
    }
  }

  /**
   * Assesses the quality of a care plan
   * @param {string} carePlan - The care plan to assess
   * @returns {Promise<Object>} Quality scores
   */
  async assessQuality(carePlan) {
    if (!carePlan || typeof carePlan !== 'string' || carePlan.trim() === '') {
      throw new Error('Care plan must be a non-empty string');
    }
    return this.makeSecureCall('/api/ai/assess-quality', {
      carePlan: carePlan.trim()
    });
  }

  /**
   * Enhances a care plan with research
   * @param {string} carePlan - The care plan to enhance
   * @returns {Promise<string>} Enhanced care plan
   */
  async enhanceWithResearch(carePlan) {
    if (!carePlan || typeof carePlan !== 'string') {
      throw new Error('Care plan must be a non-empty string');
    }
    return this.makeSecureCall('/api/ai/enhance-research', {
      carePlan
    });
  }
} 