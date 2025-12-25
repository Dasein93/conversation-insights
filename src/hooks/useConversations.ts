import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, AnalysisState } from "@/types/conversation";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStates, setAnalysisStates] = useState<Record<string, AnalysisState>>({});
  const { toast } = useToast();

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("conversation_number", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      return;
    }

    setConversations(data as Conversation[]);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const runAnalysis = async (conversationId: string, transcript: string, type: "memory" | "language") => {
    setAnalysisStates((prev) => ({
      ...prev,
      [conversationId]: {
        ...prev[conversationId],
        [type]: "loading",
      },
    }));

    try {
      const response = await supabase.functions.invoke("analyze-transcript", {
        body: { transcript, analysisType: type },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { analysis } = response.data;

      // Update database
      const updateField = type === "memory" ? "memory_analysis" : "language_analysis";
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ [updateField]: analysis })
        .eq("id", conversationId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, [updateField]: analysis } : c
        )
      );

      setAnalysisStates((prev) => ({
        ...prev,
        [conversationId]: {
          ...prev[conversationId],
          [type]: "complete",
        },
      }));
    } catch (error) {
      console.error(`Error running ${type} analysis:`, error);
      setAnalysisStates((prev) => ({
        ...prev,
        [conversationId]: {
          ...prev[conversationId],
          [type]: "error",
        },
      }));
      toast({
        title: "Analysis Failed",
        description: `Failed to run ${type} analysis. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const submitTranscript = async (transcript: string) => {
    setIsLoading(true);

    try {
      // Insert new conversation
      const { data, error } = await supabase
        .from("conversations")
        .insert({ raw_transcript: transcript })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newConversation = data as Conversation;
      setConversations((prev) => [newConversation, ...prev]);

      // Initialize analysis states
      setAnalysisStates((prev) => ({
        ...prev,
        [newConversation.id]: { memory: "idle", language: "idle" },
      }));

      toast({
        title: "Transcript Submitted",
        description: `Conversation #${newConversation.conversation_number} created. Running analyses...`,
      });

      // Run both analyses in parallel
      await Promise.all([
        runAnalysis(newConversation.id, transcript, "memory"),
        runAnalysis(newConversation.id, transcript, "language"),
      ]);
    } catch (error) {
      console.error("Error submitting transcript:", error);
      toast({
        title: "Error",
        description: "Failed to submit transcript",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    toast({
      title: "Deleted",
      description: "Conversation removed",
    });
  };

  return {
    conversations,
    isLoading,
    analysisStates,
    submitTranscript,
    deleteConversation,
  };
}
