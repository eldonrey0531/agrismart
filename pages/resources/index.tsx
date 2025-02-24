import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  FileText, 
  PlayCircle, 
  Newspaper,
  Download,
  ExternalLink,
  ChevronRight
} from "lucide-react";

const resources = [
  {
    category: "Guides",
    icon: BookOpen,
    items: [
      {
        title: "Getting Started Guide",
        description: "Learn the basics of using AgriSmart platform",
        link: "/guides/getting-started",
      },
      {
        title: "Best Farming Practices",
        description: "Comprehensive guide to modern farming techniques",
        link: "/guides/farming-practices",
      },
    ],
  },
  {
    category: "Documentation",
    icon: FileText,
    items: [
      {
        title: "API Documentation",
        description: "Technical documentation for developers",
        link: "/docs/api",
      },
      {
        title: "Platform Features",
        description: "Detailed overview of all platform features",
        link: "/docs/features",
      },
    ],
  },
  {
    category: "Video Tutorials",
    icon: PlayCircle,
    items: [
      {
        title: "Platform Walkthrough",
        description: "Visual guide to using AgriSmart",
        link: "/tutorials/walkthrough",
      },
      {
        title: "Advanced Features",
        description: "In-depth tutorials for power users",
        link: "/tutorials/advanced",
      },
    ],
  },
];

const articles = [
  {
    title: "Sustainable Farming Techniques",
    category: "Education",
    date: "Feb 15, 2025",
    readTime: "5 min read",
    link: "/articles/sustainable-farming",
  },
  {
    title: "Digital Tools in Agriculture",
    category: "Technology",
    date: "Feb 14, 2025",
    readTime: "8 min read",
    link: "/articles/digital-tools",
  },
  {
    title: "Market Analysis 2025",
    category: "Market Insights",
    date: "Feb 13, 2025",
    readTime: "10 min read",
    link: "/articles/market-analysis",
  },
];

export const metadata = {
  title: "Resources",
  description: "Educational resources and documentation for AgriSmart users.",
};

export default function ResourcesPage() {
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mx-auto max-w-[58rem] text-center mb-12">
        <h1 className="font-bold text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
          Resources & Documentation
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Everything you need to succeed with AgriSmart
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        {resources.map(({ category, icon: Icon, items }) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <Link
                  key={item.title}
                  href={item.link}
                  className="block p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="font-medium">{item.title}</div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Latest Articles */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
          <Button variant="ghost" className="gap-2">
            View All <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.title}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{article.category}</span>
                  <span>•</span>
                  <span>{article.date}</span>
                </div>
                <h3 className="font-semibold mb-2">{article.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {article.readTime}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={article.link}>
                      Read More <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Downloads Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Download Resources
              </h3>
              <p className="text-muted-foreground">
                Access our comprehensive resource pack including templates,
                guides, and tools.
              </p>
            </div>
            <Button className="whitespace-nowrap">
              <Download className="w-4 h-4 mr-2" />
              Download Pack
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}