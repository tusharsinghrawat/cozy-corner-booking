import { Award, Users, Calendar, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const stats = [
  { icon: Calendar, value: '25+', label: 'Years of Excellence' },
  { icon: Users, value: '50K+', label: 'Happy Guests' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
  { icon: Award, value: '15', label: 'Industry Awards' },
];

export default function About() {
  return (
    <Layout>
      {/* Header */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <p className="text-accent font-medium tracking-widest mb-2 uppercase">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">About GrandHotel</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            A legacy of luxury, comfort, and unparalleled hospitality since 1998.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-medium tracking-widest mb-2 uppercase">Our Heritage</p>
              <h2 className="text-4xl font-serif font-bold mb-6">A Tradition of Excellence</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Founded in 1998, GrandHotel has been the epitome of luxury hospitality for over
                two decades. What started as a vision to create an unparalleled guest experience
                has evolved into a beloved destination for travelers from around the world.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Our commitment to exceptional service, attention to detail, and creating memorable
                moments has remained unwavering throughout the years. Every aspect of GrandHotel
                is designed to exceed expectations and create lasting memories.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From our meticulously appointed rooms to our world-class dining experiences,
                every element reflects our dedication to providing the finest hospitality
                experience possible.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
                  alt="Hotel exterior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-accent text-accent-foreground p-6 rounded-lg shadow-xl">
                <p className="text-4xl font-serif font-bold">25+</p>
                <p className="font-medium">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <p className="text-4xl font-serif font-bold mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-widest mb-2 uppercase">What We Stand For</p>
            <h2 className="text-4xl font-serif font-bold">Our Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                <Star className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in every detail, from the moment you arrive
                until your departure.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Hospitality</h3>
              <p className="text-muted-foreground">
                Our guests are our family. We treat every visitor with warmth,
                respect, and genuine care.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously evolve to meet the changing needs of our guests
                while preserving our timeless elegance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
