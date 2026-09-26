export interface GraphDataPoint {
  year: string;
  temp: number;
}

export interface FallacyAnnotation {
  text: string;
  type: string;
  explanation: string;
}

export interface ArticleParagraph {
  id: string;
  text: string;
  fallacies: FallacyAnnotation[];
}

export interface Article {
  headline: string;
  source: string;
  author: string;
  date: string;
  imageCaption: string;
  paragraphs: ArticleParagraph[];
}

export interface SearchResult {
  title: string;
  source: string;
  snippet: string;
  type: "debunk" | "fact" | "context";
  credibility: string;
}

export interface SearchEntry {
  keywords: string[];
  results: SearchResult[];
}

export interface GraphConfig {
  title: string;
  misleadingYMin: number;
  misleadingYMax: number;
  correctYMin: number;
  correctYMax: number;
  data: GraphDataPoint[];
}

export interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  article: Article;
  graphData: GraphConfig;
  searchDatabase: SearchEntry[];
  totalFallacies: number;
  sokraticHints: string[];
}

export interface ScenariosData {
  scenarios: Scenario[];
}

export interface StudentScore {
  sessionId: string;
  scenarioId: string;
  studentName: string;
  timestamp: number;
  highlights: HighlightScore[];
  graphDiscovered: boolean;
  searchesPerformed: number;
  sokraticInteractions: number;
  totalScore: number;
  maxScore: number;
  accuracy: number;
  completionTimeSeconds: number;
}

export interface HighlightScore {
  selectedText: string;
  classifiedAs: string;
  correctType: string;
  isCorrect: boolean;
  paragraphId: string;
}
