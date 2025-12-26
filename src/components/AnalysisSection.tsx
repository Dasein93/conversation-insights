import { Loader2, Brain, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MemoryEventsTable } from "./MemoryEventsTable";
import { LanguageAnalysisView } from "./LanguageAnalysisView";

interface AnalysisSectionProps {
  title: string;
  type: "memory" | "language";
  content: string | null;
  status: "idle" | "loading" | "complete" | "error";
}

export function AnalysisSection({ title, type, content, status }: AnalysisSectionProps) {
  const Icon = type === "memory" ? Brain : MessageSquare;

  const getStatusBadge = () => {
    switch (status) {
      case "loading":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing
          </Badge>
        );
      case "complete":
        return (
          <Badge variant="default" className="gap-1 bg-primary/10 text-primary border-primary/20">
            <CheckCircle className="h-3 w-3" />
            Complete
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm text-foreground">{title}</h4>
        </div>
        {getStatusBadge()}
      </div>

      <div className="bg-muted/50 rounded-md p-4 min-h-[100px]">
        {status === "loading" ? (
          <div className="flex items-center justify-center h-20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Running analysis...</span>
            </div>
          </div>
        ) : status === "error" ? (
          <p className="text-sm text-destructive">
            Failed to complete analysis. Please try again.
          </p>
        ) : content ? (
          type === "memory" ? (
            <MemoryEventsTable content={content} />
          ) : (
            <LanguageAnalysisView content={content} />
          )
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No analysis available
          </p>
        )}
      </div>
    </div>
  );
}
