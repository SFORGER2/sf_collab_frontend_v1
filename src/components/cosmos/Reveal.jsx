import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Blur-up scroll reveal, matching the landing page's `.line` treatment.
 *
 * Wrap a block and it fades/rises/unblurs when it scrolls into view. Direct
 * children carrying `.cosmos-reveal-item` stagger in sequence — use the
 * `stagger` prop to add that class to every child automatically.
 *
 *   <Reveal stagger>
 *     <StatTile … /><StatTile … /><StatTile … />
 *   </Reveal>
 *
 * Reveals once and then stops observing. Under `prefers-reduced-motion` the
 * content is shown immediately (the CSS also neutralises the transition).
 */
export function Reveal({
  as: Tag = 'div',
  className,
  children,
  stagger = false,
  threshold = 0.15,
  ...props
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shown, threshold]);

  const content = stagger
    ? React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              className: cn('cosmos-reveal-item', child.props.className),
            })
          : child
      )
    : children;

  return (
    <Tag ref={ref} className={cn('cosmos-reveal', shown && 'is-in', className)} {...props}>
      {content}
    </Tag>
  );
}

export default Reveal;
