// src/lib/parser.ts

// --- SHARED ---
export interface ParsedItem {
  title: string;
  content: string[];
}

// --- WEB ANALYSIS ---
export type WebBlock =
  | { type: 'prose'; content: string }
  | { type: 'section_header'; text: string }
  | { type: 'list_item'; number: string; title: string; content: string };

export function parseWebAnalysis(text: string): WebBlock[] {
  const blocks: WebBlock[] = [];
  // Split by newline, but keep the line content.
  const lines = text.split('\n').filter(line => line.trim() !== '');

  let currentProse = '';

  for (const line of lines) {
    const isSectionHeader = line.startsWith('###');
    const numberedMatch = line.match(/^(\d+)\.\s\*\*(.*?):\*\*\s*(.*)/);

    // If we encounter a structural element, push any accumulated prose first.
    if (isSectionHeader || numberedMatch) {
      if (currentProse.trim()) {
        blocks.push({ type: 'prose', content: currentProse.trim() });
      }
      currentProse = '';
    }

    if (isSectionHeader) {
      blocks.push({ type: 'section_header', text: line.replace(/###\s*/, '') });
    } else if (numberedMatch) {
      const [, number, title, content] = numberedMatch;
      blocks.push({ type: 'list_item', number, title, content });
    } else {
      // It's a line of prose. Accumulate it.
      currentProse += line + '\n';
    }
  }

  // Push any remaining prose at the end of the document
  if (currentProse.trim()) {
    blocks.push({ type: 'prose', content: currentProse.trim() });
  }

  return blocks;
}

// --- SIMPLE LIST (for AI Response) ---
export interface SimpleListContent {
  introductoryProse: string[];
  items: ParsedItem[];
  concludingProse: string[];
}

export function parseSimpleList(text: string): SimpleListContent {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const result: SimpleListContent = { introductoryProse: [], items: [], concludingProse: [] };
    let state: 'intro' | 'list' | 'conclusion' = 'intro';
    for (const line of lines) {
        const isListItem = /^\d+\.\s/.test(line);
        if (isListItem && state === 'intro') { state = 'list'; }
        if (!isListItem && state === 'list') { state = 'conclusion'; }
        switch(state) {
            case 'intro': result.introductoryProse.push(line); break;
            case 'list':
                const [titlePart, ...contentParts] = line.replace(/^\d+\.\s/, '').split(':');
                result.items.push({
                    title: titlePart.replace(/\*\*/g, '').trim(),
                    content: contentParts.length > 0 ? [contentParts.join(':').trim()] : [],
                });
                break;
            case 'conclusion': result.concludingProse.push(line); break;
        }
    }
    return result;
}