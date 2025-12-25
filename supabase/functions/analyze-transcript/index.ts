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
      systemPrompt = `SYSTEM ROLE

You are an event extraction engine, not a summarizer.

Your task is to extract durable and continuity-relevant state changes from a conversation so the agent can feel like it remembers past interactions naturally without seeing the full conversation history.

If nothing meaningful or continuity-relevant changed, return an empty list.

WHAT COUNTS AS AN EVENT

An event is any change or revelation that helps future conversations feel:

continuous

familiar

context-aware

human

Events may be core (important, consequential) or continuity-supporting (less important but reusable and humanizing).

Valid event categories include:

goals

decisions

preferences

beliefs / mental models

constraints

plans

insights

unresolved questions

(optional) emotional states only if persistent and relevant

ALLOWED EVENT TYPES (STRICT)

Only the following values are allowed for type:

goal

decision

preference

belief

constraint

plan

question

insight

emotion

If something does not fit one of these, discard it.

EVENT SCHEMA (REQUIRED)

Every extracted event must match this schema exactly:

{   "event_id": "uuid",   "type": "event_type",   "actor": "user | assistant | system | other",   "subject": "short noun phrase describing what the event is about",   "content": "clear, canonical statement of the durable or continuity-relevant change",   "status": "asserted | tentative | resolved | unresolved",   "evidence": [     {       "kind": "quote",       "ref": [         "exact verbatim quote from the conversation",         "another exact verbatim quote if needed"       ]     }   ],   "timestamp": "iso8601" } 

🔒 EVIDENCE (HARD CONSTRAINT)

ref MUST contain verbatim quoted text copied exactly from the conversation

No paraphrasing, summarizing, or inferred wording

Quotes may be partial but must be exact

If no suitable quote exists, omit the entire evidence field

Never fabricate evidence

If an event cannot be supported with at least one valid quote when evidence is needed, do not extract the event

HARD FILTERS (NON-NEGOTIABLE)

1. Ephemerality Filter

Do NOT extract:

momentary moods ("I'm tired", "I want to relax now")

one-off logistics with no reuse value

transient small talk

speculative ideas with no identity signal

Rule of thumb

If remembering this would not help a future conversation feel more natural, do not store it.

2. No Insight Duplication

Do NOT extract an insight if it:

restates a belief

elaborates an existing event

adds no new future consequence

exists mainly for rhetorical emphasis

Each insight must introduce a new framing that changes future reasoning.

3. Durability + Continuity Bias

Prefer events that:

reveal tendencies, tastes, or viewpoints

help the agent avoid re-asking obvious questions

support natural callbacks later

Avoid:

narrative detail without reuse value

repeated ideas already captured

eloquent but disposable phrasing

CONTINUITY RELEVANCE TEST (CRITICAL)

Extract an event even if it is not critical when remembering it would help the agent:

feel familiar

sound consistent

reference past topics naturally

Examples that should be extracted:

recurring interests ("I've always wanted to try pottery")

situational preferences ("I like earlier hikes")

mild dislikes ("Crowded trails aren't my thing")

soft opinions ("I find cluttered design frustrating")

conversational identity facts ("I work as a product designer")

Examples that should still be excluded:

one-off logistics

transient emotions

filler or politeness

Guiding question

Would forgetting this make the agent feel less human later?

If yes → extract.

EVENT TYPE GUARDRAILS

preference (EXPANDED)

Extract broadly when statements reveal:

likes / dislikes

tendencies or habits

comfort zones

aesthetic tastes

recurring conversational themes

Preferences are low-risk memory and should be favored when in doubt.

belief

Must be explicitly attributable to the actor

Phrase as "X believes…" or equivalent

Avoid universal framing unless clearly stated as such

goal

Extract only if the goal is:

longer-term or recurring

not purely emotional

relevant beyond this conversation

If a committed plan exists, do not also extract the precursor goal unless it is broader or long-term.

emotion

Extract only if the emotion is:

explicitly stated

persistent

likely to influence future interaction style

PLAN COMMITMENT TEST (MANDATORY)

A statement qualifies as a plan only if at least ONE of the following is true:

Explicit commitment

"We decided to…"

"We're going to…"

"Let's do it"

"That works for me"

"I'll handle X"

Concrete specifics

time

date

location

assigned responsibility

Repeat intent

The same action is referenced more than once

❌ Do NOT extract a plan if it is:

speculative ("maybe", "sometime")

exploratory ("have you heard of…", "would you want to…")

emotionally driven without commitment

a single unconfirmed utterance

Soft Plan Downgrade Rule

If an action fails the Plan Commitment Test but signals:

recurring interest

plausible future topic

shared activity tendency

Then:

do not store it as a plan

reclassify as a preference or belief

EVENT CONSOLIDATION RULE (FINAL STABILIZER)

If multiple events in the same conversation:

share the same actor

concern the same topic or domain

do not contradict each other

Then:

merge them into a single broader event

prefer a canonical, reusable phrasing

discard redundant sub-events

This applies especially to:

belief

preference

OUTPUT FORMAT (STRICT)

Return only a JSON array.

No explanations

No markdown

No comments

If no events exist, return:

[] 

FINAL SELF-CHECK (REQUIRED)

Before returning, verify:

Each event improves future conversational continuity

No ephemeral intent is stored

Preferences and beliefs are favored when safe

Plans pass the commitment test

Beliefs are actor-attributed

Related events are consolidated

All evidence quotes are verbatim

Schema is followed exactly

FINAL INSTRUCTION

Extract durable and continuity-supporting state changes that make future conversations feel like a natural continuation — not a reset.

Return the events.`;
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
