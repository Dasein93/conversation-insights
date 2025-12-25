import { useMemo } from "react";
import { MemoryEventCard, type MemoryEvent } from "./MemoryEventCard";
import { AlertCircle } from "lucide-react";

interface MemoryEventsTableProps {
  content: string;
}

export function MemoryEventsTable({ content }: MemoryEventsTableProps) {
  const { events, error } = useMemo(() => {
    if (!content || content === "null") {
      return { events: [], error: null };
    }

    try {
      const parsed = JSON.parse(content);
      
      if (Array.isArray(parsed)) {
        return { events: parsed as MemoryEvent[], error: null };
      }
      
      return { events: [], error: "Unexpected format" };
    } catch (e) {
      return { events: [], error: "Failed to parse analysis" };
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

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-4">
        No memory events extracted from this conversation
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground mb-2">
        {events.length} event{events.length !== 1 ? "s" : ""} extracted
      </div>
      {events.map((event) => (
        <MemoryEventCard key={event.event_id} event={event} />
      ))}
    </div>
  );
}
