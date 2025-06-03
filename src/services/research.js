export class ResearchService {
  constructor(pubmedApiKey, clinicalTrialsApiKey) {
    this.pubmedApiKey = pubmedApiKey;
    this.clinicalTrialsApiKey = clinicalTrialsApiKey;
  }

  async searchPubMed(query) {
    try {
      const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
      const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&format=json&api_key=${this.pubmedApiKey}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      // Get details for each article
      const articleIds = data.esearchresult.idlist;
      const summaryUrl = `${baseUrl}/esummary.fcgi?db=pubmed&id=${articleIds.join(',')}&format=json&api_key=${this.pubmedApiKey}`;
      
      const summaryResponse = await fetch(summaryUrl);
      const summaryData = await summaryResponse.json();
      
      return Object.values(summaryData.result).filter(article => article.uid).map(article => ({
        id: article.uid,
        title: article.title,
        authors: article.authors?.map(author => author.name).join(', '),
        journal: article.fulljournalname,
        year: article.pubdate.split(' ')[0],
        abstract: article.abstract,
        url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`
      }));
    } catch (error) {
      console.error('Error searching PubMed:', error);
      return [];
    }
  }

  async searchClinicalTrials(condition) {
    try {
      const baseUrl = 'https://clinicaltrials.gov/api/query/study_fields';
      const fields = [
        'NCTId',
        'BriefTitle',
        'Condition',
        'InterventionType',
        'PrimaryOutcomeMeasure',
        'Phase',
        'StartDate',
        'CompletionDate'
      ].join(',');
      
      const searchUrl = `${baseUrl}?expr=${encodeURIComponent(condition)}&fields=${fields}&fmt=json&max_rnk=5`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      return data.StudyFieldsResponse.StudyFields.map(study => ({
        id: study.NCTId[0],
        title: study.BriefTitle[0],
        condition: study.Condition.join(', '),
        interventionType: study.InterventionType.join(', '),
        primaryOutcome: study.PrimaryOutcomeMeasure[0],
        phase: study.Phase[0],
        startDate: study.StartDate[0],
        completionDate: study.CompletionDate[0],
        url: `https://clinicaltrials.gov/study/${study.NCTId[0]}`
      }));
    } catch (error) {
      console.error('Error searching Clinical Trials:', error);
      return [];
    }
  }

  async getRelevantResearch(clientData) {
    const conditions = [
      clientData.medicalHistory,
      clientData.currentConcerns
    ].join(' ');
    
    const [pubmedResults, trialsResults] = await Promise.all([
      this.searchPubMed(conditions),
      this.searchClinicalTrials(conditions)
    ]);
    
    return {
      pubmedArticles: pubmedResults,
      clinicalTrials: trialsResults
    };
  }
} 