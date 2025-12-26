import { useMemo, useState } from "react";
import { MemoryEventCard, type MemoryEvent } from "./MemoryEventCard";
import { Brain, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Conversation } from "@/types/conversation";

interface AggregatedMemoryViewProps {
  conversations: Conversation[];
}

interface AggregatedEvent extends MemoryEvent {
  conversationName: string;
  conversationDate: string;
  conversationNumber: number;
}

function stripMarkdownCodeBlock(text: string): string {
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = text.trim().match(codeBlockRegex);
  return match ? match[1].trim() : text.trim();
}

const EVENT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "preference", label: "Preferences" },
  { value: "belief", label: "Beliefs" },
  { value: "insight", label: "Insights" },
  { value: "goal", label: "Goals" },
  { value: "plan", label: "Plans" },
  { value: "decision", label: "Decisions" },
  { value: "constraint", label: "Constraints" },
  { value: "question", label: "Questions" },
  { value: "emotion", label: "Emotions" },
];

export function AggregatedMemoryView({ conversations }: AggregatedMemoryViewProps) {
  const [selectedType, setSelectedType] = useState<string>("all");

  const allEvents = useMemo(() => {
    const events: AggregatedEvent[] = [];

    conversations.forEach((conversation) => {
      if (!conversation.memory_analysis || conversation.memory_analysis === "null") {
        return;
      }

      try {
        const cleaned = stripMarkdownCodeBlock(conversation.memory_analysis);
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
          parsed.forEach((event: MemoryEvent) => {
            events.push({
              ...event,
              conversationName: conversation.name,
              conversationDate: conversation.conversation_date,
              conversationNumber: conversation.conversation_number,
            });
          });
        }
      } catch {
        // Skip invalid JSON
      }
    });

    return events;
  }, [conversations]);

  const filteredEvents = useMemo(() => {
    if (selectedType === "all") {
      return allEvents;
    }
    return allEvents.filter((e) => e.type === selectedType);
  }, [allEvents, selectedType]);

  // Get unique types that actually exist in the data
  const availableTypes = useMemo(() => {
    const types = new Set(allEvents.map((e) => e.type));
    return EVENT_TYPES.filter((t) => t.value === "all" || types.has(t.value));
  }, [allEvents]);

  // Group events by type for display
  const groupedEvents = useMemo(() => {
    const groups: Record<string, AggregatedEvent[]> = {};
    filteredEvents.forEach((event) => {
      if (!groups[event.type]) {
        groups[event.type] = [];
      }
      groups[event.type].push(event);
    });
    return groups;
  }, [filteredEvents]);

  if (allEvents.length === 0) {
    return (
      <div className="analysis-card p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Brain className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          No memory extractions yet
        </h3>
        <p className="text-xs text-muted-foreground">
          Submit conversations to extract memory events
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium text-foreground">
            All Memory Extractions
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredEvents.length} of {allEvents.length}
          </span>
        </div>
      </div>

      {/* Events grouped by type */}
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([type, events]) => (
          <div key={type} className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {type}s ({events.length})
            </h3>
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.event_id} className="relative">
                  <div className="absolute -left-4 top-2 text-[10px] text-muted-foreground">
                    {event.conversationName}
                  </div>
                  <MemoryEventCard event={event} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
