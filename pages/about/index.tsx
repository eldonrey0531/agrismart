import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TreePine, Heart, Users2, Leaf, Sprout, Globe } from "lucide-react";

const features = [
  {
    title: "Sustainable Agriculture",
    description:
      "Promoting eco-friendly farming practices and sustainable agricultural methods.",
    icon: Leaf,
  },
  {
    title: "Community Support",
    description:
      "Building a supportive network of farmers, experts, and agricultural enthusiasts.",
    icon: Users2,
  },
  {
    title: "Knowledge Sharing",
    description:
      "Facilitating the exchange of farming knowledge and best practices.",
    icon: Sprout,
  },
  {
    title: "Global Impact",
    description:
      "Making a positive impact on global food security and agricultural sustainability.",
    icon: Globe,
  },
];

export const metadata = {
  title: "About",
  description: "Learn about our mission to transform agriculture through technology and community.",
};

export default function AboutPage() {
  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <TreePine className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Our Mission
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          AgriSmart is dedicated to transforming agriculture through technology and
          community. We&apos;re building a platform where farmers can connect, learn,
          and grow together.
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid gap-6 sm:grid-cols-2">
        {features.map(({ title, description, icon: Icon }) => (
          <Card key={title}>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Values Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center">
          Our Values
        </h2>
        <div className="flex justify-center">
          <div className="flex items-center gap-4 p-6 rounded-lg bg-muted">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Community First</h3>
              <p className="text-sm text-muted-foreground">
                We believe in the power of community to drive positive change in
                agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold">Ready to Join Our Community?</h2>
        <p className="text-muted-foreground">
          Connect with farmers and agricultural experts today.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}