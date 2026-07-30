import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import markup from './landing-cosmos.html?raw';
import styles from './landing-cosmos.css?raw';
import { bootUniverse } from './universe';
import { DEV_AUTH_BYPASS } from '@/services/auth/devSession';

/**
 * The SFCollab cinematic landing page.
 *
 * The design is a self-contained document whose script drives the DOM
 * imperatively (WebGL scene, scroll director, HUD, tabs, vision cards). Rather
 * than re-expressing 2,000 lines of choreography as React state, this component
 * owns the container and hands the contents to the original code — the same
 * split the design was written against, so it behaves exactly as authored.
 *
 * React's remaining jobs:
 *   - mount/unmount the global stylesheet (it contains element selectors that
 *     must not leak into the app)
 *   - keep internal links inside the SPA instead of triggering full reloads
 *   - send already-authenticated visitors to their dashboard
 *   - tear the scene down on unmount
 */
export default function LandingCosmos() {
  const navigate = useNavigate();
  const hostRef = useRef(null);
  const { user, access_token } = useSelector((state) => state.auth);

  // Signed-in visitors don't need the pitch. Skipped under the dev auth bypass,
  // which would otherwise make the landing page unreachable while reviewing.
  useEffect(() => {
    if (DEV_AUTH_BYPASS) return;
    if (user && access_token) navigate('/dashboard', { replace: true });
  }, [user, access_token, navigate]);

  // Inject the landing stylesheet for the lifetime of this route only.
  useEffect(() => {
    const tag = document.createElement('style');
    tag.id = 'sfc-landing-styles';
    tag.textContent = styles;
    document.head.appendChild(tag);

    // Restores document scrolling — see the note at the top of the stylesheet.
    document.documentElement.classList.add('sfc-landing-active');

    const prevTitle = document.title;
    document.title = 'SFCollab — The startup intelligence and creation layer';

    return () => {
      tag.remove();
      document.documentElement.classList.remove('sfc-landing-active');
      document.documentElement.classList.remove('no-webgl');
      document.body.classList.remove('no-webgl');
      document.title = prevTitle;
      window.scrollTo(0, 0);
    };
  }, []);

  // Boot the universe once the markup is in the DOM.
  useEffect(() => {
    if (!hostRef.current) return undefined;

    let teardown;
    try {
      teardown = bootUniverse();
    } catch (err) {
      // A failed scene must never cost the visitor the page itself — the
      // stylesheet's .no-webgl rules already provide a static starfield.
      console.error('Landing universe failed to start:', err);
      document.documentElement.classList.add('no-webgl');
      document.body.classList.add('no-webgl');
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('done');
    }

    return () => { if (teardown) teardown(); };
  }, []);

  // Keep in-app links inside the SPA. Hash links and external links fall
  // through to the browser so the scroll director keeps working.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const onClick = (e) => {
      const link = e.target.closest('a');
      if (!link || !host.contains(link)) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;

      e.preventDefault();
      navigate(href);
    };

    host.addEventListener('click', onClick);
    return () => host.removeEventListener('click', onClick);
  }, [navigate]);

  return (
    <div ref={hostRef} dangerouslySetInnerHTML={{ __html: markup }} />
  );
}
