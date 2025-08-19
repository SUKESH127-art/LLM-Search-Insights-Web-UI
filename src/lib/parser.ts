// src/lib/parser.ts

// --- SHARED ---
export interface ParsedItem {
  title: string;
  content: string[];
}

// --- WEB ANALYSIS ---
export interface ParsedSection {
  title: string;
  items: ParsedItem[];
}
export interface WebAnalysisContent {
  introductoryProse: string;
  sections: ParsedSection[];
}

export function parseWebAnalysis(text: string): WebAnalysisContent {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const result: WebAnalysisContent = { introductoryProse: '', sections: [] };
  let currentSection: ParsedSection | null = null;
  let currentItem: ParsedItem | null = null;
  let isIntroProse = true;

  for (const line of lines) {
    // A section title is bolded and ends with a colon
    const isSectionTitle = /^\*\*(.*?):\*\*/.test(line) || line.startsWith('**Conclusion**');

    if (isSectionTitle) {
      isIntroProse = false; // Once we see the first section, we're no longer in the intro
      const title = line.replace(/\*\*/g, '').replace(':', '').trim();
      currentSection = { title, items: [] };
      result.sections.push(currentSection);
      currentItem = null; // A new section resets the current item
      continue;
    }
    
    // An item is a numbered list
    const isSubItem = /^\d+\.\s/.test(line);
    if (isSubItem) {
      isIntroProse = false;
      // Failsafe: if an item appears before a section, create a default "Key Findings" section
      if (!currentSection) {
        currentSection = { title: 'Key Findings', items: [] };
        result.sections.push(currentSection);
      }
      
      const [titlePart, ...contentParts] = line.replace(/^\d+\.\s/, '').split(':');
      currentItem = {
        title: titlePart.replace(/\*\*/g, '').trim(),
        content: contentParts.length > 0 ? [contentParts.join(':').trim()] : [],
      };
      currentSection.items.push(currentItem);
      continue;
    }
    
    if (isIntroProse) {
      result.introductoryProse += (result.introductoryProse ? '\n' : '') + line;
    } else if (currentItem) {
      // If we are in an item, this line is its content.
      currentItem.content.push(line);
    }
  }
  return result;
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