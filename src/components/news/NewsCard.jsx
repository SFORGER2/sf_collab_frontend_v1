import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, Tag, ImageOff } from 'lucide-react';

/**
 * A single AI news article card.
 * Renders title, description, image, source, date, and category.
 */
export default function NewsCard({ article }) {
  const [imgError, setImgError] = useState(false);

  // Guard against null/undefined article
  if (!article) return null;

  const {
    title,
    description,
    url,
    urlToImage,
    source,
    publishedAt,
    category,
  } = article;

  // Guard: title is required for a meaningful card
  if (!title) return null;

  // Safe date formatting — returns null for invalid dates
  let formattedDate = null;
  if (publishedAt) {
    const parsed = new Date(publishedAt);
    if (!isNaN(parsed.getTime())) {
      formattedDate = parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  const sourceName = typeof source === 'object' ? source?.name : source;
  const showImage = urlToImage && !imgError;

  let validUrl = null;
  try {
    if (url && typeof url === 'string') {
      const parsedUrl = new URL(url.trim());
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        validUrl = parsedUrl.href;
      }
    }
  } catch (e) {
    // Invalid URL
  }

  const CardWrapper = validUrl ? motion.a : motion.div;
  const wrapperProps = validUrl 
    ? { href: validUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <CardWrapper
      {...wrapperProps}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/5"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Image */}
      {showImage && (
        <div className="relative w-full h-44 overflow-hidden">
          <img
            src={urlToImage}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>
      )}

      {/* Fallback when image fails or missing */}
      {!showImage && (
        <div className="relative w-full h-44 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <ImageOff className="w-10 h-10 text-slate-700" />
        </div>
      )}

      <div className="relative flex flex-col flex-1 p-5">
        {/* Category badge */}
        {category && (
          <span className="inline-flex items-center gap-1 w-fit text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-0.5 mb-3">
            <Tag className="w-3 h-3" />
            {category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-100 transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {sourceName && (
              <span className="font-medium text-slate-400">{sourceName}</span>
            )}
            {formattedDate && (
              <>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedDate}
                </span>
              </>
            )}
          </div>
          <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </CardWrapper>
  );
}
