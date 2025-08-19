import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const POLLING_INTERVAL = 3000; // Poll every 3 seconds

// --- API Fetching Functions ---
const startAnalysis = async (research_question: string) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ research_question }),
  });
  if (!response.ok) throw new Error('Failed to start analysis');
  return response.json();
};

const fetchStatus = async (analysisId: string | null) => {
  if (!analysisId) return null;
  const response = await fetch(`/api/analyze/${analysisId}?status=true`);
  if (!response.ok) throw new Error('Failed to fetch status');
  return response.json();
};

const fetchResults = async (analysisId: string | null) => {
  if (!analysisId) return null;
  const response = await fetch(`/api/analyze/${analysisId}`);
  if (!response.ok) throw new Error('Failed to fetch results');
  return response.json();
};

// --- The Custom Hook ---
export const useAnalysis = () => {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query for status polling
  const { data: statusData } = useQuery({
    queryKey: ['analysisStatus', analysisId],
    queryFn: () => fetchStatus(analysisId),
    enabled: !!analysisId,
    refetchInterval: POLLING_INTERVAL,
    retry: false,
  });

  // Query for final results, enabled only when status is COMPLETE
  const { data: resultsData, isLoading: isResultsLoading, isSuccess: isResultsSuccess } = useQuery({
    queryKey: ['analysisResults', analysisId],
    queryFn: () => fetchResults(analysisId),
    enabled: !!analysisId && statusData?.status === 'COMPLETE',
  });

  // Mutation to start the analysis
  const mutation = useMutation({
    mutationFn: startAnalysis,
    onSuccess: (data) => {
      toast.info('Analysis job has started...');
      setAnalysisId(data.analysis_id);
    },
    onError: () => {
      toast.error('Failed to submit analysis. Please try again.');
    },
  });

  // Handle terminal states from polling
  if (statusData?.status === 'COMPLETE' && !isResultsSuccess && !isResultsLoading) {
    queryClient.invalidateQueries({ queryKey: ['analysisResults', analysisId] });
  }

  if (statusData?.status === 'ERROR') {
    toast.error('An error occurred during analysis:', { description: statusData.error_message });
    setAnalysisId(null); // Stop polling
  }

  return {
    submit: mutation.mutate,
    isLoading: mutation.isPending || (!!analysisId && statusData?.status !== 'COMPLETE' && statusData?.status !== 'ERROR'),
    status: statusData,
    results: resultsData,
  };
};
