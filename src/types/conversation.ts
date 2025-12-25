export interface Conversation {
  id: string;
  conversation_number: number;
  raw_transcript: string;
  memory_analysis: string | null;
  language_analysis: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalysisState {
  memory: 'idle' | 'loading' | 'complete' | 'error';
  language: 'idle' | 'loading' | 'complete' | 'error';
}
