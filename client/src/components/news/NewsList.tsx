import React, { useState, useEffect } from 'react';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
  published_at: string;
  featured_image?: string;
  slug: string;
}

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

export const NewsList: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, []);

  const fetchCategories = async () => {
    try {
      // Simulerer API-kall med mock-data
      const mockCategories: NewsCategory[] = [
        { id: 1, name: 'Sikkerhet', slug: 'sikkerhet' },
        { id: 2, name: 'Oppdateringer', slug: 'oppdateringer' },
        { id: 3, name: 'Nyheter', slug: 'nyheter' },
        { id: 4, name: 'Tips og triks', slug: 'tips-og-triks' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Feil ved henting av kategorier:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      // Simulerer API-kall med mock-data
      const mockArticles: NewsArticle[] = [
        {
          id: 1,
          title: 'Nye sikkerhetsrutiner implementert',
          excerpt: 'Vi har nylig implementert nye sikkerhetsrutiner for å forbedre arbeidsmiljøet...',
          author: { name: 'Admin Bruker' },
          category: { name: 'Sikkerhet' },
          published_at: new Date().toISOString(),
          slug: 'nye-sikkerhetsrutiner'
        },
        {
          id: 2,
          title: 'Systemoppdatering - Ny funksjonalitet',
          excerpt: 'Den nye systemoppdateringen bringer forbedret brukeropplevelse og nye funksjoner...',
          author: { name: 'System Admin' },
          category: { name: 'Oppdateringer' },
          published_at: new Date(Date.now() - 86400000).toISOString(),
          slug: 'systemoppdatering-ny-funksjonalitet'
        },
        {
          id: 3,
          title: 'Tips for bedre sikkerhetskontroll',
          excerpt: 'Her er noen nyttige tips for å gjennomføre mer effektive sikkerhetskontroller...',
          author: { name: 'Sikkerhetsekspert' },
          category: { name: 'Tips og triks' },
          published_at: new Date(Date.now() - 172800000).toISOString(),
          slug: 'tips-bedre-sikkerhetskontroll'
        }
      ];
      
      let filteredArticles = mockArticles;
      
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          filteredArticles = mockArticles.filter(article => article.category.name === category.name);
        }
      }
      
      if (searchTerm) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setArticles(filteredArticles);
    } catch (error) {
      console.error('Feil ved henting av artikler:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster nyheter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nyheter</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Skriv ny artikkel
        </button>
      </div>

      <div className="flex space-x-4">
        <input
          type="text"
          placeholder="Søk i nyheter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-md"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        >
          <option value="all">Alle kategorier</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            {article.featured_image && (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>{article.category.name}</span>
                <span>{formatDate(article.published_at)}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Av {article.author.name}</span>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  Les mer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Ingen artikler funnet</p>
          <p className="text-gray-400 text-sm">Prøv å endre søkekriteriene</p>
        </div>
      )}
    </div>
  );
};