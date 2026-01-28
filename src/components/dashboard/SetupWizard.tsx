import { Check, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  link?: {
    label: string;
    href: string;
  };
}

interface SetupWizardProps {
  steps: SetupStep[];
  storeName: string;
}

export default function SetupWizard({ steps, storeName }: SetupWizardProps) {
  return (
    <div className="rounded-xl border bg-background p-8">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Complete your store setup...
      </h1>
      <p className="mt-2 text-muted-foreground">
        Use high quality images and product descriptions to have a great looking product page.
        Let's get started.
      </p>

      <div className="mt-8 space-y-0">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex gap-4">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-5 top-10 h-[calc(100%-16px)] w-0.5",
                  step.completed ? "bg-primary" : "bg-muted"
                )}
              />
            )}

            {/* Step indicator */}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                step.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted bg-background text-muted-foreground"
              )}
            >
              {step.completed ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-8">
              <h3
                className={cn(
                  "font-semibold",
                  step.completed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>

              {step.link && step.completed && (
                <a
                  href={step.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {step.link.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {step.action && !step.completed && (
                <Button
                  className="mt-3 gap-2"
                  size="sm"
                  onClick={step.action.onClick}
                >
                  <Plus className="h-4 w-4" />
                  {step.action.label}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
