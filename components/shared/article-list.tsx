import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronRight } from "lucide-react";

interface Article {
  title: string;
  category: string;
  date: string;
  readTime: string;
  link: string;
  description?: string;
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
}

interface ArticleListProps {
  articles: Article[];
  showHeader?: boolean;
  headerTitle?: string;
  viewAllLink?: string;
  layout?: "grid" | "list";
}

export function ArticleList({
  articles,
  showHeader = true,
  headerTitle = "Latest Articles",
  viewAllLink,
  layout = "grid",
}: ArticleListProps) {
  return (
    <div>
      {showHeader && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{headerTitle}</h2>
          {viewAllLink && (
            <Button variant="ghost" className="gap-2" asChild>
              <Link href={viewAllLink}>
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      )}
      <div className={
        layout === "grid" 
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
      }>
        {articles.map((article) => (
          <Card key={article.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{article.category}</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <h3 className="font-semibold mb-2">{article.title}</h3>
              {article.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {article.description}
                </p>
              )}
              {article.author && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {article.author.avatar ? (
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {article.author.name[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {article.author.name}
                    </div>
                    {article.author.role && (
                      <div className="text-xs text-muted-foreground">
                        {article.author.role}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
  );
}