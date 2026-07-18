import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

export default function SentimentIndicator({ sentiment, aiEnriched, ai_enriched, className }) {
  // If either prop is explicitly false, do not render
  if (aiEnriched === false || ai_enriched === false) {
    return null;
  }

  if (!sentiment || typeof sentiment !== 'string' || sentiment.trim() === '') {
    return null;
  }

  const normalized = sentiment.toLowerCase().trim();
  if (normalized !== 'positive' && normalized !== 'neutral' && normalized !== 'negative') {
    return null;
  }

  const config = {
    positive: {
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      label: 'Positive',
    },
    neutral: {
      dotColor: 'bg-zinc-400',
      textColor: 'text-zinc-400',
      label: 'Neutral',
    },
    negative: {
      dotColor: 'bg-red-500',
      textColor: 'text-red-400',
      label: 'Negative',
    },
  };

  const { dotColor, textColor, label } = config[normalized];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded bg-zinc-800/40 border border-zinc-800/80 w-fit shrink-0",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      <span className={textColor}>{label}</span>
    </div>
  );
}

SentimentIndicator.propTypes = {
  sentiment: PropTypes.string,
  aiEnriched: PropTypes.bool,
  ai_enriched: PropTypes.bool,
  className: PropTypes.string,
};
