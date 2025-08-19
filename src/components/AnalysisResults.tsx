import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Bot, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";
import { BrandChart } from "./BrandChart";

// --- TypeScript Interfaces ---
interface BrandVisibilityScore { brand_name: string; visibility_score: number; rank: number; mentions: number; }
interface FullAnalysisResult { web_results: { content: string; confidence_score: number; }; chatgpt_simulation: { simulated_response: string; }; visualization: { title: string; brand_scores: BrandVisibilityScore[]; }; }
interface AnalysisResultsProps { data: FullAnalysisResult; query: string; }

// --- Reusable Low-Level Component ---
const FormattedText = ({ text, className = "text-muted-foreground", as: Component = "p" }: { text: string; className?: string; as?: React.ElementType }) => {
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  formatted = formatted.replace(/\b(\d{1,3}(,\d{3})*(\.\d+)?%?)\b/g, '<span class="font-bold text-primary">$1</span>');
  return <Component className={className} dangerouslySetInnerHTML={{ __html: formatted }} />;
};

// --- Specialized Renderers ---

// THE DEFINITIVE WEB ANALYSIS RENDERER
const WebAnalysisRenderer = ({ content }: { content: string }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        // Rule 1: Section Headers (e.g., ### Key Findings or **Conclusion**)
        if (line.startsWith('###')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-foreground pt-6 border-b pb-2 mb-4">
              {line.replace(/###\s*/, '')}
            </h3>
          );
        }

        // Rule 2: Numbered List Items
        const numberedMatch = line.match(/^(\d+)\.\s(.*)/);
        if (numberedMatch) {
            const [, number, text] = numberedMatch;
            return (
                <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm mt-1">{number}</div>
                    <FormattedText text={text} className="flex-1" />
                </div>
            );
        }
        
        // Rule 3: Bullet Points
        const dashIndex = line.indexOf('-');
        if (dashIndex !== -1 && line.slice(dashIndex, dashIndex + 1) === '-') {
            return (
                <div key={index} className="flex items-start gap-3 pl-5">
                    <CheckCircle2 className="h-4 w-4 text-primary/80 mt-1 flex-shrink-0" />
                    <FormattedText text={line.substring(dashIndex + 1).trim()} className="flex-1" />
                </div>
            );
        }

        // Default: Render as a standard paragraph
        return <FormattedText key={index} text={line} />;
      })}
    </div>
  );
};

// The Simple Renderer for the AI Response
const SimpleListRenderer = ({ content }: { content: string }) => {
  const parts = content.split(/\n(?=\d+\.\s)/);
  const intro = parts.shift() || '';
  const concludingIndex = parts.findIndex(p => !/^\d+\.\s/.test(p));
  const items = concludingIndex === -1 ? parts : parts.slice(0, concludingIndex);
  const conclusion = concludingIndex === -1 ? [] : parts.slice(concludingIndex);

  const InsightCard = ({ text, index }: { text: string; index: number }) => {
      const [titlePart, ...contentParts] = text.replace(/^\d+\.\s/, '').split(':');
      return (
          <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm mt-1">{index + 1}</div>
              <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-foreground">{titlePart.replace(/\*\*/g, '')}</h4>
                  <FormattedText text={contentParts.join(':')} />
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6">
      <FormattedText text={intro} className="text-foreground" />
      <div className="space-y-6">
        {items.map((item, itemIndex) => <InsightCard key={itemIndex} text={item} index={itemIndex} />)}
      </div>
      <FormattedText text={conclusion.join('\n')} className="text-foreground mt-4" />
    </div>
  );
};

// --- Top-Level Component ---
export const AnalysisResults = ({ data, query }: { data: FullAnalysisResult; query: string }) => {
  const chartData = data.visualization.brand_scores.map(brand => ({ name: brand.brand_name, score: brand.visibility_score, metrics: { webMentions: brand.mentions, sentiment: 0, marketShare: 0 } }));
  return (
    <div className="w-full mx-auto space-y-8 animate-in fade-in-50 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center space-x-3"><Globe className="h-6 w-6 text-primary" /><span className="text-xl">Google Top Result Analysis</span><Badge variant="outline" className="ml-auto"><TrendingUp className="h-4 w-4 mr-1" />Confidence: {(data.web_results.confidence_score * 100).toFixed(0)}%</Badge></CardTitle></CardHeader><CardContent><WebAnalysisRenderer content={data.web_results.content} /></CardContent></Card>
        <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center space-x-3"><Bot className="h-6 w-6 text-accent" /><span className="text-xl">ChatGPT response</span></CardTitle></CardHeader><CardContent><SimpleListRenderer content={data.chatgpt_simulation.simulated_response} /></CardContent></Card>
      </div>
      <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center space-x-3"><BarChart3 className="h-6 w-6 text-primary" /><span className="text-xl">{data.visualization.title}</span></CardTitle></CardHeader><CardContent className="pt-6"><BrandChart data={chartData} /></CardContent></Card>
    </div>
  );
};