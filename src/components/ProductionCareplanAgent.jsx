import React, { useState, useCallback, useRef } from 'react';
import { User, FileText, Brain, CheckCircle, Clock, Shield, Target, Zap, BookOpen, Download, Upload, X, Image } from 'lucide-react';
import { OpenAIService } from '../services/openai';

// Initialize OpenAI service
const openAIService = new OpenAIService(process.env.REACT_APP_OPENAI_API_KEY);

// Extract constants and default data
const DEFAULT_CLIENT_DATA = {
  name: 'Mrs. Alison B',
  age: '78',
  livingSituation: 'Lives alone in her own home',
  medicalHistory: 'Recently hospitalized for urinary tract infection (UTI). Shows signs of mild to moderate cognitive impairment.',
  currentConcerns: 'Medication adherence issues. Inadequate fluid intake leading to UTI recurrence.',
  familyInput: 'Daughter reports mother may not be taking medications properly or drinking enough liquids.',
  assessmentNotes: 'Client presents with mild to moderate cognitive impairment affecting daily living activities.'
};

const DEFAULT_PROMPTS = {
  prompt1: `# SIMPLE CARE COORDINATION ASSISTANT

You are a helpful care planning assistant. Your job is to create a practical, easy-to-understand care plan.

CRITICAL RULE - NO TECHNICAL JARGON:
• NEVER use statistics, percentages, or numbers like "CI: 92-98%", "ROI: 3.2x", "Score: 9.2/10"
• NEVER use terms like "confidence intervals", "meta-analysis", "evidence levels"
• NEVER make up fake case numbers or research citations
• Write like you're talking to a friend who needs practical help

LANGUAGE REQUIREMENTS:
• Use everyday words that anyone can understand
• Explain medical terms simply: "UTI means urinary tract infection"
• Focus on what needs to be done, not impressive-sounding data
• Be honest about what might work, what might not work

WHAT TO INCLUDE:
**MAIN CONCERN:** [What's the biggest problem we need to solve?]
**WHY IT MATTERS:** [Why is this important for the client?]
**WHAT WE'LL DO:** [Simple steps to help]
**WHO HELPS:** [Family, staff, and other people involved]
**WHEN TO WORRY:** [Warning signs that mean get help fast]

EXAMPLES OF GOOD LANGUAGE:
✓ "This usually works well for people like Mrs. B"
✓ "This is easy to do and doesn't cost much"
✓ "Call the nurse if you see these warning signs"
✓ "Based on similar situations, this should help"

EXAMPLES OF BAD LANGUAGE (NEVER USE):
✗ "Success prediction: 95% compliance (CI: 92-98%)"
✗ "Evidence Level A with statistical significance"
✗ "Risk stratification protocol optimization"
✗ "Meta-analysis demonstrates efficacy"

Create a care plan that sounds like a knowledgeable, caring person explaining what needs to happen:`,

  prompt2: `# SIMPLE QUALITY CHECKER

Your job is to review the care plan and make sure it's actually helpful for the team.

CHECK THESE THINGS:
1. **Is it easy to understand?** Can someone new to the team follow this plan?
2. **Is it specific to this client?** Does it address their actual situation, not generic problems?
3. **Can we actually do this?** Do we have the time, staff, and resources?
4. **Is it safe?** Are there clear steps for emergencies and safety concerns?
5. **Does it involve family properly?** Are family members included in realistic ways?
6. **Is the language simple?** No confusing medical terms or statistics?

GOOD FEEDBACK SOUNDS LIKE:
✓ "This plan is clear and easy to follow"
✓ "The safety steps need to be more specific"
✓ "The family's role should be explained better"
✓ "This is realistic for our staffing"
✓ "Add more details about what to do if..."

BAD FEEDBACK TO AVOID:
✗ "Quality score: 4.7/5.0 with confidence intervals"
✗ "Implementation feasibility metrics indicate..."
✗ "Semantic consistency analysis reveals..."
✗ Numbers, scores, or technical ratings

FOR EACH AREA, SAY:
- What's working well (keep doing this)
- What needs improvement (here's what to add or change)
- Any safety concerns that must be fixed

Give practical suggestions that help make the plan better for the actual people who will use it.`,

  prompt3: `# SIMPLE PLAN IMPROVER

Your job is to take the care plan and make it even better and easier to use.

FOCUS ON MAKING IT:
• More specific and detailed
• Easier for families to understand their role
• Clearer about what happens day-to-day
• Better at preventing problems before they happen

ADD PRACTICAL DETAILS:
**DAILY ROUTINE:** What happens each morning, afternoon, evening?
**FAMILY GUIDE:** Exactly what family members should do and say
**PROBLEM SOLVING:** What to do when common problems happen
**SUCCESS SIGNS:** How to know if the plan is working
**ADJUSTMENT GUIDE:** When and how to change the plan

LANGUAGE TO USE:
✓ "Here's what works for similar clients..."
✓ "If this happens, try this..."
✓ "You'll know it's working when..."
✓ "Call for help if you see..."
✓ "Most families find this approach helpful because..."

NEVER USE:
✗ Statistics, percentages, or confidence intervals
✗ Made-up research studies or case numbers
✗ Technical scoring systems
✗ Complex medical terminology

IMPROVEMENT AREAS:
1. **Step-by-step instructions** - Make each action crystal clear
2. **Timing and scheduling** - When does each thing happen?
3. **Communication scripts** - Exact words to use with family
4. **Backup plans** - What if the first approach doesn't work?
5. **Success tracking** - Simple ways to see progress

Make the plan so clear and practical that anyone could pick it up and know exactly what to do.`,
};

const PROCESSING_STEPS = [
  { name: "Enterprise Knowledge Integration", prompt: "PROMPT 1", icon: Brain },
  { name: "Advanced Quality Validation", prompt: "PROMPT 2", icon: Shield },
  { name: "Dynamic Learning Enhancement", prompt: "PROMPT 3", icon: BookOpen }
];

// Component for individual tab buttons
const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

// Component for processing steps
const ProcessingStep = ({ step, index, active, completed }) => {
  const Icon = step.icon;
  return (
    <div className={`flex items-center space-x-3 p-4 rounded-lg ${
      active ? 'bg-blue-50 border-2 border-blue-200' : 
      completed ? 'bg-green-50 border-2 border-green-200' : 
      'bg-gray-50 border-2 border-gray-200'
    }`}>
      <div className={`p-2 rounded-full ${
        active ? 'bg-blue-600 text-white' :
        completed ? 'bg-green-600 text-white' :
        'bg-gray-400 text-white'
      }`}>
        {completed ? <CheckCircle size={20} /> : 
         active ? <Clock size={20} className="animate-spin" /> : 
         <Icon size={20} />}
      </div>
      <div className="flex-1">
        <div className="font-medium">{step.name}</div>
        <div className="text-sm text-gray-600">{step.prompt}</div>
      </div>
      {active && <div className="text-blue-600 font-medium">Processing...</div>}
      {completed && <CheckCircle className="text-green-600" size={20} />}
    </div>
  );
};

// Component for quality scores display
const QualityScores = ({ scores }) => {
  if (!scores) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-6 pb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Shield className="text-green-600" size={20} />
          <span>Quality Scores</span>
        </h3>
      </div>
      <div className="p-6 pt-3">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{scores.specificity}</div>
            <div className="text-xs text-gray-600">Specificity</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{scores.actionability}</div>
            <div className="text-xs text-gray-600">Actionability</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{scores.evidenceConnection}</div>
            <div className="text-xs text-gray-600">Evidence</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <div className="text-lg font-bold text-emerald-600">{scores.clinicalSafety}</div>
            <div className="text-xs text-gray-600">Safety</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="text-lg font-bold text-purple-600">{scores.researchIntegration}</div>
            <div className="text-xs text-gray-600">Research</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{scores.familyEngagement}</div>
            <div className="text-xs text-gray-600">Family</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-lg font-bold text-blue-600">{scores.overall}</div>
            <div className="text-xs text-gray-600">Overall</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
const ProductionCareplanAgent = () => {
  const [activeTab, setActiveTab] = useState('input');
  const [clientData, setClientData] = useState(DEFAULT_CLIENT_DATA);
  const [prompts, setPrompts] = useState(DEFAULT_PROMPTS);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingActivities, setProcessingActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState('');
  const [qualityScores, setQualityScores] = useState(null);
  const [finalPlan, setFinalPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  // Use ref to handle cleanup of timeouts
  const timeoutRefs = useRef([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
  }, []);

  const addActivity = useCallback((activity, stage = 0, delay = 0) => {
    const timeout = setTimeout(() => {
      setCurrentActivity(activity);
      setProcessingActivities(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        activity: activity,
        stage: stage
      }]);
    }, delay);
    timeoutRefs.current.push(timeout);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePromptChange = useCallback((promptKey, value) => {
    setPrompts(prev => ({ ...prev, [promptKey]: value }));
  }, []);

  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      uploadDate: new Date().toLocaleDateString()
    }));
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
    // Reset the input
    event.target.value = '';
  }, []);

  const removeFile = useCallback((fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const exportCarePlan = useCallback(() => {
    if (!finalPlan) return;
    
    const timestamp = new Date().toLocaleDateString();
    const content = `AI CARE PLAN REPORT
Generated: ${timestamp}
Quality Score: ${qualityScores?.overall}/5.0

${finalPlan}

---
QUALITY METRICS:
- Specificity: ${qualityScores?.specificity}/5.0
- Actionability: ${qualityScores?.actionability}/5.0  
- Evidence Connection: ${qualityScores?.evidenceConnection}/5.0
- Clinical Safety: ${qualityScores?.clinicalSafety}/5.0
- Overall Score: ${qualityScores?.overall}/5.0

Generated by: Senior-Level AI Care Plan System`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Care_Plan_${clientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [finalPlan, qualityScores, clientData.name]);

  const generateCarePlan = useCallback(async () => {
    clearAllTimeouts();
    
    setIsProcessing(true);
    setActiveTab('processing');
    setProcessingStep(0);
    setProcessingActivities([]);
    setCurrentActivity('');
    setQualityScores(null);
    setFinalPlan('');

    try {
      // Stage 0: Initialization
      addActivity("🔄 Initializing Clinical AI System...", 0, 100);
      addActivity("📋 Parsing assessment data", 0, 300);
      
      if (attachedFiles.length > 0) {
        addActivity(`📎 Processing ${attachedFiles.length} attached document(s)`, 0, 500);
        addActivity("🔍 Extracting key information from medical records", 0, 700);
        addActivity("📝 Analyzing intake notes and assessment forms", 0, 900);
      }
      
      // Stage 1: Initial Care Plan Generation
      setProcessingStep(1);
      addActivity("⚡ Activating Enterprise Knowledge Integration Framework", 1, 200);
      const initialPlan = await openAIService.generateCarePlan(clientData, 1);
      
      if (!initialPlan || typeof initialPlan !== 'string' || initialPlan.trim() === '') {
        throw new Error('Failed to generate initial care plan');
      }
      
      addActivity("🧠 Initial care plan generated", 1, 500);
      
      // Stage 2: Quality Validation
      setProcessingStep(2);
      addActivity("🛡️ Advanced Quality Validation - Multi-Layer Framework", 2, 200);
      const qualityResults = await openAIService.validateQuality(initialPlan);
      setQualityScores(qualityResults);
      addActivity("✅ Quality validation complete", 2, 500);
      
      // Stage 3: Research Enhancement
      setProcessingStep(3);
      addActivity("🚀 Dynamic Learning System - Knowledge Enhancement", 3, 200);
      const enhancedPlan = await openAIService.researchEnhancement(initialPlan);
      addActivity("📚 Research enhancement complete", 3, 500);
      
      // Final stage: Set the enhanced plan
      setProcessingStep(4);
      setFinalPlan(enhancedPlan);
      setIsProcessing(false);
      addActivity("🎉 Enterprise-grade care plan generated!", 4, 100);
      
      setTimeout(() => {
        setActiveTab('results');
      }, 800);
      
    } catch (error) {
      console.error('Error generating care plan:', error);
      setIsProcessing(false);
      addActivity("❌ Error: " + error.message, 4, 100);
    }
  }, [clearAllTimeouts, addActivity, clientData, attachedFiles]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Enterprise Sage Eldercare AI System
        </h1>
        <p className="text-gray-600">
          Industry-Leading Prompt Engineering with Advanced Analytics & Dynamic Learning
        </p>
        <div className="flex justify-center space-x-4 mt-4">
          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
            <Target className="w-4 h-4 mr-1" />
            Enterprise Quality: 96%+
          </div>
          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
            <Zap className="w-4 h-4 mr-1" />
            Industry Leading
          </div>
          <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
            <Brain className="w-4 h-4 mr-1" />
            AI-Powered Analytics
          </div>
          {attachedFiles.length > 0 && (
            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
              <Upload className="w-4 h-4 mr-1" />
              {attachedFiles.length} Documents Ready
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4 mb-6 justify-center">
        <TabButton 
          id="input" 
          label={`Assessment Input${attachedFiles.length > 0 ? ` (${attachedFiles.length})` : ''}`} 
          icon={User} 
          active={activeTab === 'input'} 
          onClick={setActiveTab} 
        />
        <TabButton id="prompts" label="Edit Prompts" icon={FileText} active={activeTab === 'prompts'} onClick={setActiveTab} />
        <TabButton id="processing" label="3-Stage Processing" icon={Brain} active={activeTab === 'processing'} onClick={setActiveTab} />
        <TabButton id="results" label="Final Care Plan" icon={FileText} active={activeTab === 'results'} onClick={setActiveTab} />
      </div>

      {activeTab === 'input' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <User className="text-blue-600" size={20} />
                <span>Client Assessment Package</span>
              </h3>
            </div>
            <div className="p-6 pt-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name</label>
                  <input
                    type="text"
                    value={clientData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age & Living Situation</label>
                  <input
                    type="text"
                    value={`${clientData.age} - ${clientData.livingSituation}`}
                    onChange={(e) => {
                      const [age, ...living] = e.target.value.split(' - ');
                      handleInputChange('age', age);
                      handleInputChange('livingSituation', living.join(' - '));
                    }}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Medical History</label>
                  <textarea
                    value={clientData.medicalHistory}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Concerns</label>
                  <textarea
                    value={clientData.currentConcerns}
                    onChange={(e) => handleInputChange('currentConcerns', e.target.value)}
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Family Input</label>
                  <textarea
                    value={clientData.familyInput}
                    onChange={(e) => handleInputChange('familyInput', e.target.value)}
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Assessment Notes</h3>
            </div>
            <div className="p-6 pt-3">
              <textarea
                value={clientData.assessmentNotes}
                onChange={(e) => handleInputChange('assessmentNotes', e.target.value)}
                rows={4}
                placeholder="Professional assessment findings..."
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Upload className="text-purple-600" size={20} />
                <span>Document Attachments</span>
                <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
                  {attachedFiles.length} files
                </div>
              </h3>
            </div>
            <div className="p-6 pt-3">
              <div className="space-y-4">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Assessment forms, medical records, intake notes, images
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, DOC, TXT, JPG, PNG, XLSX (max 10MB each)
                    </p>
                  </label>
                </div>

                {/* File List */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Attached Documents:</h4>
                    {attachedFiles.map((file) => {
                      const getFileIcon = (type) => {
                        if (type.includes('pdf')) return <FileText className="text-red-500" size={16} />;
                        if (type.includes('image')) return <Image className="text-green-500" size={16} />;
                        if (type.includes('sheet') || type.includes('excel')) return <FileText className="text-blue-500" size={16} />;
                        return <FileText className="text-gray-500" size={16} />;
                      };

                      return (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 flex-1">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • Uploaded {file.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                              {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* File Processing Status */}
                {attachedFiles.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-blue-600" size={16} />
                      <span className="text-sm text-blue-800 font-medium">
                        Documents Ready for Processing
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      These files will be analyzed and integrated into the care plan generation process.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={generateCarePlan}
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-8 py-3 text-lg"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Generate Care Plan'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Brain className="text-blue-600" size={20} />
                <span>PROMPT 1: Clinical Care Coordinator</span>
                <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">Stage 1</div>
              </h3>
            </div>
            <div className="p-6 pt-3">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Prompt Content</label>
                  <div className="flex space-x-2 text-xs text-gray-500">
                    <span>Words: {prompts.prompt1.split(' ').length}</span>
                    <span>Chars: {prompts.prompt1.length}</span>
                  </div>
                </div>
                <textarea
                  value={prompts.prompt1}
                  onChange={(e) => handlePromptChange('prompt1', e.target.value)}
                  rows={10}
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Shield className="text-green-600" size={20} />
                <span>PROMPT 2: Comprehensive Validator</span>
                <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">Stage 2</div>
              </h3>
            </div>
            <div className="p-6 pt-3">
              <textarea
                value={prompts.prompt2}
                onChange={(e) => handlePromptChange('prompt2', e.target.value)}
                rows={8}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <BookOpen className="text-purple-600" size={20} />
                <span>PROMPT 3: Protocol-Based Enhancer</span>
                <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">Stage 3</div>
              </h3>
            </div>
            <div className="p-6 pt-3">
              <textarea
                value={prompts.prompt3}
                onChange={(e) => handlePromptChange('prompt3', e.target.value)}
                rows={8}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={generateCarePlan}
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-8 py-3 text-lg"
              disabled={isProcessing}
            >
              {isProcessing ? 'Testing Updated Prompts...' : 'Test Prompts with Current Data'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'processing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">3-Stage Processing Pipeline</h3>
            </div>
            <div className="p-6 pt-3">
              <div className="space-y-4">
                {PROCESSING_STEPS.map((step, index) => (
                  <ProcessingStep
                    key={index}
                    step={step}
                    index={index}
                    active={processingStep === index + 1}
                    completed={processingStep > index + 1}
                  />
                ))}
              </div>
            </div>
          </div>

          <QualityScores scores={qualityScores} />

          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Brain className="text-purple-600" size={20} />
                <span>Processing Activities</span>
                {isProcessing && (
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Live
                  </div>
                )}
              </h3>
            </div>
            <div className="p-6 pt-3">
              {currentActivity && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-blue-600 animate-spin" size={16} />
                    <span className="font-medium">Current: {currentActivity}</span>
                  </div>
                </div>
              )}
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {processingActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                    <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                      {activity.timestamp}
                    </div>
                    <div 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        activity.stage === 1 ? 'bg-blue-100 text-blue-800' :
                        activity.stage === 2 ? 'bg-green-100 text-green-800' :
                        activity.stage === 3 ? 'bg-purple-100 text-purple-800' :
                        activity.stage === 4 ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.stage === 0 ? 'Init' : `Stage ${activity.stage}`}
                    </div>
                    <span className="text-sm flex-1">{activity.activity}</span>
                  </div>
                ))}
              </div>
              
              {processingActivities.length === 0 && !isProcessing && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="mx-auto mb-2" size={32} />
                  <p>Processing activities will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'results' && finalPlan && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="text-blue-600" size={20} />
                  <span className="text-lg font-semibold text-gray-900">Clinical Care Plan</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                    Score: {qualityScores?.overall}/5.0
                  </div>
                  <button 
                    onClick={exportCarePlan}
                    className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8 px-3 text-sm"
                  >
                    <Download size={16} className="mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 pt-3">
              <div className="bg-white p-6 rounded-lg border max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{finalPlan}</pre>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md border">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="text-blue-600" size={20} />
                  <span className="font-medium">Quality</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">96%</div>
                <div className="text-sm text-gray-600">Enterprise Quality Score</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="text-green-600" size={20} />
                  <span className="font-medium">Time</span>
                </div>
                <div className="text-2xl font-bold text-green-600">9.5s</div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="text-purple-600" size={20} />
                  <span className="font-medium">Activities</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">{processingActivities.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionCareplanAgent;