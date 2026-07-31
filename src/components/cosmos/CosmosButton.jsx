import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

/**
 * The cosmos button — a pill with a conic "spark" orbiting its border, which
 * accelerates on hover. Lifted from the SFCollab landing page.
 *
 * Variants carry meaning, they aren't interchangeable skins:
 *   primary  gold fill      the one main action on a screen. Use sparingly.
 *   ghost    cyan glow      secondary navigation and structural actions.
 *   ai       violet glow    anything that invokes the assistant or generation.
 *   promo    magenta glow   sharing, publishing, audience growth.
 *   quiet    no ring        toolbars and dense rows, where a ring would be noise.
 *
 * `asChild` renders the styling onto a child element (e.g. a react-router
 * <Link>) instead of a <button>, the same contract as ui/button.jsx.
 */
const VARIANTS = {
  primary: 'cosmos-btn-primary',
  ghost: 'cosmos-btn-ghost',
  ai: 'cosmos-btn-ai',
  promo: 'cosmos-btn-promo',
  quiet: 'cosmos-btn-quiet',
};

const SIZES = {
  sm: 'cosmos-btn-sm',
  md: 'cosmos-btn-md',
  lg: 'cosmos-btn-lg',
  icon: 'cosmos-btn-icon',
};

export const CosmosButton = React.forwardRef(
  (
    {
      className,
      variant = 'ghost',
      size = 'md',
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        data-slot="cosmos-button"
        disabled={asChild ? undefined : disabled}
        aria-disabled={asChild && disabled ? true : undefined}
        className={cn(
          'cosmos-btn',
          VARIANTS[variant] || VARIANTS.ghost,
          SIZES[size] || SIZES.md,
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

CosmosButton.displayName = 'CosmosButton';

export default CosmosButton;
