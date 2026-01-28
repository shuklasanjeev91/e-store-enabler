import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-12 text-center md:p-20"
        >
          {/* Background decorations */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Ready to start selling?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
              Join 50,000+ entrepreneurs who've launched successful stores with Shopdu. 
              Start your free trial today — no credit card required.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="accent" size="xl" className="group">
                Start your free trial
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
              >
                Talk to sales
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
