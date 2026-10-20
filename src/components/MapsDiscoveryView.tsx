import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  ExternalLink,
  ShoppingBag,
  Zap,
  Store,
  Compass,
  AlertCircle,
  Loader2,
  Sparkles,
  Star,
  Quote,
} from 'lucide-react';
import { AppProfile } from '../types';

interface MapsDiscoveryViewProps {
  profile: AppProfile;
  language: 'en' | 'hi';
}

interface PlaceResult {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

// This public Google Maps link does not require Gemini requests or a new API key.
function getGoogleMapsSearchUrl(
  query: string,
  address: string,
  coords: { latitude: number; longitude: number } | null
): string {
  const location = coords
    ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
    : address.trim();
  const searchTerms = [query.trim(), location ? `near ${location}` : '']
    .filter(Boolean)
    .join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchTerms)}`;
}

export const MapsDiscoveryView: React.FC<MapsDiscoveryViewProps> = ({
  profile,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('Find supermarkets, kirana grocery stores and electricity payment centers');
  const [addressInput, setAddressInput] = useState<string>(profile.roomAddress || '');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseMarkdown, setResponseMarkdown] = useState<string | null>(null);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fallbackSearchUrl, setFallbackSearchUrl] = useState<string | null>(null);

  // Auto detect GPS Coordinates
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage(
        language === 'hi'
          ? 'आपके ब्राउज़र में जीपीएस लोकेशन सपोर्ट नहीं है।'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setErrorMessage(
          language === 'hi'
            ? 'लोकेशन एक्सेस नहीं मिल सका। आप मैन्युअली पता लिख सकते हैं।'
            : 'Could not access GPS location. You can specify your room address manually.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Perform Google Maps Grounding Search
  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery || searchQuery;
    if (!q.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setFallbackSearchUrl(null);
    setResponseMarkdown(null);
    setPlaces([]);

    try {
      const res = await fetch('/api/maps/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          address: addressInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch places');
      }

      setResponseMarkdown(data.text || '');
      setPlaces(data.places || []);
    } catch (err: any) {
      console.error('Maps search error:', err);
      setFallbackSearchUrl(getGoogleMapsSearchUrl(q, addressInput, coords));
      setErrorMessage(
        err.message || 'Error executing Google Maps grounding search. Verify your GEMINI_API_KEY.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const quickCategories = [
    {
      id: 'grocery',
      label: language === 'hi' ? 'किराना व राशन' : 'Grocery & Kirana',
      query: 'Find nearest grocery stores, D-Mart, Blinkit hub, and local kirana shops',
      icon: ShoppingBag,
    },
    {
      id: 'electricity',
      label: language === 'hi' ? 'बिजली बिल केंद्र' : 'Power Bill Centers',
      query: 'Find nearby electricity board sub-stations and official bill collection centers',
      icon: Zap,
    },
    {
      id: 'pharmacy',
      label: language === 'hi' ? 'मेडिकल व दवाइयां' : 'Pharmacies / Chemist',
      query: 'Find nearby 24/7 medical stores and chemist pharmacies',
      icon: Store,
    },
    {
      id: 'hardware',
      label: language === 'hi' ? 'हार्डवेयर व इलेक्ट्रीशियन' : 'Hardware & Repair',
      query: 'Find nearby plumbing, electrical hardware, and sanitary stores',
      icon: Compass,
    },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-500/15 via-[#1E1C18] to-[#12110F] border border-amber-500/35 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-[#D4AF37] border border-amber-500/40">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-amber-100">
                  {language === 'hi'
                    ? 'गूगल मैप्स नेविगेटर व सुविधाएं'
                    : 'GOOGLE MAPS UTILITY DISCOVERY'}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Grounding Live
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'hi'
                  ? 'कमरे के पास राशन दुकानें, सुपरमार्केट्स और बिजली बिल केंद्र खोजें'
                  : 'Discover verified grocery stores, bill payment centers & services near your room'}
              </p>
            </div>
          </div>

          {/* Detect Location Trigger */}
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all active:scale-95 shadow-md"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Navigation className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {coords
                ? language === 'hi'
                  ? 'जीपीएस सक्रिय ✓'
                  : 'GPS Located ✓'
                : language === 'hi'
                ? 'जीपीएस लोकेशन जोड़ें'
                : 'Use My GPS'}
            </span>
          </button>
        </div>

        {/* Address and Query Input Row */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              {language === 'hi' ? 'कमरे का पता / शहर' : 'Room Address / Area'}
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => { setAddressInput(e.target.value); setFallbackSearchUrl(null); }}
              placeholder="e.g. Near Metro Station, Sector 62..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
              {language === 'hi' ? 'क्या ढूंढना चाहते हैं?' : 'Search Query'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setFallbackSearchUrl(null); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="e.g. Find D-Mart or cheapest ration grocery shops..."
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-700 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none"
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !searchQuery.trim()}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{language === 'hi' ? 'खोजें' : 'Search'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <a
            href={getGoogleMapsSearchUrl(searchQuery, addressInput, coords)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-100 underline underline-offset-4"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सीधे Google Maps पर खोजें (AI की जरूरत नहीं)' : 'Search directly on Google Maps (no AI required)'}</span>
          </a>
        </div>

        {/* Quick Category Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-400 font-semibold mr-1">
            {language === 'hi' ? 'त्वरित श्रेणियां:' : 'Quick Filters:'}
          </span>
          {quickCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSearchQuery(cat.query);
                  handleSearch(cat.query);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-amber-500/25 hover:border-amber-500/50 text-[11px] font-medium text-amber-200 transition-all active:scale-95"
              >
                <Icon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 shadow-md">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Search Error</h4>
            <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            {fallbackSearchUrl && (
              <div className="mt-3">
                <p className="mb-2 text-amber-100">
                  {language === 'hi'
                    ? 'AI खोज उपलब्ध नहीं है, लेकिन Google Maps पर दुकानें और सेवाएं खोज सकते हैं।'
                    : 'AI search is unavailable, but you can still find shops and services on Google Maps.'}
                </p>
                <a
                  href={fallbackSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 font-bold text-zinc-950 hover:brightness-110 active:scale-95 transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{language === 'hi' ? 'Google Maps पर खोजें' : 'Continue in Google Maps'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 rounded-3xl bg-[#141311] border border-amber-500/25 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          <h3 className="font-cinzel text-sm font-bold text-amber-100">
            {language === 'hi'
              ? 'गूगल मैप्स ग्राउंडिंग द्वारा स्थान खोजे जा रहे हैं...'
              : 'Consulting Google Maps Grounding & Verifying Locations...'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm">
            {language === 'hi'
              ? 'अभिषेक के पते के आधार पर प्रामाणिक गूगल मैप्स लिंक और समीक्षाएं निकाली जा रही हैं।'
              : 'Retrieving official place URIs, verified addresses, and tenant review snippets.'}
          </p>
        </div>
      )}

      {/* Verified Google Maps Grounded Places Grid */}
      {places.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel text-sm sm:text-base font-bold text-zinc-900 dark:text-amber-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'hi'
                  ? `सत्यापित गूगल मैप्स स्थान (${places.length})`
                  : `Verified Google Maps Places (${places.length})`}
              </span>
            </h2>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Direct official navigation links
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map((place, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white dark:bg-[#1A1815] border border-amber-900/10 dark:border-amber-500/25 shadow-lg flex flex-col justify-between hover:border-amber-500/60 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-amber-50 group-hover:text-amber-500 transition-colors">
                      {place.title}
                    </h3>
                    <span className="p-1 rounded-lg bg-amber-500/10 text-[#D4AF37]">
                      <MapPin className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Review Snippets */}
                  {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {place.reviewSnippets.slice(0, 2).map((snippet, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-amber-500/5 dark:bg-amber-400/5 p-2 rounded-xl border border-amber-500/15"
                        >
                          <Quote className="w-3 h-3 text-[#D4AF37] shrink-0 mt-0.5" />
                          <p className="line-clamp-2 italic">{snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-medium">Google Maps Grounded</span>
                  <a
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs hover:brightness-110 active:scale-95 shadow-sm transition-all"
                  >
                    <span>{language === 'hi' ? 'मैप में देखें' : 'Open in Maps'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Grounded Summary */}
      {responseMarkdown && (
        <div className="rounded-3xl p-6 bg-white dark:bg-[#151412] border border-amber-900/10 dark:border-amber-500/25 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-cinzel text-sm font-bold text-zinc-900 dark:text-amber-100">
              {language === 'hi' ? 'सुविधा विश्लेषण व सारांश' : 'Grounded AI Insights & Summary'}
            </h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {responseMarkdown}
          </div>
        </div>
      )}

      {/* Empty State Help Guide */}
      {!isLoading && !responseMarkdown && places.length === 0 && !errorMessage && (
        <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#141311] border border-dashed border-amber-500/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel text-base font-bold text-zinc-900 dark:text-amber-100">
            {language === 'hi' ? 'सुविधाएं व दुकानें खोजें' : 'Search Local Services with Google Maps'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {language === 'hi'
              ? 'ऊपर दी गई किसी भी श्रेणी पर क्लिक करें या अपना प्रश्न लिखें। गूगल मैप्स ग्राउंडिंग द्वारा वास्तविक स्थान और लिंक्स प्राप्त होंगे।'
              : 'Click any quick filter button above or type what you need. Real places will be grounded with live Google Maps links and review highlights.'}
          </p>
        </div>
      )}
    </div>
  );
};
