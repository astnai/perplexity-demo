"use client"

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdvancedSearchOptions from "./AdvancedSearchOptions";

export default function SearchAI() {
  const [query, setQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("normal");
  const resultRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    const storedFavorites = localStorage.getItem("searchFavorites");
    const storedApiKey = localStorage.getItem("openaiApiKey");

    if (storedHistory) setHistory(JSON.parse(storedHistory));
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    if (storedApiKey) setApiKey(storedApiKey);

    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setQuery(urlQuery);
      handleSubmit(new Event("submit") as any, urlQuery);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const searchQuery = overrideQuery || query;
    if (!searchQuery || !apiKey) return;

    setLoading(true);
    setResult("");
    localStorage.setItem("openaiApiKey", apiKey);
    router.push(`?q=${encodeURIComponent(searchQuery)}`);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, apiKey, mode, category }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        setResult((prev) => prev + text);
        if (resultRef.current) {
          resultRef.current.scrollTop = resultRef.current.scrollHeight;
        }
      }

      setHistory((prev) => {
        const newHistory = [searchQuery, ...prev].slice(0, 5);
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error("Error:", error);
      setResult("Error occurred while fetching the result.");
    }
    setLoading(false);
  };

  const toggleFavorite = (query: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(query)
        ? prev.filter((fav) => fav !== query)
        : [...prev, query];
      localStorage.setItem("searchFavorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  return (
    <div className="h-screen bg-white text-black flex flex-col p-8">
      <h1 className="text-5xl font-bold mb-8 text-center">AI Search</h1>
      <div className="flex-grow flex">
        <div className="w-2/3 pr-8 flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your search query"
                className="flex-grow p-4 bg-white text-black border-2 border-black rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            <AdvancedSearchOptions
              category={category}
              setCategory={setCategory}
              mode={mode}
              setMode={setMode}
            />
          </form>
          
          {result && (
            <div
              ref={resultRef}
              className="flex-grow p-6 bg-gray-100 text-black rounded-3xl overflow-auto scrollbar-thin shadow-md"
            >
              <h2 className="text-2xl font-semibold mb-4">Result:</h2>
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
        
        <div className="w-1/3 flex flex-col">
          {history.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Search History:</h3>
              <ul className="space-y-3">
                {history.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span
                      className="cursor-pointer hover:underline mr-2 text-gray-700"
                      onClick={() => handleSubmit(new Event("submit") as any, item)}
                    >
                      {item}
                    </span>
                    <button
                      onClick={() => toggleFavorite(item)}
                      className={`text-xl ${
                        favorites.includes(item) ? "text-yellow-500" : "text-gray-400"
                      } transition duration-300`}
                    >
                      {favorites.includes(item) ? "★" : "☆"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {favorites.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Favorite Searches:</h3>
              <ul className="space-y-3">
                {favorites.map((item, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:underline text-gray-700"
                    onClick={() => handleSubmit(new Event("submit") as any, item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API Key"
          className="w-full p-4 bg-white text-black border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
        />
      </div>
    </div>
  );
}