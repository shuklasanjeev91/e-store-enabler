import { motion } from "framer-motion";

const logos = [
  "TechCrunch",
  "Forbes",
  "Wired",
  "Fast Company",
  "Inc.",
  "The Verge",
];

export const TrustedBy = () => {
  return (
    <section className="border-b border-border bg-background py-16">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="mb-8 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Featured in
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {logos.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="font-display text-xl font-bold text-muted-foreground/50 transition-colors hover:text-muted-foreground md:text-2xl"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
