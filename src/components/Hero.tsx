import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export const Hero = () => {
  return (
    <section className="section-dark relative min-h-screen overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Now with AI-powered store builder
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 max-w-4xl font-display text-4xl font-bold tracking-tight text-text-on-dark sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Launch your online store{" "}
          <span className="gradient-text">in minutes</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 max-w-2xl text-lg text-text-muted-on-dark md:text-xl"
        >
          Shopdu makes it ridiculously easy for anyone to build, manage, and scale 
          their e-commerce business. No coding required. Start selling today.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16 flex flex-col gap-4 sm:flex-row"
        >
          <Button variant="hero" size="xl" className="group">
            Start free trial
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="hero-outline" size="xl" className="group">
            <Play className="h-5 w-5" />
            Watch demo
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {[
            { value: "50K+", label: "Active Stores" },
            { value: "$2B+", label: "Sales Processed" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9", label: "User Rating" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-display text-3xl font-bold text-text-on-dark md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-text-muted-on-dark">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
