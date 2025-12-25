import { TranscriptInput } from "@/components/TranscriptInput";
import { ConversationCard } from "@/components/ConversationCard";
import { useConversations } from "@/hooks/useConversations";
import { MessageSquareText } from "lucide-react";

const Index = () => {
  const { conversations, isLoading, analysisStates, submitTranscript, deleteConversation } =
    useConversations();

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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                Analyzed Conversations
              </h2>
              <span className="text-xs text-muted-foreground">
                {conversations.length} total
              </span>
            </div>

            {conversations.length === 0 ? (
              <div className="analysis-card p-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquareText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No conversations yet
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste a transcript to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    analysisState={analysisStates[conversation.id]}
                    onDelete={deleteConversation}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
