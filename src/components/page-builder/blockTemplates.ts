import { type PageBlock, createBlock } from "./types";

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name key
  blocks: () => PageBlock[];
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id: "about-us",
    name: "About Us",
    description: "Company story with image and team columns",
    icon: "users",
    blocks: () => {
      const hero = createBlock("text");
      (hero as any).content = "<h1>About Us</h1><p>We're passionate about delivering the best experience to our customers.</p>";
      (hero as any).alignment = "center";
      (hero as any).fontSize = "xl";

      const spacer1 = createBlock("spacer");

      const img = createBlock("image");
      (img as any).src = "";
      (img as any).alt = "Our story";
      (img as any).width = "large";

      const spacer2 = createBlock("spacer");
      (spacer2 as any).height = "sm";

      const story = createBlock("text");
      (story as any).content = "<h2>Our Story</h2><p>Founded with a simple mission — to create products that make a difference. Our journey began with a small idea and has grown into something we're truly proud of.</p>";
      (story as any).alignment = "left";

      const spacer3 = createBlock("spacer");

      const team = createBlock("columns");
      (team as any).columns = 3;
      (team as any).items = [
        { heading: "Our Mission", content: "To deliver quality products that exceed expectations.", imageUrl: "" },
        { heading: "Our Vision", content: "Building a community of happy customers worldwide.", imageUrl: "" },
        { heading: "Our Values", content: "Integrity, innovation, and customer-first thinking.", imageUrl: "" },
      ];

      return [hero, spacer1, img, spacer2, story, spacer3, team];
    },
  },
  {
    id: "contact",
    name: "Contact",
    description: "Contact info with map placeholder and CTA",
    icon: "mail",
    blocks: () => {
      const heading = createBlock("text");
      (heading as any).content = "<h1>Get In Touch</h1><p>We'd love to hear from you. Reach out anytime.</p>";
      (heading as any).alignment = "center";
      (heading as any).fontSize = "xl";

      const spacer1 = createBlock("spacer");

      const info = createBlock("columns");
      (info as any).columns = 3;
      (info as any).items = [
        { heading: "📧 Email", content: "hello@yourstore.com", imageUrl: "" },
        { heading: "📞 Phone", content: "+1 (555) 123-4567", imageUrl: "" },
        { heading: "📍 Address", content: "123 Main Street, City, Country", imageUrl: "" },
      ];

      const spacer2 = createBlock("spacer");

      const cta = createBlock("button");
      (cta as any).text = "Send us a message";
      (cta as any).url = "mailto:hello@yourstore.com";
      (cta as any).variant = "primary";
      (cta as any).size = "lg";

      return [heading, spacer1, info, spacer2, cta];
    },
  },
  {
    id: "faq",
    name: "FAQ",
    description: "Frequently asked questions page",
    icon: "help-circle",
    blocks: () => {
      const heading = createBlock("text");
      (heading as any).content = "<h1>Frequently Asked Questions</h1><p>Find answers to common questions below.</p>";
      (heading as any).alignment = "center";
      (heading as any).fontSize = "xl";

      const spacer = createBlock("spacer");

      const faq = createBlock("accordion");
      (faq as any).items = [
        { question: "How do I place an order?", answer: "Browse our products, add items to your cart, and proceed to checkout. It's that simple!" },
        { question: "What payment methods do you accept?", answer: "We accept all major credit cards, debit cards, and UPI payments." },
        { question: "How long does shipping take?", answer: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 day delivery." },
        { question: "What is your return policy?", answer: "We offer a 30-day return policy. Items must be unused and in original packaging." },
        { question: "How can I contact support?", answer: "Reach us via email at support@yourstore.com or call +1 (555) 123-4567." },
      ];

      return [heading, spacer, faq];
    },
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "Hero, features, products, and CTA",
    icon: "layout",
    blocks: () => {
      const hero = createBlock("text");
      (hero as any).content = "<h1>Welcome to Our Store</h1><p>Discover amazing products curated just for you.</p>";
      (hero as any).alignment = "center";
      (hero as any).fontSize = "2xl";
      (hero as any).fontWeight = "bold";
      hero.styling = { backgroundColor: "#f8f9fa", padding: "xl" };

      const spacer1 = createBlock("spacer");

      const features = createBlock("columns");
      (features as any).columns = 3;
      (features as any).items = [
        { heading: "🚀 Fast Shipping", content: "Free delivery on orders above ₹499." },
        { heading: "🔒 Secure Payments", content: "Your data is always safe with us." },
        { heading: "💬 24/7 Support", content: "We're here whenever you need help." },
      ];

      const spacer2 = createBlock("spacer");

      const products = createBlock("product_grid");
      (products as any).columns = 3;
      (products as any).limit = 6;

      const spacer3 = createBlock("spacer");

      const cta = createBlock("button");
      (cta as any).text = "Shop All Products";
      (cta as any).url = "/products";
      (cta as any).size = "lg";

      return [hero, spacer1, features, spacer2, products, spacer3, cta];
    },
  },
];
