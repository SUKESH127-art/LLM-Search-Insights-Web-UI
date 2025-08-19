"use client";

import { SearchInterface } from "@/components/SearchInterface";
import { AnalysisResults } from "@/components/AnalysisResults";
import { LoadingState } from "@/components/LoadingState";
import { useAnalysis } from "@/hooks/useAnalysis";

export default function HomePage() {
  const { submit, isLoading, status, results } = useAnalysis();

  const handleSearch = (query: string) => {
    submit(query);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-12 pt-12">
        <SearchInterface onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && <LoadingState progress={status?.progress || 0} currentStep={status?.current_step || 'Initializing...'} />}
        
        {results && (
          <AnalysisResults data={results} query={results.research_question} />
        )}
      </div>
    </main>
  );
}
