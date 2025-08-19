import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  progress: number;
  currentStep: string;
}

export const LoadingState = ({ progress, currentStep }: LoadingStateProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 text-center animate-in fade-in-50 duration-500">
        <h3 className="text-lg font-semibold text-foreground">Analysis in Progress...</h3>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {currentStep}
        </p>
    </div>
  );
};
