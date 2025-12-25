import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TranscriptInputProps {
  onSubmit: (transcript: string, name: string, date: string) => void;
  isLoading: boolean;
}

export function TranscriptInput({ onSubmit, isLoading }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = () => {
    if (transcript.trim() && name.trim() && !isLoading) {
      onSubmit(transcript.trim(), name.trim(), date);
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Person's name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="bg-card border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium text-foreground">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
            className="bg-card border-border"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Paste Conversation Transcript
        </Label>
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
        disabled={!transcript.trim() || !name.trim() || isLoading}
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
