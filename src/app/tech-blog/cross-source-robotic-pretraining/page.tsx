import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cross-Source Robotic Pretraining Is a Noise-Tolerant Learner',
  description:
    'Why sufficiently broad and diverse community robot data can support noise-tolerant embodied pretraining.'
};

type ArticleSection = {
  title: string;
  body: string[];
};

const sections: ArticleSection[] = [
  {
    title: '1. The prejudice against dirty data',
    body: [
      'Ask whether a control policy can be pretrained on trajectories collected from a distributed, in-the-wild community of operators, and the reflexive answer is often no. The data appears too dirty: operators hesitate, take suboptimal paths, recover from mistakes, disagree about strategy, and operate different robot embodiments.',
      'The conventional response is to curate first: retain expert demonstrations, standardize the setup, and discard anything noisy before imitation learning. Classical imitation learning implicitly adopts this assumption by treating demonstrations as near-optimal behavior.',
      'Our claim is that this instinct becomes wrong at scale. A bad individual trajectory does not imply a bad aggregate distribution. Once coverage and diversity are large enough, private errors can cancel while shared task-relevant structure accumulates.'
    ]
  },
  {
    title: '2. We have seen this movie before: egocentric data',
    body: [
      'Egocentric human video was once dismissed as too messy for robot learning: action labels were absent, head-mounted cameras were unstable, scenes were uncontrolled, and the human-to-robot embodiment gap was large. These are almost exactly the objections now applied to community simulation trajectories.',
      'EgoVerse assembled roughly 1,362 hours across 80,000 episodes, 1,965 tasks, 240 scenes, and 2,087 human demonstrators, mixing standardized laboratory data with a substantially messier in-the-wild split. DreamDojo went further by training a generalist robot world model on approximately 44,711 hours of uncontrolled internet human video, using self-supervised latent actions instead of scarce action labels.',
      'Both results challenge the idea that imperfect data necessarily poisons generalization. Broad, imperfect data can outperform clean but narrow data on out-of-distribution behavior.',
      'There is an important caveat. EgoVerse also reports that diverse but unaligned data alone provides only limited gains. Scale is most useful when the source data shares task semantics with the target. This alignment qualifier is why pretraining can provide broad competence without solving the last mile.'
    ]
  },
  {
    title: '3. Our claim, made precise',
    body: [
      'Our setting is the robotics analogue of the egocentric-data story. Rather than learning only from expert teleoperation, we learn from large-scale community-generated simulation trajectories: raw, uncurated, and produced by a distributed population across many tasks and embodiments. The claim is that this substrate can pretrain a working control policy.'
    ]
  },
  {
    title: '3.1 Setup',
    body: [
      'Each embodied environment is represented as a partially observable Markov decision process:',
      'FORMULA:E = (S, A, O, T, R, γ)',
      'S denotes states, A actions, O observations, T transition dynamics, R a task reward, and γ ∈ (0, 1) the discount factor. Because learning is performed by imitation, R remains latent: it is never observed in the training data and is used only to define and evaluate task success.',
      'The community dataset is a collection of trajectories:',
      'FORMULA:D = {τᵢ}ᵢ₌₁ᴺ,    τᵢ = (o₁, a₁, …, o_Tᵢ, a_Tᵢ)',
      'Each trajectory has its own horizon Tᵢ. The trajectories are heterogeneous across tasks and embodiments, individually suboptimal and noisy, and collected without centralized expert control. This is precisely the assumption that conventional imitation-learning datasets usually avoid.'
    ]
  },
  {
    title: '3.2 A noise model that remains a valid distribution',
    body: [
      'An additive expression such as πᵢ(a | o) = π*(a | o) + εᵢ(o, a) is tempting, but it is not generally a valid probability distribution: non-negativity and normalization are not preserved.',
      'A cleaner model treats each operator as a mixture of competent behavior and an idiosyncratic deviation distribution:',
      'FORMULA:πᵢ(· | o, c) = (1 − ηᵢ) π*(· | o, c) + ηᵢ ξᵢ(· | o, c)',
      'ηᵢ ∈ [0, 1] describes how noisy operator i is. ξᵢ captures that operator’s hesitation, execution errors, recovery behavior, and personal strategy. No bounded optimality gap is assumed; a single trajectory may be arbitrarily poor.',
      'The load-bearing assumption is that deviations are not systematically biased away from feasible completion. The crowd must be unbiased in expectation:',
      'FORMULA:𝔼ᵢ[πᵢ(a | o, c)] = π*(a | o, c)    for all (o, a, c)',
      'Everyone may be wrong in a different direction, but there must not be one shared wrong direction. Diverse, uncorrelated errors allow averaging to recover signal; correlated errors cause averaging to reproduce the bias.'
    ]
  },
  {
    title: '3.3 Objective',
    body: [
      'We fit a parametric policy by minimizing expected imitation loss over the community dataset:',
      'FORMULA:min_θ  𝔼_{τ ∼ D}[L(π_θ, τ)]',
      'For behavioral cloning, the per-trajectory loss is the negative log-likelihood:',
      'FORMULA:L(π_θ, τ) = −∑ₜ log π_θ(aₜ | oₜ, c)',
      'The regime of interest is asymptotic: N → ∞ while demonstrations remain noisy and tasks and embodiments remain diverse. The statistical structure of the crowd, rather than the quality of any one demonstration, is expected to dominate.',
      'With heterogeneous embodiments there is no single unconditional optimum π*. The correct target is task- and embodiment-conditioned, π*(· | o, c). Context c tells the policy which robot and task it should solve; without c, averaging incompatible embodiments produces incoherent behavior.'
    ]
  },
  {
    title: '3.4 The noise-tolerant embodied pretraining hypothesis',
    body: [
      'QUOTE:NEPH: Given sufficiently large and diverse embodied trajectory data, behavioral cloning converges toward a robust behavioral optimum despite high-variance, suboptimal individual demonstrations, provided a joint measure of coverage and diversity exceeds a critical threshold.',
      'The claim is best understood as a phase transition rather than a smooth guarantee:',
      'FORMULA:J(π*) − 𝔼[J(π̂_N)] → 0    whenever    Φ(D) > Φ_crit',
      'J measures task performance, π̂_N is the policy learned from N trajectories, and Φ(D) is a coverage × diversity functional. Below Φ_crit, noise dominates and the policy learns garbage. Above the threshold, the same high-variance noise becomes tolerable because shared structure dominates.'
    ]
  },
  {
    title: '4. Why the mean survives the mess',
    body: [
      'The intuition is the same as in wisdom-of-crowds results. If many operators attempt the same task poorly but make uncorrelated mistakes, the pointwise average of their action distributions can be substantially better than any individual operator.',
      'A behavioral-cloning model trained on the pooled data acts as an estimator of this mean. It does not preserve the exact hesitation of one operator; it preserves the feasible behavioral path that survives after idiosyncratic hesitation is averaged against many other attempts.',
      'Everything depends on unbiasedness. If an interface artifact pushes every operator toward the same shortcut, averaging faithfully learns that shortcut. Diversity is therefore not merely beneficial; it is the mechanism that turns scale into noise tolerance.'
    ]
  },
  {
    title: '5. Scale as a social experiment',
    body: [
      'A community producing millions of simulation trajectories is a large-scale social experiment: no single expert, no perfectly standardized protocol, and many people independently attempting tasks in a shared environment.',
      'The Chinese engineering phrase 大力出奇迹 — roughly, “brute force works miracles” — captures the wager: a few million noisy trajectories may buy coverage that no carefully curated small dataset can reproduce.',
      'The wager is that millions of noisy trajectories provide something a small curated expert set cannot: coverage. A broad crowd enters long-tail states, encounters unusual objects, and discovers strategies that a carefully designed collection plan may never anticipate.',
      'This changes the unit of data quality. One trajectory may be useless while the full corpus is excellent. Corpus quality lives in coverage and diversity, not in the optimality of every member. The optimization target shifts from per-trajectory cleanliness toward distributional breadth.'
    ]
  },
  {
    title: '6. The last mile: compounding closed-loop refinement',
    body: [
      'Scale can provide broad competence, but it cannot invent behavior that the crowd never demonstrated. The long tail remains thinly covered, and semantically misaligned pretraining data cannot completely close the target-domain gap.',
      'BULLET:Pretrain π_θ on the community dataset D_t.',
      'BULLET:Deploy the policy in simulation and let it visit its own state distribution.',
      'BULLET:Mine failures F_t where the policy breaks.',
      'BULLET:Relabel those visited states with corrective actions from a human, scripted controller, or privileged supervisor.',
      'BULLET:Fold the corrected data back into training, update θ, and repeat.',
      'FORMULA:D_{t+1} = D_t ∪ F_t',
      'Strictly speaking, this is DAgger only when failure states are relabeled with corrective actions. Re-adding failed rollouts without correction does not address compounding error or distribution shift.',
      'The resulting loop is a compounding curriculum. Each deployment reveals a rarer part of the long tail; each correction retires part of that failure region. Pretraining performs the broad 0-to-80 step, while closed-loop correction drives the continuing 80-to-100 climb.'
    ]
  },
  {
    title: '7. What would prove us wrong',
    body: [
      'BULLET:Correlated bias: if crowd errors share one systematic direction, averaging reproduces the bias rather than recovering feasible behavior.',
      'BULLET:Sub-threshold data: below Φ_crit, coverage and diversity are insufficient and noise dominates learning.',
      'BULLET:Alignment gap: diverse source trajectories add little if they do not share task semantics with the deployment target.',
      'BULLET:Long-tail floor: broad pretraining may plateau below useful performance, or closed-loop correction may improve too slowly to close the remaining gap.',
      'NEPH is therefore a falsifiable hypothesis, not a theorem. The pretraining ceiling, the location of the coverage-diversity threshold, and the rate at which correction closes the gap are empirical questions.'
    ]
  },
  {
    title: '8. Takeaway',
    body: [
      'Large-scale noisy crowd-sourced simulation data can be a sufficient substrate for embodied pretraining when it is broad, aligned, and diverse enough. The data may be dirty at the trajectory level while becoming clean in the aggregate.',
      'QUOTE:Stop grading the trajectory. Grade the distribution, then let closed-loop refinement finish the last mile.'
    ]
  }
];

function ArticleBlock({ block }: { block: string }) {
  if (block.startsWith('FORMULA:')) {
    return <div className="techBlogFormula">{block.slice(8)}</div>;
  }
  if (block.startsWith('QUOTE:')) {
    return <blockquote>{block.slice(6)}</blockquote>;
  }
  if (block.startsWith('BULLET:')) {
    return <p className="techBlogBullet">{block.slice(7)}</p>;
  }
  return <p>{block}</p>;
}

export default function CrossSourceRoboticPretrainingPost() {
  return (
    <main className="blogPage">
      <nav className="articleNav" aria-label="Article navigation">
        <Link href="/">Weekly updates</Link>
        <span>/</span>
        <Link href="/tech-blog">Tech Blog</Link>
      </nav>

      <article className="techBlog articlePage">
        <header className="articleCover">
          <div className="articleCoverMeta">
            <span>Technical note · Embodied pretraining</span>
            <time dateTime="2026-07-12">July 12, 2026</time>
          </div>
          <h1>Cross-Source Robotic Pretraining Is a Noise-Tolerant Learner</h1>
          <p>Turning in-the-wild human intelligence into robot intelligence.</p>
        </header>

        <div className="techBlogThesis">
          <span>Thesis</span>
          <p>
            Individual sloppiness is not the same thing as collective
            uselessness. When a robotic dataset is sufficiently large, aligned,
            and diverse, idiosyncratic errors can average out while a coherent,
            feasible behavioral signal survives underneath. We do not
            necessarily need clean data; we need enough aligned, diverse, dirty
            data.
          </p>
        </div>

        <div className="techBlogBody">
          {sections.map((section) => (
            <section className="techBlogSection" key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((block) => (
                <ArticleBlock block={block} key={block} />
              ))}
            </section>
          ))}
        </div>

        <footer className="techBlogReferences">
          <span>References</span>
          <a
            href="https://arxiv.org/abs/2604.07607"
            target="_blank"
            rel="noreferrer"
          >
            EgoVerse: An Egocentric Human Dataset for Robot Learning from
            Around the World
          </a>
          <a
            href="https://arxiv.org/abs/2602.06949"
            target="_blank"
            rel="noreferrer"
          >
            DreamDojo: A Generalist Robot World Model from Large-Scale Human
            Videos
          </a>
        </footer>
      </article>
    </main>
  );
}
