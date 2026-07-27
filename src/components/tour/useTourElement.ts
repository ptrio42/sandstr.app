/**
 * Custom hook for managing tour element positioning
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TooltipRect, SpotlightRect } from './types';

/**
 * Mobile sims render inside a phone bezel with empty space either side. Knowing
 * where that bezel is lets the tooltip stay off the phone screen, so it never
 * covers the surface the step is talking about (or the field you must type in).
 */
function readFrameRect(element: Element): DOMRect | null {
  const frame = element.closest('.mobile-phone-frame-bezel');
  return frame ? frame.getBoundingClientRect() : null;
}

interface UseTourElementResult {
  targetRect: DOMRect | null;
  spotlightRect: SpotlightRect | null;
  tooltipRect: TooltipRect | null;
  targetCenter: { x: number; y: number } | null;
  scrollToElement: () => void;
}

export function useTourElement(
  targetSelector: string,
  position: string,
  padding: number = 8,
  // Real rendered size of the tooltip, measured by the tooltip itself. Step copy
  // varies a lot in length (the cards run 200-300px tall), so a hardcoded guess
  // makes the fit math wrong: the card ends up clipped by the viewport bottom or
  // yanked back on top of the element it is describing.
  measuredSize?: { width: number; height: number } | null
): UseTourElementResult {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  // Bounds of the phone bezel the target lives in, when there is one.
  const [frameRect, setFrameRect] = useState<DOMRect | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  const calculateRects = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') {
      setTargetRect(null);
      return;
    }
    
    const element = document.querySelector(targetSelector);
    if (!element) {
      setTargetRect(null);
      setFrameRect(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    setTargetRect(rect);
    setFrameRect(readFrameRect(element));
  }, [targetSelector]);

  const calculateRectsWithRetry = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') {
      setTargetRect(null);
      return;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    retryCountRef.current = 0;
    
    const attemptFind = () => {
      const element = document.querySelector(targetSelector);
      
      if (element) {
        // Element found - calculate rects and reset retry count
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        setFrameRect(readFrameRect(element));
        retryCountRef.current = 0;
        return true;
      }
      
      // Element not found - retry with delay if we haven't exceeded max retries
      if (retryCountRef.current < 10) {
        retryCountRef.current++;
        const delay = Math.min(50 * retryCountRef.current, 500); // Progressive delay: 50ms, 100ms, 150ms... max 500ms
        retryTimeoutRef.current = setTimeout(attemptFind, delay);
      } else {
        // Target genuinely absent after all retries — clear the rect so the
        // overlay degrades to a centered tooltip instead of highlighting a
        // stale/mismatched element (or showing a blank dark screen).
        setTargetRect(null);
        setFrameRect(null);
      }

      return false;
    };
    
    attemptFind();
  }, [targetSelector]);

  const scrollToElement = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') return;
    
    const element = document.querySelector(targetSelector);
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [targetSelector]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Guard against empty selectors
    if (!targetSelector || targetSelector.trim() === '') {
      setTargetRect(null);
      return;
    }

    // Clear the previous step's rect immediately so we never spotlight a stale
    // element while the new target is being resolved.
    setTargetRect(null);

    // Initial calculation with retry - allows React time to render new elements
    calculateRectsWithRetry();

    // Set up observers for ongoing updates
    observerRef.current = new MutationObserver(() => {
      calculateRects();
    });

    resizeObserverRef.current = new ResizeObserver(() => {
      calculateRects();
    });

    // Set up observers after a short delay to let the element appear
    const observerSetupTimeout = setTimeout(() => {
      const element = document.querySelector(targetSelector);
      if (element && observerRef.current) {
        observerRef.current.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style'],
        });
        if (resizeObserverRef.current) {
          resizeObserverRef.current.observe(element);
        }
      }
    }, 100);

    // Window events
    const handleScroll = () => calculateRects();
    const handleResize = () => calculateRects();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      clearTimeout(observerSetupTimeout);
      observerRef.current?.disconnect();
      resizeObserverRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [targetSelector, calculateRects, calculateRectsWithRetry]);

  // The overlay is position:fixed, so the spotlight lives in VIEWPORT
  // coordinates. getBoundingClientRect() is already viewport-relative — adding
  // window.scroll* double-counts the scroll, which pushed the spotlight (and the
  // backdrop's clip-path hole) off the target and left an undimmed band on top.
  const spotlightRect: SpotlightRect | null = targetRect
    ? {
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        padding,
      }
    : null;

  const tooltipRect: TooltipRect | null = (() => {
    const tooltipWidth = measuredSize?.width || 320;
    // Fallback only covers the first paint, before the tooltip reports its size.
    const tooltipHeight = measuredSize?.height || 220;
    const offset = 16;
    const margin = 16;
    // The controls bar is pinned to the bottom of the overlay; keep clear of it.
    const controlsReserve = 96;

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

    // No resolvable target (missing selector) — center the card in the viewport
    // instead of returning null, which used to hide the tooltip entirely and
    // strand the user on a blank dark screen.
    if (!targetRect) {
      return {
        top: Math.max(margin, Math.round(vh / 2 - tooltipHeight / 2)),
        left: Math.max(margin, Math.round(vw / 2 - tooltipWidth / 2)),
        width: tooltipWidth,
        height: tooltipHeight,
      };
    }

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipHeight - offset;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + offset;
        break;
      case 'center':
      default:
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
    }

    const maxLeft = vw - tooltipWidth - margin;
    const maxTop = vh - tooltipHeight - controlsReserve;

    // Doesn't fit where the step asked for it? Move the card rather than clamp
    // it — clamping slid it back over the very element it points at (e.g. the
    // composer's Post button, or a whole phone screen).
    if (top < margin || top > maxTop) {
      const below = targetRect.bottom + offset;
      const above = targetRect.top - tooltipHeight - offset;

      if (below <= maxTop) {
        top = below;
      } else if (above >= margin) {
        top = above;
      } else {
        // Target is taller than the free space above AND below it (a phone
        // frame fills most of the viewport) — step aside horizontally instead
        // of covering the thing being explained.
        const toTheRight = targetRect.right + offset;
        const toTheLeft = targetRect.left - tooltipWidth - offset;
        if (toTheRight <= maxLeft) {
          left = toTheRight;
        } else if (toTheLeft >= margin) {
          left = toTheLeft;
        }
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      }
    }

    // Inside a phone frame, get out of the frame entirely when there is room
    // beside it. 'center' steps are meant to sit over the app, so leave those.
    if (frameRect && position !== 'center') {
      const overlapsFrame =
        left < frameRect.right &&
        left + tooltipWidth > frameRect.left &&
        top < frameRect.bottom &&
        top + tooltipHeight > frameRect.top;

      if (overlapsFrame) {
        const toTheRight = frameRect.right + offset;
        const toTheLeft = frameRect.left - tooltipWidth - offset;
        if (toTheRight <= maxLeft) {
          left = toTheRight;
        } else if (toTheLeft >= margin) {
          left = toTheLeft;
        }
      }
    }

    return {
      top: Math.max(margin, Math.min(top, Math.max(margin, maxTop))),
      left: Math.max(margin, Math.min(left, maxLeft)),
      width: tooltipWidth,
      height: tooltipHeight,
    };
  })();

  // Calculate target center position for arrow positioning
  const targetCenter = targetRect && tooltipRect
    ? {
        x: targetRect.left + targetRect.width / 2 - tooltipRect.left,
        y: targetRect.top + targetRect.height / 2 - tooltipRect.top,
      }
    : null;

  return {
    targetRect,
    spotlightRect,
    tooltipRect,
    targetCenter,
    scrollToElement,
  };
}
