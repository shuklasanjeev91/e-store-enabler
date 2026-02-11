import { motion } from "framer-motion";
import { Store, Zap, Shield, BarChart3, Palette, Globe, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Store,
    title: "No-Code Store Builder",
    description: "Drag-and-drop your way to a beautiful store. Choose from 100+ professionally designed templates.",
  },
  {
    icon: Zap,
    title: "AI-Powered Automation",
    description: "Let AI handle product descriptions, pricing suggestions, and inventory management.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, PCI compliance, and fraud protection built into every store.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time insights into sales, customer behavior, and growth opportunities.",
  },
  {
    icon: Palette,
    title: "Full Customization",
    description: "Every pixel is customizable. Match your brand perfectly with advanced design controls.",
  },
  {
    icon: Globe,
    title: "Global Selling",
    description: "Multi-currency, multi-language support. Sell anywhere in the world.",
  },
  {
    icon: CreditCard,
    title: "Seamless Payments",
    description: "Accept 100+ payment methods including credit cards, wallets, and buy-now-pay-later.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert help whenever you need it. Live chat, phone, and email support included.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const Features = () => {
  return (
    <section id="features" className="relative bg-background py-24 md:py-32">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Features
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Everything you need to{" "}
            <span className="gradient-text">succeed online</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From store setup to global scaling, ShopDu provides all the tools you need 
            to build a thriving e-commerce business.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
