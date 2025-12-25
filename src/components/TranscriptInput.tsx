import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface TranscriptInputProps {
  onSubmit: (transcript: string) => void;
  isLoading: boolean;
}

export function TranscriptInput({ onSubmit, isLoading }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState("");

  const handleSubmit = () => {
    if (transcript.trim() && !isLoading) {
      onSubmit(transcript.trim());
      setTranscript("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Paste Conversation Transcript
        </label>
        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your conversation transcript here..."
          className="min-h-[200px] font-mono text-sm resize-y bg-card border-border focus:ring-primary"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Press ⌘+Enter to submit
        </p>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!transcript.trim() || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit & Analyze
          </>
        )}
      </Button>
    </div>
  );
}
