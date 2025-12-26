import { useMemo } from "react";
import { AlertCircle, Quote, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LanguageAnalysis {
  conversation_id?: number;
  scores: {
    clarity: number;
    range: number;
    flow: number;
    overall: number;
  };
  mistakes: Array<{
    category: string;
    description: string;
    quote: string;
    correction: string;
  }>;
  dimension_evidence: {
    clarity: string[];
    range: string[];
    flow: string[];
  };
}

interface LanguageAnalysisViewProps {
  content: string;
}

function stripMarkdownCodeBlock(text: string): string {
  let cleaned = text.trim();
  
  // Remove ```json ... ``` or ``` ... ``` wrappers (handles various formats)
  // First try exact match at start/end
  const exactMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (exactMatch) {
    return exactMatch[1].trim();
  }
  
  // Try to find JSON block anywhere in the text
  const blockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (blockMatch) {
    return blockMatch[1].trim();
  }
  
  // Remove leading/trailing ``` if present but not properly formatted
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```$/, '');
  
  return cleaned.trim();
}

const categoryColors: Record<string, string> = {
  articles: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  prepositions: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  pronouns: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  tense: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  nouns: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  word_order: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  word_form: "bg-lime-500/10 text-lime-600 border-lime-500/20",
  determiners: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  verb_form: "bg-red-500/10 text-red-600 border-red-500/20",
  verb_agreement: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  adjectives: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  adverbs: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  particles: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
  plurals: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  conjunctions: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  vocabulary: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

function ScoreCard({ label, score }: { label: string; score: number }) {
  const getScoreColor = (s: number) => {
    if (s === 3) return "text-green-600 bg-green-500/10";
    if (s === 2) return "text-yellow-600 bg-yellow-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const getScoreLabel = (s: number) => {
    if (s === 3) return "Strong";
    if (s === 2) return "Moderate";
    return "Needs Work";
  };

  return (
    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 border">
      <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </span>
      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}
      </span>
      <span className={`text-xs ${getScoreColor(score)} px-2 py-0.5 rounded-full mt-1`}>
        {getScoreLabel(score)}
      </span>
    </div>
  );
}

function MistakeCard({ mistake }: { mistake: LanguageAnalysis["mistakes"][0] }) {
  const colorClass = categoryColors[mistake.category] || categoryColors.other;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: `hsl(var(--destructive))` }}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={colorClass}>
            {mistake.category.replace("_", " ")}
          </Badge>
          <span className="text-sm text-muted-foreground">{mistake.description}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Original: </span>
              <span className="italic text-destructive/80">"{mistake.quote}"</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <span className="text-muted-foreground">Correction: </span>
              <span className="italic text-green-600">"{mistake.correction}"</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EvidenceSection({
  title,
  quotes,
}: {
  title: string;
  quotes: string[];
}) {
  if (!quotes || quotes.length === 0) return null;

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
        <Quote className="h-3 w-3" />
        <span>{title} Evidence ({quotes.length})</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2 pl-5">
        {quotes.map((quote, idx) => (
          <blockquote
            key={idx}
            className="text-xs italic border-l-2 border-primary/30 pl-3 py-1 text-muted-foreground"
          >
            "{quote}"
          </blockquote>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LanguageAnalysisView({ content }: LanguageAnalysisViewProps) {
  const { analysis, error } = useMemo(() => {
    if (!content || content === "null") {
      return { analysis: null, error: null };
    }

    try {
      const cleanedContent = stripMarkdownCodeBlock(content);
      const parsed = JSON.parse(cleanedContent) as LanguageAnalysis;

      if (parsed.scores && typeof parsed.scores.overall === "number") {
        return { analysis: parsed, error: null };
      }

      return { analysis: null, error: "Unexpected format" };
    } catch (e) {
      return { analysis: null, error: "Failed to parse analysis" };
    }
  }, [content]);

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-md text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
        <details className="ml-auto">
          <summary className="text-xs cursor-pointer">Raw output</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap max-h-40 overflow-auto">
            {content}
          </pre>
        </details>
      </div>
    );
  }

  if (!analysis) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-4">
        No language analysis available
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scores Section */}
      <div>
        <h5 className="text-sm font-medium mb-3 text-foreground">Scores</h5>
        <div className="grid grid-cols-4 gap-3">
          <ScoreCard label="Clarity" score={analysis.scores.clarity} />
          <ScoreCard label="Range" score={analysis.scores.range} />
          <ScoreCard label="Flow" score={analysis.scores.flow} />
          <ScoreCard label="Overall" score={analysis.scores.overall} />
        </div>
      </div>

      {/* Mistakes Section */}
      {analysis.mistakes && analysis.mistakes.length > 0 && (
        <div>
          <h5 className="text-sm font-medium mb-3 text-foreground">
            Mistakes ({analysis.mistakes.length})
          </h5>
          <div className="space-y-3">
            {analysis.mistakes.map((mistake, idx) => (
              <MistakeCard key={idx} mistake={mistake} />
            ))}
          </div>
        </div>
      )}

      {/* Dimension Evidence */}
      {analysis.dimension_evidence && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium mb-3 text-foreground">Evidence</h5>
          <EvidenceSection
            title="Clarity"
            quotes={analysis.dimension_evidence.clarity}
          />
          <EvidenceSection
            title="Range"
            quotes={analysis.dimension_evidence.range}
          />
          <EvidenceSection
            title="Flow"
            quotes={analysis.dimension_evidence.flow}
          />
        </div>
      )}
    </div>
  );
}
