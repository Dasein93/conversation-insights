-- Add name and conversation_date columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN name TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN conversation_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Create index for efficient filtering by name
CREATE INDEX idx_conversations_name ON public.conversations(name);

-- Create index for ordering by date
CREATE INDEX idx_conversations_date ON public.conversations(conversation_date DESC);