import React, { useState } from 'react';

/**
 * Responsive shell for map screens.
 * - Phones/tablets: full-screen map with a draggable-looking bottom sheet (tap the handle to collapse).
 * - Desktop (lg+): top navbar, fixed-width side panel on the left, map filling the rest.
 */
const MapLayout = ({ navbar, map, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-neutral-100">
      {navbar}
      <div className="relative min-h-0 flex-1 lg:flex">
        <aside
          className={`absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl bg-white shadow-sheet transition-[max-height] duration-300 ease-out lg:static lg:z-auto lg:max-h-none lg:w-[420px] lg:shrink-0 lg:rounded-none lg:border-r lg:border-neutral-200 lg:shadow-none xl:w-[460px] ${
            collapsed ? 'max-h-[76px]' : 'max-h-[78dvh]'
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
            className="flex w-full shrink-0 justify-center pb-2 pt-3 lg:hidden"
          >
            <span className="h-1.5 w-12 rounded-full bg-neutral-300" />
          </button>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 lg:px-7 lg:py-7">{children}</div>
        </aside>
        <main className="absolute inset-0 lg:relative lg:flex-1">{map}</main>
      </div>
    </div>
  );
};

export default MapLayout;
