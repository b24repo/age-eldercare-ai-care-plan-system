export const CONFIG = {
  MODELS: {
    DEFAULT: "gpt-4-turbo-preview"
  },
  TEMPERATURES: {
    DEFAULT: 0.7,
    VALIDATION: 0.3,
    RESEARCH: 0.5
  },
  TOKENS: {
    DEFAULT: 2000,
    VALIDATION: 1000,
    RESEARCH: 1500
  },
  CACHE: {
    TTL: 3600000 // 1 hour in milliseconds
  }
}; 