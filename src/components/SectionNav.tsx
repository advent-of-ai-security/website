import { useEffect, useState, useCallback } from 'react';

type Section = { id: string; title: string };

const SCROLL_OFFSET = 96; // 4 * 24px (4 * var(--shell-gap))

export default function SectionNav() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const calculateActiveSection = useCallback((sectionData: Section[]): string | null => {
    const TOLERANCE = 2; // Allow small margin for sub-pixel rounding issues
    let active = sectionData[0]?.id ?? null;

    for (const section of sectionData) {
      const el = document.getElementById(section.id);
      if (el && el.getBoundingClientRect().top <= SCROLL_OFFSET + TOLERANCE) {
        active = section.id;
      }
    }
    return active;
  }, []);

  useEffect(() => {
    // Note: history.scrollRestoration = 'manual' is set in BaseLayout.astro <head>
    // This ensures browser doesn't perform native hash scroll before React hydrates

    const els = document.querySelectorAll('[data-shell-section]');
    const sectionData = Array.from(els)
      .map(el => ({
        id: el.id,
        title: el.querySelector('.shell-section__header a, .shell-section__header span')?.textContent || ''
      }))
      .filter((s): s is Section => Boolean(s.id));

    setSections(sectionData);
    if (sectionData.length === 0) return;

    // Handle initial state
    const hash = window.location.hash.slice(1);

    if (hash && sectionData.some(s => s.id === hash)) {
      // Hash present: set active and scroll to it
      setActiveId(hash);
      
      const scrollToHash = () => {
        const el = document.getElementById(hash);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
          window.scrollTo({ top, behavior: 'instant' });
        }
      };

      // Initial attempt
      scrollToHash();
      
      // Retry after a short delay to account for layout shifts
      setTimeout(scrollToHash, 100);
    } else {
      // No hash: determine active section based on current scroll position
      // (which browser might have restored automatically)
      setActiveId(calculateActiveSection(sectionData));
    }

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setActiveId(calculateActiveSection(sectionData));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [calculateActiveSection]);

  if (sections.length === 0) return null;

  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      history.pushState(null, '', `#${sectionId}`);
    }
  };

  return (
    <div
      className="hidden md:flex items-center gap-3 flex-nowrap overflow-hidden"
      role="navigation"
      aria-label="Section navigation"
    >
      {sections.map((section, index) => {
        const num = index + 1;
        const isActive = activeId === section.id;
        const isHovered = hoveredId === section.id;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={`Jump to section ${num}: ${section.title}`}
            aria-current={isActive ? 'true' : undefined}
            className="flex items-center"
            onMouseEnter={() => setHoveredId(section.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={(e) => handleNavClick(e, section.id)}
          >
            <span
              className={[
                'h-[calc(var(--shell-gap)*1.5)] w-[calc(var(--shell-gap)*1.5)] shrink-0 inline-flex items-center justify-center',
                'border text-[11px] tracking-[0.15em] transition-all duration-150',
                'hover:border-black/80 hover:bg-black/5 hover:text-black',
                isActive
                  ? 'border-black bg-black text-white'
                  : 'border-black/55 text-black/[0.78]'
              ].join(' ')}
            >
              {String(num).padStart(2, '0')}
            </span>
            <span
              className={[
                'text-[0.65rem] uppercase tracking-[0.15em] whitespace-nowrap overflow-hidden transition-all duration-200',
                isHovered ? 'max-w-[250px] opacity-100 ml-2' : 'max-w-0 opacity-0'
              ].join(' ')}
            >
              {section.title}
            </span>
          </a>
        );
      })}
    </div>
  );
}
