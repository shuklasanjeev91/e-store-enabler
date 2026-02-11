import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    content: "ShopDu transformed my small craft business into a thriving online store. I went from zero to $50k in sales in just 6 months. The AI tools are game-changing!",
    author: "Sarah Chen",
    role: "Founder, Artisan Crafts Co.",
    rating: 5,
  },
  {
    content: "As someone with zero technical skills, I was amazed how quickly I could set up a professional-looking store. The templates are beautiful and easy to customize.",
    author: "Marcus Johnson",
    role: "Owner, Urban Sneakers",
    rating: 5,
  },
  {
    content: "The analytics and insights have helped me understand my customers better than ever. My conversion rate doubled within the first month of switching to ShopDu.",
    author: "Emily Rodriguez",
    role: "CEO, Natural Beauty Lab",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="section-dark relative py-24 md:py-32">
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
            Testimonials
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight text-text-on-dark sm:text-4xl md:text-5xl">
            Loved by{" "}
            <span className="gradient-text">50,000+ sellers</span>
          </h2>
          <p className="text-lg text-text-muted-on-dark">
            Join thousands of entrepreneurs who've built successful businesses with ShopDu.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-8"
            >
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="mb-6 text-text-on-dark leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 font-display font-bold text-primary">
                  {testimonial.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-text-on-dark">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-text-muted-on-dark">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
