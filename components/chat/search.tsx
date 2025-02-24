"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search as SearchIcon, User, MessageSquare, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  email: string;
  type: "user" | "conversation";
}

interface SearchProps {
  onSelectUser: (userId: string) => void;
  onSelectConversation: (conversationId: string) => void;
}

export function Search({ onSelectUser, onSelectConversation }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/chat/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error);
        }

        setResults(data.results);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "user") {
      onSelectUser(result.id);
    } else {
      onSelectConversation(result.id);
    }
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <SearchIcon className="h-4 w-4" />
          Search users and conversations...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !query ? (
              <CommandEmpty>Start typing to search...</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <>
                <CommandGroup heading="Users">
                  {results
                    .filter(result => result.type === "user")
                    .map(result => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-medium truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.email}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Conversations">
                  {results
                    .filter(result => result.type === "conversation")
                    .map(result => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span>{result.name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}