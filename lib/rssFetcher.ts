import axios from 'axios';
import Parser from 'rss-parser';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceIcon: string;
  pubDate: string;
  isoDate: string;
  snippet?: string;
  category?: string;
}

export interface RSSFeed {
  source: string;
  sourceIcon: string;
  items: NewsItem[];
  lastFetched: string;
  error?: string;
}

const RSS_FEEDS = [
  { url: 'https://www.ratopati.com/rss', source: 'Ratopati', icon: '📰' },
  { url: 'https://setopati.com/rss', source: 'Setopati', icon: '📺' },
  { url: 'https://onlinekhabar.com/feed', source: 'OnlineKhabar', icon: '🌐' },
  { url: 'https://ekantipur.com/rss', source: 'Kantipur', icon: '📰' },
  { url: 'https://annapurnapost.com/rss', source: 'AnnapurnaPost', icon: '🏔️' },
  { url: 'https://nepalpress.com/rss', source: 'NepalPress', icon: '🗞️' },
];

const ELECTION_KEYWORDS = [
  'निर्वाचन',
  'मतगणना',
  'election',
  'vote',
  'voting',
  'candidate',
  'उम्मेदवार',
  'परिणाम',
  'result',
  'constituency',
  'निर्वाचन आयोग',
  ' parliament',
  'प्रतिनिधि सभा',
  'प्रदेश सभा',
];

const parser = new Parser({
  customFields: {
    item      ['media:: [
content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
  timeout: 10000,
});

function generateMockNews(): NewsItem[] {
  const headlines = [
    'मतगणना जारी : काठमाडौंमा कांग्रेस अगाडि',
    'प्रदेश १ मा माओवादीको अग्रता',
    'ललितपुर-३ मा एमाले उम्मेदवारको अचानक अगाडि',
    'विरगञ्जमा राष्ट्रिय स्वतन्त्र पार्टीको चर्को प्रचार',
    'निर्वाचन आयोगले भन्यो - मतगणना सुरक्षित छ',
    'चितवनमा कांग्रेस र माओवादीको नजिकको प्रतिस्पर्धा',
    'पोखरामा एमाले अगाडि, मतगणना जारी',
    'सुदूरपश्चिममा माओवादीको सुरुआती अगाडि',
    'मधेश प्रदेशमा जनता समाजवादी पार्टीको अगाडि',
    'गण्डकी प्रदेशमा निर्वाचनको तयारी पूरा',
    'कर्णाली प्रदेशमा स्वतन्त्र उम्मेदवारको आश्चर्यजनक अगाडि',
    'बागमती प्रदेशमा कांग्रेस र एमालेको कडा प्रतिस्पर्धा',
  ];

  return headlines.map((title, idx) => ({
    id: `news-${idx}-${Date.now()}`,
    title,
    link: `https://example.com/news/${idx}`,
    source: RSS_FEEDS[idx % RSS_FEEDS.length].source,
    sourceIcon: RSS_FEEDS[idx % RSS_FEEDS.length].icon,
    pubDate: new Date(Date.now() - idx * 1800000).toLocaleString('ne-NP'),
    isoDate: new Date(Date.now() - idx * 1800000).toISOString(),
    snippet: title,
    category: 'election',
  }));
}

let cachedFeed: NewsItem[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000;

export async function fetchAllRSSFeeds(): Promise<NewsItem[]> {
  const now = Date.now();
  
  if (cachedFeed.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedFeed;
  }

  const allItems: NewsItem[] = [];
  const fetchPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const response = await axios.get(feed.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      });

      const parsed = await parser.parseString(response.data);
      
      const items: NewsItem[] = (parsed.items || [])
        .filter(item => {
          const title = item.title?.toLowerCase() || '';
          const snippet = item.contentSnippet?.toLowerCase() || '';
          return ELECTION_KEYWORDS.some(keyword => 
            title.includes(keyword.toLowerCase()) || snippet.includes(keyword.toLowerCase())
          );
        })
        .slice(0, 10)
        .map((item, idx) => ({
          id: `${feed.source.toLowerCase()}-${idx}-${Date.now()}`,
          title: item.title || 'No Title',
          link: item.link || '',
          source: feed.source,
          sourceIcon: feed.icon,
          pubDate: item.pubDate || new Date().toISOString(),
          isoDate: item.isoDate || new Date().toISOString(),
          snippet: item.contentSnippet?.substring(0, 200) || '',
          category: 'election',
        }));

      return items;
    } catch (error) {
      console.error(`Error fetching ${feed.source}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(fetchPromises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  });

  if (allItems.length === 0) {
    allItems.push(...generateMockNews());
  }

  allItems.sort((a, b) => 
    new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
  );

  cachedFeed = allItems;
  lastFetchTime = Date.now();

  return allItems;
}

export async function getLatestNews(limit: number = 20): Promise<NewsItem[]> {
  const news = await fetchAllRSSFeeds();
  return news.slice(0, limit);
}

export async function getElectionNews(): Promise<NewsItem[]> {
  return fetchAllRSSFeeds();
}

export function filterByKeyword(items: NewsItem[], keyword: string): NewsItem[] {
  const lowerKeyword = keyword.toLowerCase();
  return items.filter(item => 
    item.title.toLowerCase().includes(lowerKeyword) ||
    item.snippet?.toLowerCase().includes(lowerKeyword)
  );
}

export function searchNews(query: string): NewsItem[] {
  return filterByKeyword(cachedFeed, query);
}
