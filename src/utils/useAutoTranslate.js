import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AOS from 'aos';

const EXCLUDED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'SVG', 'PATH', 'TEXTAREA', 'INPUT'
]);

const LETTER_REGEX = /\p{L}/u;
const TRANSLATABLE_ATTRS = ['placeholder', 'alt', 'title', 'aria-label'];

export function useAutoTranslate(location) {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  // Use a ref for currentLanguage so callbacks always have the latest value (no stale closure)
  const currentLangRef = useRef((i18n.language || 'en').split('-')[0]);
  const currentLanguage = (i18n.language || 'en').split('-')[0];

  const routeKey = `${location?.pathname || ''}${location?.search || ''}${location?.hash || ''}`;
  const routeKeyRef = useRef(routeKey);

  const pendingBatch = useRef(new Set());
  const nodeQueue = useRef(new Map());
  const debounceTimer = useRef(null);
  const isTranslatingRef = useRef(false);
  const observerRef = useRef(null);

  // Keep refs in sync
  useEffect(() => {
    currentLangRef.current = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    routeKeyRef.current = routeKey;
  }, [routeKey]);

  const getCache = useCallback((lang) => {
    try {
      const cacheKey = `sf_translation_cache_${lang}`;
      const cache = localStorage.getItem(cacheKey);
      return cache ? JSON.parse(cache) : {};
    } catch (e) {
      return {};
    }
  }, []);

  const setCache = useCallback((lang, cache) => {
    try {
      const cacheKey = `sf_translation_cache_${lang}`;
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const shouldTranslateText = useCallback((text) => {
    if (!text) return false;
    const trimmed = text.trim();
    if (trimmed.length < 2) return false;
    if (!LETTER_REGEX.test(trimmed)) return false;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return false;
    if (trimmed.includes('@') && !trimmed.includes(' ')) return false;
    return true;
  }, []);

  const shouldTranslateElement = useCallback((element) => {
    if (!element) return false;
    if (EXCLUDED_TAGS.has(element.tagName)) return false;
    if (element.closest('[translate="no"]') || element.closest('.notranslate')) return false;
    return true;
  }, []);

  const performTranslation = useCallback(async (texts, targetLang) => {
    if (texts.length === 0) return {};
    let googleLang = targetLang;
    if (targetLang === 'zh') googleLang = 'zh-CN';
    try {
      const delimiter = '\n|||\n';
      const joinedText = texts.join(delimiter);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${googleLang}&dt=t`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `q=${encodeURIComponent(joinedText)}`,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const results = {};
      if (data && data[0]) {
        const translatedSegments = data[0].map(item => item[0] || '').join('');
        // Trim the delimiter variants that Google might produce (with extra whitespace/newlines)
        const splitTranslations = translatedSegments.split(/\s*\|\|\|\s*/);
        texts.forEach((original, index) => {
          const translated = splitTranslations[index];
          if (translated !== undefined) {
            results[original] = translated.trim() || original;
          } else {
            results[original] = original;
          }
        });
      }
      return results;
    } catch (error) {
      console.error('Auto-translation API call failed:', error);
      return {};
    }
  }, []);

  // Process a batch of queued texts — uses refs to always work with latest lang
  const processBatch = useCallback(async () => {
    if (pendingBatch.current.size === 0) return;
    const targetLang = currentLangRef.current;
    if (targetLang === 'en') {
      pendingBatch.current.clear();
      nodeQueue.current.clear();
      return;
    }
    const textsToTranslate = Array.from(pendingBatch.current);
    pendingBatch.current.clear();
    setIsTranslating(true);
    isTranslatingRef.current = true;

    const cache = getCache(targetLang);
    const uncachedTexts = [];
    const results = {};

    textsToTranslate.forEach(text => {
      if (cache[text]) {
        results[text] = cache[text];
      } else {
        uncachedTexts.push(text);
      }
    });

    if (uncachedTexts.length > 0) {
      const chunkSize = 50;
      const promises = [];
      for (let i = 0; i < uncachedTexts.length; i += chunkSize) {
        promises.push(performTranslation(uncachedTexts.slice(i, i + chunkSize), targetLang));
      }
      const allResults = await Promise.all(promises);
      allResults.forEach(chunkResults => {
        Object.assign(results, chunkResults);
        Object.assign(cache, chunkResults);
      });
      setCache(targetLang, cache);
    }

    // Apply translations to queued nodes
    Object.keys(results).forEach(original => {
      const translation = results[original];
      const items = nodeQueue.current.get(original);
      if (items) {
        items.forEach(({ node, type }) => {
          if (type === 'node') {
            node._translatedValue = translation;
            node._lastTranslatedLang = targetLang;
            // Only update if the node still has the expected content
            try { node.nodeValue = translation; } catch (e) {}
          } else {
            node[`_translated_${type}`] = translation;
            node[`_lastTranslated_${type}Lang`] = targetLang;
            try { node.setAttribute(type, translation); } catch (e) {}
          }
        });
      }
    });

    nodeQueue.current.clear();
    setIsTranslating(false);
    isTranslatingRef.current = false;

    // Refresh animations after translations apply
    setTimeout(() => {
      try { AOS.refresh(); } catch (e) {}
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [getCache, performTranslation, setCache]);

  // Queue a single text node or attribute for translation
  const queueTranslation = useCallback((text, node, type = 'node') => {
    const lang = currentLangRef.current;
    if (lang === 'en') return;

    const cache = getCache(lang);
    if (cache[text]) {
      const translation = cache[text];
      if (type === 'node') {
        node._translatedValue = translation;
        node._lastTranslatedLang = lang;
        try { node.nodeValue = translation; } catch (e) {}
      } else {
        node[`_translated_${type}`] = translation;
        node[`_lastTranslated_${type}Lang`] = lang;
        try { node.setAttribute(type, translation); } catch (e) {}
      }
      return;
    }

    if (!nodeQueue.current.has(text)) {
      nodeQueue.current.set(text, []);
    }
    nodeQueue.current.get(text).push({ node, type });
    pendingBatch.current.add(text);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(processBatch, 80);
  }, [getCache, processBatch]);

  // Core DOM walker — translates or restores all eligible nodes in a subtree
  const translateDOM = useCallback((root) => {
    if (!root) return;
    const lang = currentLangRef.current;

    const walk = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (EXCLUDED_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT;
            if (node.closest('[translate="no"]') || node.closest('.notranslate')) return NodeFilter.FILTER_REJECT;
            // Accept if has any translatable attribute
            for (const attr of TRANSLATABLE_ATTRS) {
              const val = node[`_original_${attr}`] !== undefined
                ? node[`_original_${attr}`]
                : node.getAttribute(attr);
              if (val && shouldTranslateText(val)) return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }

          // Text node
          if (node.parentNode) {
            if (EXCLUDED_TAGS.has(node.parentNode.tagName)) return NodeFilter.FILTER_REJECT;
            if (node.parentNode.closest &&
               (node.parentNode.closest('[translate="no"]') || node.parentNode.closest('.notranslate'))) {
              return NodeFilter.FILTER_REJECT;
            }
          }
          const textValue = node._originalValue !== undefined ? node._originalValue : node.nodeValue;
          if (shouldTranslateText(textValue)) return NodeFilter.FILTER_ACCEPT;
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let currentNode;
    while ((currentNode = walk.nextNode())) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        if (lang === 'en') {
          if (currentNode._originalValue !== undefined) {
            try { currentNode.nodeValue = currentNode._originalValue; } catch (e) {}
            currentNode._lastTranslatedLang = 'en';
          }
        } else {
          if (currentNode._originalValue === undefined || (currentNode._lastTranslatedLang === 'en' && currentNode.nodeValue !== currentNode._originalValue)) {
            currentNode._originalValue = currentNode.nodeValue;
          }
          const sourceText = currentNode._originalValue;
          // Re-translate if: different language, or node still shows original English
          if (currentNode._lastTranslatedLang !== lang || currentNode.nodeValue === sourceText) {
            queueTranslation(sourceText, currentNode, 'node');
          }
        }
      } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        for (const attr of TRANSLATABLE_ATTRS) {
          const currentVal = currentNode.getAttribute(attr);
          if (lang === 'en') {
            if (currentNode[`_original_${attr}`] !== undefined) {
              try { currentNode.setAttribute(attr, currentNode[`_original_${attr}`]); } catch (e) {}
              currentNode[`_lastTranslated_${attr}Lang`] = 'en';
            }
          } else {
            // Determine the source value
            if (currentVal && shouldTranslateText(currentVal)) {
              if (currentNode[`_original_${attr}`] === undefined || (currentNode[`_lastTranslated_${attr}Lang`] === 'en' && currentVal !== currentNode[`_original_${attr}`])) {
                currentNode[`_original_${attr}`] = currentVal;
              }
              const sourceVal = currentNode[`_original_${attr}`];
              if (currentNode[`_lastTranslated_${attr}Lang`] !== lang || currentVal === sourceVal) {
                queueTranslation(sourceVal, currentNode, attr);
              }
            }
          }
        }
      }
    }
  }, [queueTranslation, shouldTranslateText]);

  // Set up (or teardown) the MutationObserver — kept separate from translateDOM calls
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const observer = new MutationObserver((mutations) => {
      // IMPORTANT: Don't skip during translation — page navigation content MUST be caught
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const lang = currentLangRef.current;
          if (lang === 'en') return; // No need to process added nodes in English (translateDOM will catch them later if language changes)

          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              translateDOM(node);
            } else if (node.nodeType === Node.TEXT_NODE) {
              if (node.parentNode
                && shouldTranslateElement(node.parentNode)
                && shouldTranslateText(node.nodeValue)) {
                if (node._originalValue === undefined) {
                  node._originalValue = node.nodeValue;
                }
                queueTranslation(node._originalValue, node, 'node');
              }
            }
          });
        } else if (mutation.type === 'characterData') {
          const lang = currentLangRef.current;
          const node = mutation.target;
          
          if (lang === 'en') {
            // Update original value if React changes it while in English
            node._originalValue = node.nodeValue;
            return;
          }

          if (node.nodeType === Node.TEXT_NODE
            && node.nodeValue !== node._translatedValue
            && node.nodeValue !== node._originalValue) {
            if (node.parentNode
              && shouldTranslateElement(node.parentNode)
              && shouldTranslateText(node.nodeValue)) {
              node._originalValue = node.nodeValue;
              queueTranslation(node._originalValue, node, 'node');
            }
          }
        } else if (mutation.type === 'attributes') {
          const lang = currentLangRef.current;
          const node = mutation.target;
          const attrName = mutation.attributeName;
          if (TRANSLATABLE_ATTRS.includes(attrName)) {
            const attrValue = node.getAttribute(attrName);
            if (attrValue && shouldTranslateText(attrValue)) {
              if (lang === 'en') {
                // Simply track the new original value; DO NOT call setAttribute here to avoid infinite loops
                node[`_original_${attrName}`] = attrValue;
              } else {
                // Only queue if it's not already our translated value
                if (node[`_translated_${attrName}`] !== attrValue) {
                  if (node[`_original_${attrName}`] === undefined) {
                    node[`_original_${attrName}`] = attrValue;
                  }
                  queueTranslation(node[`_original_${attrName}`], node, attrName);
                }
              }
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRS
    });

    observerRef.current = observer;
  }, [queueTranslation, shouldTranslateElement, shouldTranslateText, translateDOM]);

  // ── Effect 1: Language change ──────────────────────────────────────────────
  // Runs when language switches — translates the full current DOM immediately
  useEffect(() => {
    // Clear pending queue for previous language
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    pendingBatch.current.clear();
    nodeQueue.current.clear();

    // Translate the whole DOM with new language
    translateDOM(document.body);

    // Re-setup observer with latest callbacks (language captures in closures)
    setupObserver();

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
  }, [currentLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: Route change ─────────────────────────────────────────────────
  // Runs when navigating to a different page — waits for the new page to render
  useEffect(() => {
    const lang = currentLangRef.current;
    if (lang === 'en') {
      // Still need to restore English on page navigation if user previously had non-English
      setTimeout(() => {
        translateDOM(document.body);
      }, 200);
      return;
    }

    // Give React time to render the new page (lazy-loaded pages need more time)
    // We run in multiple passes to catch late-rendering lazy components
    const timers = [];

    const runPass = (delay) => {
      const t = setTimeout(() => {
        translateDOM(document.body);
      }, delay);
      timers.push(t);
    };

    runPass(100);   // First pass — catches synchronously rendered content
    runPass(400);   // Second pass — catches most lazy-loaded content
    runPass(900);   // Third pass — catches slow network / heavy lazy components
    runPass(2000);  // Fourth pass — final safety net

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [routeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return { isTranslating, currentLanguage };
}
