/**
 * MobilePhoneFrame - Shared mobile device frame component
 * Provides consistent mobile phone appearance with proper aspect ratio
 */

import React from 'react';
import { cn } from '../../../utils/cn';

export interface MobilePhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  platform?: 'ios' | 'android';
  showStatusBar?: boolean;
}

/**
 * MobilePhoneFrame - Wraps simulators in a realistic mobile phone frame
 * 
 * Features:
 * - Fixed 9:19.5 aspect ratio (iPhone 14 Pro dimensions)
 * - Device bezel styling with rounded corners
 * - Centered positioning that stays fixed on scroll
 * - Internal content scrolling only
 * - Platform-specific status bars (iOS/Android)
 */
export function MobilePhoneFrame({
  children,
  className,
  platform = 'ios',
  showStatusBar = true,
}: MobilePhoneFrameProps) {
  return (
    <div className="mobile-phone-frame-wrapper flex items-center justify-center h-full w-full p-4">
      {/* Phone bezel */}
      <div
        className={cn(
          'relative',
          // Height-driven so the 9:19.5 ratio is always preserved (width follows
          // from the height); caps keep it sane on huge/short viewports and it
          // never overflows. Sizing off max-width used to squash the ratio.
          'h-[80vh] max-h-[820px] aspect-[9/19.5] max-w-[92vw]',
          // Thin, modern bezel (~8px) with a subtle metal rim + soft drop shadow.
          'rounded-[48px] p-[8px]',
          'bg-neutral-900',
          'shadow-[0_24px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/10',
          'overflow-hidden',
          className
        )}
      >
        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-white dark:bg-gray-900">
          {/* Dynamic Island (iOS) or centered punch-hole (Android) */}
          {platform === 'ios' ? (
            <div className="absolute left-1/2 top-[11px] z-50 h-[26px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
          ) : (
            <div className="absolute left-1/2 top-[10px] z-50 h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-black ring-2 ring-black/25" />
          )}

          {/* Status Bar */}
          {showStatusBar && (
            <div
              className={cn(
                'absolute left-0 right-0 top-0 z-40 h-[44px]',
                'flex items-center justify-between px-7 pt-2',
                'text-xs font-semibold text-black dark:text-white'
              )}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {/* Content Area - Scrollable */}
          <div
            className={cn(
              'absolute inset-0',
              'overflow-y-auto overflow-x-hidden',
              'scrollbar-hide',
              showStatusBar && 'pt-[44px]'
            )}
          >
            {children}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 z-40 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-black/25 dark:bg-white/35" />
        </div>
      </div>
    </div>
  );
}

export default MobilePhoneFrame;
