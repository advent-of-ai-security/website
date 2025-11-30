import { IconBrandGithubFilled, IconBrandBluesky, IconBrandDiscordFilled } from '@tabler/icons-react';

type Props = {
  className?: string;
};

export default function FooterLinks({ className }: Props) {
  return (
    <div
      className={[
        'shell-section__card border border-black bg-white relative z-[1]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="shell-section__body flex flex-wrap items-center justify-between gap-3 text-[12px] uppercase tracking-[0.25em] text-black">
        <div className="flex items-center gap-3 text-black">
          <a
            href="https://github.com/advent-of-ai-security"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center text-black hover:text-black/70"
            aria-label="View Advent of AI Security on GitHub"
          >
            <IconBrandGithubFilled size={22} aria-hidden="true" />
          </a>
          <a
            href="https://bsky.app/profile/icepuma.dev"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center text-black hover:text-black/70"
            aria-label="Follow Advent of AI Security on Bluesky"
          >
            <IconBrandBluesky size={22} aria-hidden="true" />
          </a>
          <a
            href="https://rawkode.chat"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center text-black hover:text-black/70"
            aria-label="Rawkode Academy Discord @ #advent-of-ai-security"
          >
            <IconBrandDiscordFilled size={22} aria-hidden="true" />
          </a>
        </div>
        <span>
          Wanna partner up or sponsor this project? <a href="mailto:marketing@advent-of-ai-security.com" className="hover:text-black/70 underline">Send me an email</a>
        </span>
      </div>
    </div>
  );
}
