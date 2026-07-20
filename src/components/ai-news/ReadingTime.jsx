import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@/components/ui/badge';

function ReadingTime({ minutes, className }) {
  if (minutes == null) return null;

  return (
    <Badge variant="secondary" className={className}>
      {minutes} min read
    </Badge>
  );
}

ReadingTime.propTypes = {
  minutes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};

export default ReadingTime;
