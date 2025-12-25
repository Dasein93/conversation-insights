import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Quote, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Evidence {
  kind: string;
  ref: string[];
}

export interface MemoryEvent {
  event_id: string;
  type: string;
  actor: string;
  subject: string;
  content: string;
  status: string;
  evidence: Evidence[];
  timestamp: string;
}

interface MemoryEventCardProps {
  event: MemoryEvent;
}

const eventTypeColors: Record<string, string> = {
  goal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  preference: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  belief: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  plan: "bg-green-500/10 text-green-600 border-green-500/20",
  decision: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  constraint: "bg-red-500/10 text-red-600 border-red-500/20",
  question: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  insight: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  emotion: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

const statusColors: Record<string, string> = {
  asserted: "bg-green-500/10 text-green-600 border-green-500/20",
  tentative: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  resolved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  expired: "bg-muted text-muted-foreground border-muted",
};

export function MemoryEventCard({ event }: MemoryEventCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const typeColor = eventTypeColors[event.type] || "bg-muted text-muted-foreground border-muted";
  const statusColor = statusColors[event.status] || "bg-muted text-muted-foreground border-muted";

  const allQuotes = event.evidence?.flatMap((e) => e.ref) || [];

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs font-medium uppercase", typeColor)}>
            {event.type}
          </Badge>
          <span className="font-medium text-sm text-foreground">{event.subject}</span>
        </div>
        <Badge variant="outline" className={cn("text-xs", statusColor)}>
          {event.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 border-t border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">{event.content}</p>
      </div>

      {/* Evidence Section */}
      {allQuotes.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 transition-colors"
          >
            {showEvidence ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Quote className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {allQuotes.length} quote{allQuotes.length !== 1 ? "s" : ""}
            </span>
          </button>

          {showEvidence && (
            <div className="px-3 pb-3 space-y-2">
              {allQuotes.map((quote, idx) => (
                <blockquote
                  key={idx}
                  className="pl-3 border-l-2 border-primary/30 text-xs italic text-muted-foreground"
                >
                  "{quote}"
                </blockquote>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Metadata */}
      <div className="flex items-center gap-4 px-3 py-2 bg-muted/20 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{event.actor}</span>
        </div>
        {event.timestamp && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(event.timestamp).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
