import { useEffect, useState, useRef } from 'react';

type Section = {
  id: string;
  title: string;
};

export default function SectionNav() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const userClickedRef = useRef<string | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll('[data-shell-section]');
    const sectionData = Array.from(els)
      .map(el => ({
        id: el.id,
        title: el.querySelector('.shell-section__header a, .shell-section__header span')?.textContent || ''
      }))
      .filter((s): s is Section => Boolean(s.id));
    setSections(sectionData);

    const updateActive = () => {
      // If user recently clicked a section, check if it's still visible
      if (userClickedRef.current) {
        const clickedEl = document.getElementById(userClickedRef.current);
        if (clickedEl) {
          const rect = clickedEl.getBoundingClientRect();
          // If clicked section is visible on screen, keep it active
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setActiveId(userClickedRef.current);
            return;
          }
        }
      }

      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const atBottom = docHeight - scrollBottom < 10;

      // Use expanded reference (50%) at page bottom, otherwise 20%
      const referencePercent = atBottom ? 0.5 : 0.2;
      const referenceY = window.scrollY + window.innerHeight * referencePercent;

      // Find last section whose top has passed the reference point
      let activeSection = sectionData[0];
      for (const section of sectionData) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= referenceY) {
          activeSection = section;
        }
      }

      if (activeSection) {
        setActiveId(activeSection.id);
      }
    };

    updateActive(); // Initial check
    window.addEventListener('scroll', updateActive, { passive: true });
    return () => window.removeEventListener('scroll', updateActive);
  }, []);

  if (sections.length === 0) return null;

  return (
    <div className="hidden md:flex items-center gap-3 flex-nowrap overflow-hidden" role="navigation" aria-label="Section navigation">
      {sections.map((section, index) => {
        const num = index + 1;
        const isActive = activeId === section.id;

        const isHovered = hoveredId === section.id;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={`Jump to section ${num}: ${section.title}`}
            className="flex items-center"
            onMouseEnter={() => setHoveredId(section.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={(e) => {
              e.preventDefault();
              // Track user click intent
              userClickedRef.current = section.id;
              if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
              clickTimeoutRef.current = window.setTimeout(() => {
                userClickedRef.current = null;
              }, 800);
              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              history.pushState(null, '', `#${section.id}`);
            }}
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
