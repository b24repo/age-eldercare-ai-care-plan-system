const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const { body, validationResult } = require('express-validator');

dotenv.config();

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required');
  process.exit(1);
}

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000 // 30 seconds timeout
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Response cache
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

// Validation middleware
const validateClientData = [
  body('clientData').isObject(),
  body('clientData.name').isString().notEmpty(),
  body('clientData.age').isString().notEmpty(),
  body('clientData.medicalHistory').isString().notEmpty(),
  body('clientData.currentConcerns').isString().notEmpty(),
  body('prompt').isString().notEmpty()
];

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
};

// Generate care plan
app.post('/api/ai/care-plan', validateClientData, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientData, prompt } = req.body;
    const cacheKey = `care-plan:${JSON.stringify(clientData)}`;

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: JSON.stringify(clientData) }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const response = { content: completion.choices[0].message.content };
    
    // Cache response
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Assess quality
app.post('/api/ai/assess-quality', [
  body('carePlan').isString().notEmpty().withMessage('Care plan is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ 
        error: {
          message: 'Invalid request data',
          details: errors.array()
        }
      });
    }

    const { carePlan } = req.body;
    const cacheKey = `quality:${carePlan}`;

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a healthcare quality assessment AI. Evaluate the care plan against these criteria:
            - Specificity (1-5)
            - Actionability (1-5)
            - Evidence Connection (1-5)
            - Clinical Safety (1-5)
            - Research Integration (1-5)
            - Family Engagement (1-5)
            - Overall Effectiveness (1-5)
            
            Return a JSON object with scores and brief explanations.`
        },
        { role: "user", content: carePlan }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let response;
    try {
      response = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from OpenAI');
    }
    
    // Cache response
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    res.json(response);
  } catch (error) {
    console.error('Error in assess-quality:', error);
    next(error);
  }
});

// Enhance with research
app.post('/api/ai/enhance-research', [
  body('carePlan').isString().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { carePlan } = req.body;
    const cacheKey = `research:${carePlan}`;

    // Check cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a clinical research AI specialist. Enhance the care plan by:
            1. Adding relevant research citations
            2. Incorporating evidence-based protocols
            3. Suggesting specific outcome measurements
            4. Identifying potential implementation barriers
            
            Format your response as a structured enhancement to the original plan.`
        },
        { role: "user", content: carePlan }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const response = { content: completion.choices[0].message.content };
    
    // Cache response
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 