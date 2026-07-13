import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Axis Robotics Tech Blog',
  description: 'Technical notes from the Axis Robotics team.'
};

export default function TechBlogIndex() {
  return (
    <main className="blogPage">
      <header className="blogIndexHero">
        <div>
          <p className="eyebrow">Axis Robotics · Research & Engineering</p>
          <h1>Tech Blog</h1>
          <p>
            Technical notes on embodied pretraining, robot data, simulation,
            post-training, and the systems behind scalable robot learning.
          </p>
        </div>
        <Link className="blogBackLink" href="/">← Weekly updates</Link>
      </header>

      <section className="blogIndexList" aria-label="Tech blog posts">
        <Link
          className="blogCoverCard"
          href="/tech-blog/cross-source-robotic-pretraining"
        >
          <div className="blogCoverMeta">
            <span>Technical note · Embodied pretraining</span>
            <time dateTime="2026-07-12">July 12, 2026</time>
          </div>
          <h2>Cross-Source Robotic Pretraining Is a Noise-Tolerant Learner</h2>
          <p>Turning in-the-wild human intelligence into robot intelligence.</p>
          <div className="blogCoverFooter">
            <span>12 sections · 8 formulas</span>
            <strong>Read article →</strong>
          </div>
        </Link>
      </section>
    </main>
  );
}
