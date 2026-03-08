import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hand, Camera, ChevronRight, CheckCircle2 } from 'lucide-react';

interface PalmScanTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    title: 'Open Your Palm',
    description: 'Spread your fingers naturally and keep your palm relaxed and open.',
    icon: Hand,
  },
  {
    title: 'Good Lighting',
    description: 'Ensure bright, even lighting. Avoid harsh shadows across your palm.',
    icon: Camera,
  },
  {
    title: 'Capture Clearly',
    description: 'Hold your camera steady about 15-20cm above your palm for the sharpest lines.',
    icon: CheckCircle2,
  },
];

const PalmScanTutorial = ({ onComplete, onSkip }: PalmScanTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <Card className="border-2 border-primary/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg text-primary">
          📸 Palm Scanning Tips
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <StepIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip
          </Button>
          <Button size="sm" onClick={handleNext} className="gap-1">
            {currentStep < STEPS.length - 1 ? (
              <>Next <ChevronRight className="h-3 w-3" /></>
            ) : (
              'Got it!'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PalmScanTutorial;
