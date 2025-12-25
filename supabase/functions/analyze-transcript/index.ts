import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Starting ${analysisType} analysis for transcript of length: ${transcript.length}`);

    let systemPrompt = "";
    
    if (analysisType === "memory") {
      systemPrompt = `You are an expert at extracting conversational continuity memory from dialogues. 
      
Analyze the following conversation transcript and extract:
1. **User Preferences**: What the user likes, dislikes, or prefers
2. **Stated Beliefs**: Opinions, worldviews, or beliefs expressed
3. **Future Plans**: Intentions, goals, or plans mentioned
4. **Personal Context**: Background info, relationships, circumstances
5. **Recurring Themes**: Topics or concerns that come up repeatedly

Format your response as a structured analysis with clear sections. Be specific and quote relevant parts of the conversation where helpful.`;
    } else if (analysisType === "language") {
      systemPrompt = `You are a linguistic analyst specializing in conversational language patterns.

Analyze the following conversation transcript for:
1. **Language Patterns**: Common phrases, speech patterns, vocabulary choices
2. **Grammar & Syntax**: Any grammatical errors or unusual constructions
3. **Communication Style**: Formal/informal, verbose/concise, tone indicators
4. **Mistakes & Issues**: Typos, misunderstandings, unclear expressions
5. **Notable Expressions**: Unique phrases, idioms, or recurring expressions

Format your response as a structured analysis. Be specific and provide examples from the text.`;
    } else {
      throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this conversation transcript:\n\n${transcript}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    console.log(`${analysisType} analysis completed successfully`);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-transcript function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
