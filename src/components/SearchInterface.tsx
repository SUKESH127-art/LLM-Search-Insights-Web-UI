"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchInterface = ({ onSearch, isLoading }: SearchInterfaceProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full mx-auto text-center">
      <div className="flex items-center justify-center mb-4">
        <Sparkles className="h-10 w-10 text-primary mr-3" />
        <h1 className="text-4xl font-bold text-foreground">
          Brand Intelligence Hub
        </h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Analyze how your brand performs across web search results and AI-powered conversations. 
        Get actionable insights to optimize your digital presence.
      </p>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center p-2 border rounded-full shadow-soft bg-card">
          <Search className="h-5 w-5 text-muted-foreground ml-4" />
          <Input
            type="text"
            placeholder="What are the best frontend frameworks for 2024?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-12 px-4"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="rounded-full h-12 px-8 font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              "Analyze"
            )}
          </Button>
        </div>
      </form>
      <p className="text-sm text-muted-foreground mt-6">
        Example queries: &quot;best CRM software 2024&quot;, &quot;top e-commerce platforms&quot;, &quot;AI tools for marketing&quot;
      </p>
    </div>
  );
};
