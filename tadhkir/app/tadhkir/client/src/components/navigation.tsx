import { Heart, Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import SetupRemindersModal from "./setup-reminders-modal";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  profileImageUrl?: string;
  status: string;
  dateOfDeath?: string;
  birthday?: string;
}

export default function Navigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [reminderSubjectName, setReminderSubjectName] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [] } = useQuery({
    queryKey: [`/api/search/people?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length >= 2,
    staleTime: 5000,
  });

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setIsSearchOpen(value.length >= 2);
  };

  const handleResultClick = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSearchQuery("");
    setIsSearchOpen(false);
    window.location.href = `/person/${slug}`;
  };

  const handleCreateNew = () => {
    setReminderSubjectName(searchQuery);
    setIsSearchOpen(false);
    setSearchQuery("");
    setShowRemindersModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If there are exact matches, go to the first one, otherwise create new
      if (searchResults.length > 0) {
        const exactMatch = searchResults.find((result: SearchResult) => 
          result.name.toLowerCase() === searchQuery.toLowerCase()
        );
        if (exactMatch) {
          handleResultClick(exactMatch.name);
          return;
        }
      }
      handleCreateNew();
    }
  };

  return (
    <>
      <header className="border-b border-border bg-white/80 dark:bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="text-white text-sm" />
            </div>
            <a 
              href="/" 
              className="text-xl font-semibold hover:text-primary transition-colors"
            >
              Tadhkir
            </a>
          </div>
          
          {/* Search Bar - Always Visible */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search memorial pages..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                    className="pl-10 w-full"
                  />
                </div>
              </form>

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <>
                      {(searchResults as SearchResult[]).map((result: SearchResult) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result.name)}
                          className="w-full px-4 py-3 text-left hover:bg-muted border-b border-border last:border-b-0 flex items-center space-x-3"
                        >
                          {result.profileImageUrl ? (
                            <img 
                              src={result.profileImageUrl} 
                              alt={result.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-medium text-muted-foreground">
                                {result.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{result.name}</p>
                            {result.dateOfDeath && (
                              <p className="text-sm text-muted-foreground">
                                {new Date(result.dateOfDeath).getFullYear()}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  ) : searchQuery.length >= 2 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-muted-foreground mb-3">No memorial pages found for "{searchQuery}"</p>
                      <button
                        onClick={handleCreateNew}
                        className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                      >
                        <Bell className="h-4 w-4" />
                        <span>Set up reminders for "{searchQuery}"</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
          </div>
          
          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            <a 
              href="/about" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </header>
    
    <SetupRemindersModal
      isOpen={showRemindersModal}
      onClose={() => {
        setShowRemindersModal(false);
        setReminderSubjectName("");
      }}
      initialSubjectName={reminderSubjectName}
    />
    </>
  );
}