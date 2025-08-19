import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Bot, BarChart3, TrendingUp, CheckCircle2 } from "lucide-react";
import { BrandChart } from "./BrandChart";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { parseWebAnalysis, parseSimpleList, ParsedItem } from "@/lib/parser";

// --- TypeScript Interfaces ---
interface BrandVisibilityScore { brand_name: string; visibility_score: number; rank: number; mentions: number; }
interface FullAnalysisResult { web_results: { content: string; confidence_score: number; }; chatgpt_simulation: { simulated_response: string; }; visualization: { title: string; brand_scores: BrandVisibilityScore[]; }; }
interface AnalysisResultsProps { data: FullAnalysisResult; query: string; }

// --- Reusable Low-Level Components ---
const FormattedText = ({ text, className = "text-muted-foreground" }: { text: string; className?: string }) => {
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  formatted = formatted.replace(/\b(\d{1,3}(,\d{3})*(\.\d+)?%?)\b/g, '<span class="font-bold text-primary">$1</span>');
  return <span className={className} dangerouslySetInnerHTML={{ __html: formatted }} />;
};

// NEW: Component for rendering a bullet point line
const BulletPointItem = ({ text }: { text: string }) => (
    <div className="flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-primary/70 mt-1 flex-shrink-0" />
        <FormattedText text={text} />
    </div>
);

// NEW: Intelligent renderer for a block of content
const ContentBlockRenderer = ({ content }: { content: string[] }) => (
    <div className="space-y-2">
        {content.map((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('-')) {
                return <BulletPointItem key={index} text={trimmedLine.substring(1).trim()} />;
            }
            return <FormattedText key={index} text={trimmedLine} />;
        })}
    </div>
);

const InsightCard = ({ item, index }: { item: ParsedItem; index: number }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm mt-1">{index + 1}</div>
    <div className="flex-1 space-y-1">
      <h4 className="font-semibold text-foreground">{item.title}</h4>
      {item.content.length > 0 && <ContentBlockRenderer content={item.content} />}
    </div>
  </div>
);

// --- Specialized High-Level Renderers ---
const WebAnalysisRenderer = ({ content }: { content: string }) => {
  const { introductoryProse, sections } = parseWebAnalysis(content);
  return (
    <div className="space-y-4">
      {introductoryProse && <FormattedText text={introductoryProse} className="text-foreground" />}
      <Accordion type="multiple" defaultValue={sections.map(s => s.title)} className="w-full">
        {sections.map((section, index) => (
          <AccordionItem value={section.title} key={index}>
            <AccordionTrigger className="text-lg font-semibold text-left">{section.title}</AccordionTrigger>
            <AccordionContent className="pt-4 space-y-6">
              {section.items.map((item, itemIndex) => <InsightCard key={itemIndex} item={item} index={itemIndex} />)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const SimpleListRenderer = ({ content }: { content: string }) => {
  const { introductoryProse, items, concludingProse } = parseSimpleList(content);
  return (
    <div className="space-y-6">
      {introductoryProse.map((p, i) => <FormattedText key={`intro-${i}`} text={p} className="text-foreground" />)}
      <div className="space-y-6">
        {items.map((item, itemIndex) => <InsightCard key={itemIndex} item={item} index={itemIndex} />)}
      </div>
      {concludingProse.map((p, i) => <FormattedText key={`concl-${i}`} text={p} className="text-foreground mt-4" />)}
    </div>
  );
};

// --- Top-Level Component ---
export const AnalysisResults = ({ data, query }: AnalysisResultsProps) => {
  const chartData = data.visualization.brand_scores.map(brand => ({ name: brand.brand_name, score: brand.visibility_score, metrics: { webMentions: brand.mentions, sentiment: 0, marketShare: 0 } }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in-50 duration-700">
      <div className="text-center"><h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Analysis Results</h2><Badge variant="secondary" className="text-base px-4 py-1 font-normal">Query: &quot;{query}&quot;</Badge></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center space-x-3"><Globe className="h-6 w-6 text-primary" /><span className="text-xl">Web Search Analysis</span><Badge variant="outline" className="ml-auto"><TrendingUp className="h-4 w-4 mr-1" />Confidence: {(data.web_results.confidence_score * 100).toFixed(0)}%</Badge></CardTitle></CardHeader><CardContent><WebAnalysisRenderer content={data.web_results.content} /></CardContent></Card>
        <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center space-x-3"><Bot className="h-6 w-6 text-accent" /><span className="text-xl">AI Response Simulation</span></CardTitle></CardHeader><CardContent><SimpleListRenderer content={data.chatgpt_simulation.simulated_response} /></CardContent></Card>
      </div>
      <Card className="shadow-md"><CardHeader><CardTitle className="flex items-center space-x-3"><BarChart3 className="h-6 w-6 text-primary" /><span className="text-xl">{data.visualization.title}</span></CardTitle></CardHeader><CardContent className="pt-6"><BrandChart data={chartData} /></CardContent></Card>
    </div>
  );
};