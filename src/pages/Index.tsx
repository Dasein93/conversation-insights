import { useState, useMemo } from "react";
import { TranscriptInput } from "@/components/TranscriptInput";
import { ConversationCard } from "@/components/ConversationCard";
import { AggregatedMemoryView } from "@/components/AggregatedMemoryView";
import { useConversations } from "@/hooks/useConversations";
import { MessageSquareText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const Index = () => {
  const { conversations, isLoading, analysisStates, submitTranscript, deleteConversation } =
    useConversations();
  const [selectedName, setSelectedName] = useState<string>("all");

  // Get unique names for the filter
  const uniqueNames = useMemo(() => {
    const names = [...new Set(conversations.map((c) => c.name))];
    return names.sort();
  }, [conversations]);

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    if (selectedName !== "all") {
      filtered = conversations.filter((c) => c.name === selectedName);
    }
    // Sort by conversation_date descending
    return [...filtered].sort(
      (a, b) => new Date(b.conversation_date).getTime() - new Date(a.conversation_date).getTime()
    );
  }, [conversations, selectedName]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquareText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Transcript Analyzer
              </h1>
              <p className="text-xs text-muted-foreground">
                Internal evaluation tool for conversation analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
          {/* Input Panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="analysis-card p-6">
              <h2 className="text-sm font-medium text-foreground mb-4">
                New Conversation
              </h2>
              <TranscriptInput onSubmit={submitTranscript} isLoading={isLoading} />
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            <Tabs defaultValue="conversations" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="conversations">Conversations</TabsTrigger>
                <TabsTrigger value="memory">All Memories</TabsTrigger>
              </TabsList>

              <TabsContent value="conversations" className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-sm font-medium text-foreground">
                    Analyzed Conversations
                  </h2>
                  <div className="flex items-center gap-3">
                    <Select value={selectedName} onValueChange={setSelectedName}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Filter by name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Names</SelectItem>
                        {uniqueNames.map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {filteredConversations.length} of {conversations.length}
                    </span>
                  </div>
                </div>

                {filteredConversations.length === 0 ? (
                  <div className="analysis-card p-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <MessageSquareText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      {selectedName !== "all" ? "No conversations for this person" : "No conversations yet"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedName !== "all" ? "Try selecting a different name" : "Paste a transcript to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredConversations.map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        analysisState={analysisStates[conversation.id]}
                        onDelete={deleteConversation}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="memory">
                <AggregatedMemoryView conversations={conversations} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
