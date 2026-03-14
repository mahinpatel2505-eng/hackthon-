"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Package, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        setIsOpen(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.data || []);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search SKU or name..."
          className="pl-9 bg-slate-100/50 border-slate-200 focus:bg-white transition-all h-9 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Products found ({results.length})
              </div>
              <div className="max-h-64 overflow-y-auto">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      router.push(`/products/${product.id}`);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="flex-shrink-0 p-2 bg-emerald-50 text-emerald-600 rounded-md group-hover:bg-emerald-100 transition-colors">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {product.sku} • {product.category}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : !loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex p-3 bg-slate-50 rounded-full mb-3">
                <Search className="h-5 w-5 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">No products found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
