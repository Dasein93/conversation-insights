import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisSection } from "./AnalysisSection";
import type { Conversation, AnalysisState } from "@/types/conversation";

interface ConversationCardProps {
  conversation: Conversation;
  analysisState?: AnalysisState;
  onDelete?: (id: string) => void;
}

export function ConversationCard({ conversation, analysisState, onDelete }: ConversationCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  const formattedDate = new Date(conversation.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const memoryStatus = analysisState?.memory || (conversation.memory_analysis ? "complete" : "idle");
  const languageStatus = analysisState?.language || (conversation.language_analysis ? "complete" : "idle");

  return (
    <div className="analysis-card animate-fade-in">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              #{conversation.conversation_number}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formattedDate}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(conversation.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Transcript Toggle */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscript(!showTranscript)}
              className="gap-2"
            >
              <FileText className="h-3.5 w-3.5" />
              {showTranscript ? "Hide" : "Show"} Transcript
            </Button>

            {showTranscript && (
              <div className="bg-muted/50 rounded-md p-4 max-h-[300px] overflow-y-auto">
                <pre className="transcript-display text-muted-foreground">
                  {conversation.raw_transcript}
                </pre>
              </div>
            )}
          </div>

          {/* Analysis Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            <AnalysisSection
              title="Memory Extraction"
              type="memory"
              content={conversation.memory_analysis}
              status={memoryStatus}
            />
            <AnalysisSection
              title="Language Analysis"
              type="language"
              content={conversation.language_analysis}
              status={languageStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
}
