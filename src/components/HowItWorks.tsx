import { motion } from "framer-motion";
import { UserPlus, Palette, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up in Seconds",
    description: "Create your free account with just your email. No credit card required to start.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Design Your Store",
    description: "Pick a template, customize your brand, and add your products with our drag-and-drop builder.",
  },
  {
    icon: Rocket,
    step: "03",
    title: "Launch & Grow",
    description: "Go live instantly. Start selling and use our marketing tools to grow your business.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="section-dark relative py-24 md:py-32">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            How It Works
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text-on-dark sm:text-4xl md:text-5xl">
            From idea to income in{" "}
            <span className="gradient-text">3 simple steps</span>
          </h2>
          <p className="text-lg text-text-muted-on-dark">
            We've stripped away the complexity. Building your online store 
            has never been easier.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mx-auto max-w-5xl">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary to-primary/50 md:block" />

          <div className="grid gap-12 md:gap-0">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative flex flex-col items-center gap-6 md:flex-row ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={`flex-1 text-center ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <div className="glass-card inline-block rounded-2xl p-8">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-bold text-text-on-dark">
                      {step.title}
                    </h3>
                    <p className="max-w-sm text-text-muted-on-dark">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step number */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-surface-dark bg-primary font-display text-xl font-bold text-primary-foreground shadow-glow">
                  {step.step}
                </div>

                {/* Spacer */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
