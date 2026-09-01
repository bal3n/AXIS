import rawData from '@/data/siteData.json';
import type { DemoItem, MediaItem, SiteData, WeeklyUpdate } from '@/lib/types';

const data = rawData as SiteData;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

function assetUrl(url?: string) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (BASE_PATH && url.startsWith('/')) return `${BASE_PATH}${url}`;
  return url;
}

type ReportSection = {
  title: string;
  body: string;
  references: string[];
  links?: { label: string; href: string }[];
};

type BlogSection = {
  title: string;
  body: string[];
};

const TECH_BLOG_POST: {
  eyebrow: string;
  title: string;
  subtitle: string;
  thesis: string;
  sections: BlogSection[];
  references: { label: string; href: string }[];
} = {
  eyebrow: 'Technical note · Embodied pretraining',
  title: 'Cross-Source Robotic Pretraining Is a Noise-Tolerant Learner',
  subtitle: 'Turning in-the-wild human intelligence into robot intelligence.',
  thesis:
    'Individual sloppiness is not the same thing as collective uselessness. When a robotic dataset is sufficiently large, aligned, and diverse, idiosyncratic errors can average out while a coherent, feasible behavioral signal survives underneath. We do not necessarily need clean data; we need enough aligned, diverse, dirty data.',
  sections: [
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
  ],
  references: [
    {
      label: 'EgoVerse: An Egocentric Human Dataset for Robot Learning from Around the World',
      href: 'https://arxiv.org/abs/2604.07607'
    },
    {
      label: 'DreamDojo: A Generalist Robot World Model from Large-Scale Human Videos',
      href: 'https://arxiv.org/abs/2602.06949'
    }
  ]
};

const WEEK_COPY: Record<string, { lead: string; sections: ReportSection[] }> = {
  '2026-08-17': {
    lead: 'Across the August 17–31 cycle, the robotics team tightened the browser runtime, expanded articulated TaskGen coverage, and ran a second DAgger round. WASM frontend/backend alignment, an eight-step policy-takeover constraint, and cleaner derived tasks now sit alongside mocap-root randomization, published LIBERO Pro and ABCD variants, DreamZero finetuning on AXIS tasks, and a documented path from generation through post-training to real-robot deployment.',
    sections: [
      {
        title: 'WASM Runtime, Takeover, and Checker',
        body: 'Frontend and backend WASM alignment is complete, and policy inference now runs through WASM ONNX Runtime plus WASM MuJoCo. Policy takeover is constrained to eight steps, undo/redo no longer corrupts replay, and gripper sensitivity was retuned for more stable contact. Backend checker fixes and a more automated HG-DAgger pipeline make correction collection less dependent on one-off manual recovery after every browser drift.',
        references: ['wasm', 'takeover', 'checker', 'gripper']
      },
      {
        title: 'Clean Derived Tasks and More Articulated Coverage',
        body: 'TaskGen can now derive cleaner single-scene tasks with four workspace positions from an existing task, and it can automatically resize grasped objects so they stay collectable. Articulated-scene bugs were fixed, and a broader set of articulated tasks is online, covering appliance, drawer, and kitchen-cabinet interactions in both compact workspaces and full RoboCasa rooms.',
        references: ['articulated', 'taskgen', 'clean task', 'robocasa']
      },
      {
        title: 'DAgger Round Two and DreamZero Finetuning',
        body: 'Short-horizon user inference is now limited during collection so later data filtering costs less. The current correction set still moves the policy: across three seeds the paired evaluation rose from 68/160 to an average 78.3/160, about +10.3 successes in a consistent direction, and HG-DAgger candidates also gained roughly four to seven points against the source baseline. Round-two tasks are online and DreamZero is connected so AXIS tasks can be finetuned in that stack. The remaining gap is cross-platform: policies that look strong in Python still drop after switching to WASM, which is now the main debug target before another large collection round.',
        references: ['dagger', 'dreamzero', 'finetune', 'wasm']
      },
      {
        title: 'Randomization, Handbook, and Sim-to-Real Setup',
        body: 'Mocap-root domain randomization now holds articulated objects in place while varying the rest of the scene, and LIBERO Pro plus ABCD subtasks were published with added randomization. Auto-checker judgment regions were corrected, round-two post tasks were released, and Isaac Sim rendering was repaired and sped up. Training and post-training infrastructure, plus the frontend/backend handbook, now cover the full path from task generation and publish through randomization, collection, verify, cleaning, scoring, rendering, training, post-training, and real-robot deployment, with runnable examples and reproduction scripts. Sim-to-real and co-training comparisons were completed, and a hardware setup with aligned scenes and camera calibration is ready for later data filtering.',
        references: ['randomization', 'libero', 'handbook', 'sim2real']
      }
    ]
  },
  '2026-08-10': {
    lead: 'Across the August 10–17 cycle, the robotics team closed remaining replay and runtime gaps between the browser, policy server, and physics stack, then scaled TaskGen coverage. An articulated asset library is now in the generation path, the full RoboCasa 50×50 scene grid is online, and a cleaner long- versus short-horizon task split is ready for ablation, DAgger, and distillation.',
    sections: [
      {
        title: 'Replay Alignment and Browser Runtime',
        body: 'Policy and human-trajectory action replay are now aligned with the frontend path, with WASM already reaching full replay fidelity. The team added lower-threshold verify intercepts, a task-loading progress indicator, faster scene load, and automatic simulation pause when the operator is idle. Policy runtime and physics runtime were also synchronized with the web client, which unblocks a more trustworthy HG-DAgger training and evaluation pipeline instead of debugging the same sim-to-browser drift on every new run.',
        references: ['replay', 'verify', 'dagger', 'runtime']
      },
      {
        title: 'Articulated Assets and Full RoboCasa Coverage',
        body: 'TaskGen now includes a constructed articulated-asset library of 27 object families with four variants each. All RoboCasa scenes are online as a 50-by-50 layout and style grid, so household tasks can be generated across many kitchen geometries and visual styles rather than a handful of hand-picked rooms. This turns the earlier RoboCasa seed batch into a production scene surface that TaskGen can sample from directly.',
        references: ['articulated', 'robocasa', 'taskgen', 'layout']
      },
      {
        title: 'Cleaner Horizon Splits and LIBERO Pro Readiness',
        body: 'A cleaner long-horizon versus short-horizon task split was released for ablation, so later DAgger and distillation experiments can isolate horizon effects instead of mixing task difficulty with scene noise. LIBERO Pro evaluation already shows consistently high success rates on the cleaner set, which makes this a reasonable point to start DAgger and distillation attempts rather than continuing to expand the benchmark surface first.',
        references: ['libero', 'eval', 'horizon', 'distill']
      },
      {
        title: 'DAgger Data Filtering Direction',
        body: 'The remaining DAgger work this week focused on data filtering and the next improvement direction: keep only the correction segments that actually change closed-loop behavior, and use those traces to decide where distillation should be applied next. Combined with the aligned replay stack, this is meant to make the next training round less dependent on ad-hoc manual collection around a few workspace centers.',
        references: ['dagger', 'filter', 'correction']
      }
    ]
  },
  '2026-08-03': {
    lead: 'Across the August 3–10 cycle, the robotics team focused on unblocking production task generation, moving scene variants off the critical path, and turning HG-DAgger from a local proof of concept into a measurable training recipe. The week combined infrastructure work—CDN-hosted variants, verify UX, and a faster policy evaluation loop—with the first clear distillation gains on both old and new task distributions.',
    sections: [
      {
        title: 'Scene Variants, Verify, and Collection UX',
        body: 'Scene variants were moved to object storage and CDN delivery so they no longer dominate local load time. Frontend XML lighting support was restored, post-task sampling no longer drops variants at random, and post-task scoring was tightened. The team also fixed an undo bug in the takeover-budget path, hid verify failure reasons from operators, and added checker visualization so reviewers can inspect failures without leaking internal reject logic into the collection UI.',
        references: ['verify', 'checker', 'scene', 'variant']
      },
      {
        title: 'Regular Task Generation and Faster Policy Loops',
        body: 'LIBERO Pro, RoboCasa, and wheeled embodiments were added to regular task generation, including wheeled Franka. Generated scene variants now follow the same CDN path as the rest of the task surface, and the pending-publish queue is consistently above 200 tasks. On the training side, the main inference bottleneck remains CPU-side physics stepping; one GPU policy server can now serve about 40 CPU environment clients, which roughly tripled policy training and evaluation throughput.',
        references: ['libero', 'robocasa', 'franka', 'taskgen']
      },
      {
        title: 'DAgger Distillation on Curated Corrections',
        body: 'HG-DAgger experiments covered MLP size, diffusion policy, learning rate, epoch, data mix, IWR-style follow-ups, action chunking, DDPM/DDIM mix weights, D0/D1 clipping, MoE, LoRA, and noise ratio. The current recipe that moved the needle is curated correction data plus D0 distillation to limit forgetting on the older distribution: 200 D0 episodes, 15 successful D1 correction episodes from one focus task, 24 human interventions, and 192 correction transitions. The student is trained with BC on D1 plus an MSE match from a frozen source on D0. Success rate improved by more than 20 percentage points on both old and new distributions, though the result still needs more seeds. Freezing or mixing the normalizer also reduced capability drop on a previously degraded task. Cleaner post tasks were released so the same recipe can be retested more cleanly.',
        references: ['dagger', 'distill', 'd0', 'correction']
      }
    ]
  },
  '2026-07-27': {
    lead: 'Across the July 27–August 3 cycle, the robotics team expanded the browser-facing RoboCasa surface from a small seed set into a richer kitchen-task library. The focus was higher-quality rendered household scenes, additional robot embodiments in the live task UI, joystick-based teleoperation, and clearer in-viewport guidance through task-object and target-area overlays.',
    sections: [
      {
        title: 'More Rendered RoboCasa Kitchen Scenes',
        body: 'The team brought a broader set of high-fidelity RoboCasa kitchen scenes into the browser task library, covering appliance and furniture interactions such as opening fridge drawers, turning on stoves and toasters, sliding oven racks, and operating electric kettles. These scenes move AXIS beyond sparse tabletop setups toward visually denser household environments that are closer to the kinds of long-tail manipulation settings the data engine needs to cover at scale.',
        references: ['robocasa', 'scene', 'kitchen', 'task library']
      },
      {
        title: 'Additional Embodiments in the Live Task UI',
        body: 'Embodiment coverage continued to expand inside the same browser surface. PandaOmron appears across the new RoboCasa tasks, and local review tasks were added for Axis visual-proxy and reduced-face PandaOmron variants. Keeping multiple embodiments on one task dashboard makes it easier to compare control behavior, camera framing, and scene readiness without maintaining separate one-off interfaces for each robot configuration.',
        references: ['pandaomron', 'embodiment', 'visual proxy', 'task library']
      },
      {
        title: 'Joystick and On-Screen Teleoperation Controls',
        body: 'Teleoperation in the RoboCasa browser tasks now supports joystick-oriented control alongside keyboard mappings for translation and rotation. The live interface exposes an on-screen joystick, directional pad, MOVE/GRIP actions, and height or intensity sliders, so operators can drive the gripper more continuously during household manipulations. This reduces reliance on click-heavy discrete motion for tasks that require smoother approach, grasp, and appliance interaction.',
        references: ['joystick', 'teleop', 'control', 'pandaomron']
      },
      {
        title: 'Task Object and Target Area Overlays',
        body: 'The task viewport now surfaces explicit task-object and target-area indicators, with a consistent legend in the live scene. Blue highlights mark the object that should be interacted with, while yellow markers indicate destination or interaction regions when the task requires placement or directed motion. These overlays make goals easier to parse during collection, especially in cluttered kitchen scenes where the correct handle, knob, rack, or appliance control is otherwise easy to miss.',
        references: ['task object', 'target area', 'overlay', 'robocasa']
      }
    ]
  },
  '2026-07-13': {
    lead: 'Across the July 13–26 cycle, the robotics team focused on moving recently completed infrastructure into reliable production use. The main workstreams were scaling benchmark task deployment, increasing verification throughput, improving DAgger data consistency, broadening TaskGen randomization, and aligning additional robot embodiments. The period also marked the public arXiv release of AXIS, connecting the engineering system, community-generated dataset, code, demonstrations, and research narrative into one citable release.',
    sections: [
      {
        title: 'LIBERO Pro and RoboCasa Task Deployment',
        body: 'The team brought 50 LIBERO Pro tasks, covering task IDs 2572–2621, online together with their corresponding scenes. The browser integration preserves benchmark-specific asset randomization while adding license and upstream-dataset attribution directly in the task interface, making the adapted benchmark easier to inspect and use responsibly. In parallel, the first four RoboCasa tasks were organized and validated as a seed batch for broader indoor-scene deployment. Together, these integrations expand AXIS from custom tasks toward a shared browser surface for established manipulation benchmarks and more visually complex household environments.',
        references: ['libero', 'robocasa', 'scene', 'taskgen']
      },
      {
        title: 'Verification Throughput and Physical Consistency',
        body: 'Task caching and verify-worker execution were improved, raising verification speed by roughly three times while also correcting the scoring function. The pipeline now intercepts trajectories whose control-step frequency violates the task contract before they consume downstream resources. At the same time, the checks were adjusted to reduce false positives so valid demonstrations are less likely to be discarded. Incremental and semantic caches, collection-process reuse, evaluation-environment reuse, and reduced production-database access make the verification path faster and more suitable for continuous high-volume data collection.',
        references: ['verify', 'checker', 'replay']
      },
      {
        title: 'OpenArm, T1, and Embodiment Alignment',
        body: 'The team continued expanding embodiment coverage by resolving OpenArm control and collision issues and aligning T1 behavior between simulation and the physical robot. This work reduces the gap between a task that merely renders correctly and one whose control semantics, contacts, and motion remain meaningful across simulation and hardware. The Axis-to-RoboVerse task conversion path was also completed and documented, allowing task definitions and assets to move more consistently across the broader training and evaluation stack. These improvements support a more reusable multi-embodiment pipeline rather than separate one-off integrations for every robot.',
        references: ['openarm', 't1', 'embodiment', 'roboverse']
      },
      {
        title: 'TaskGen Randomization and DAgger Reliability',
        body: 'TaskGen expanded spatial and variant randomization beyond a small number of tightly clustered points toward a wider and more uniform sampling distribution. New visualization and validation tools make it possible to inspect whether generated initial states actually cover the intended workspace instead of silently collapsing into narrow modes. For HG-DAgger integration, frontend observation-history construction and action-application semantics were aligned so collected corrections match policy execution more faithfully. Drag-control frequency was reduced for consistent command timing, while caching, process reuse, and batched inference improved collection and evaluation throughput for larger post-training runs.',
        references: ['taskgen', 'randomization', 'dagger', 'model']
      },
      {
        title: 'AXIS Paper Released on arXiv',
        body: 'The AXIS research release was completed by consolidating the paper logic, storyline, statistics, main text, and appendix, with particular attention to making the abstract and introduction clearly explain the growable community-driven data engine. “AXIS: A Growable Community-Driven Data Engine for Scalable Robot Manipulation” was submitted to arXiv and appeared at the top of the newest Robotics search results at release time. The project website was updated with live data counters and the latest demonstrations so the public artifact reflects the current scale of the dataset rather than a static snapshot. A first release video was also produced to communicate the paper, system, and data engine to a broader research audience.',
        references: ['paper', 'arxiv', 'dataset', 'video'],
        links: [
          {
            label: 'Read the arXiv paper',
            href: 'https://arxiv.org/abs/2607.21588'
          },
          {
            label: 'Open the AXIS-V1 project website',
            href: 'https://axisaiorg.github.io/AXIS-V1/'
          }
        ]
      }
    ]
  },
  '2026-07-06': {
    lead: 'This week focused on DAgger launch preparation, TaskGen capability upgrades, and browser-side scene improvements. The work pushed AXIS further beyond a pure data-collection platform toward a continuous training loop that can batch-generate tasks, collect correction data, verify replay, and support richer scenes and robot embodiments.',
    sections: [
      {
        title: 'DAgger Launch Preparation',
        body: 'The DAgger path moved closer to launch through batch post-task generation and operation-page fixes that reduce opportunities for users to exploit interface loopholes. These changes are meant to keep collected correction data clean enough to enter downstream training rather than becoming another manual review burden.',
        references: ['dagger', 'post task', 'policy']
      },
      {
        title: 'Physical Consistency and Replay Verification',
        body: 'The team strengthened physical-consistency checks and added seed-based object reset plus verification for DAgger. Replay validation is now being applied to collected DAgger data, so correction segments can be checked before being used in the training loop.',
        references: ['dagger', 'verify', 'replay', 'seed']
      },
      {
        title: 'TaskGen Performance and Auto-Checker Upgrades',
        body: 'TaskGen work focused on improving generation performance, expanding auto-checker coverage, and enabling a wider range of initial-position randomization. These upgrades make generated tasks more diverse while keeping them collectable and verifiable.',
        references: ['taskgen', 'checker', 'randomization']
      },
      {
        title: 'OpenArm and AssetGen Worker',
        body: 'TaskGen support for OpenArm was added, though the IK still needs further correction. The team also started building an automated AssetGen worker and a more compact asset taxonomy to make task and asset production easier to scale.',
        references: ['openarm', 'asset', 'taskgen']
      },
      {
        title: 'RoboCasa Browser Scenes',
        body: 'RoboCasa scenes were migrated into the browser, bringing high-quality indoor environments into the web task interface while resolving previous lag issues. This expands the visual and semantic complexity available for future task collection and evaluation.',
        references: ['robocasa', 'scene', 'mujoco', 'browser']
      }
    ]
  },
  '2026-06-28': {
    lead: 'This week focused on turning the June DAgger and TaskGen direction into concrete execution work: stabilizing worker infrastructure, preparing post-task deployment, bringing OpenArm online, and improving object-selected gripper movement for smoother correction-data collection.',
    sections: [
      {
        title: 'DAgger Scoring and Correction-Data Training',
        body: 'The DAgger pipeline moved from infrastructure toward training execution. The scoring direction is now defined as a function of trajectory quality, policy-control time, and total control time, using a score such as dagger_score = length.score * policy_control_time / total_control_time. The next tasks are aligned with Yanqing around follow-up TODOs and reproducing the state-based diffusion policy baseline, so correction data can be evaluated against a controlled small-model training setup.',
        references: ['dagger', 'model', 'policy']
      },
      {
        title: 'Post-Task Preparation and Test Deployment',
        body: 'Training jobs are being run on the server, then uploaded to test for post-task release preparation. This turns the post-training loop into an operational workflow: train, package, upload, test, and prepare the task for product-side release instead of treating each iteration as a one-off experiment.',
        references: ['model', 'taskgen', 'replay']
      },
      {
        title: 'TaskGen Bottleneck Roadmap',
        body: 'The new TaskGen bottleneck analysis clarified that layout construction and asset generation should be separated, automated, and parallelized so the pipeline no longer requires constant manual monitoring. The immediate work includes debugging workers, expanding checker and asset-library tests, checking post-task generation issues, and defining a new TaskGen roadmap around scalable long-horizon task production.',
        references: ['taskgen', 'checker', 'libero', 'worker']
      },
      {
        title: 'Parallel Rendering and Libero Pro Migration',
        body: 'Rendering throughput improved after switching to a parallel rendering path, roughly doubling speed in the current setup. In parallel, Libero Pro migration is being prepared so the same task and correction-data infrastructure can connect to more mainstream benchmark tasks.',
        references: ['taskgen', 'libero', 'parallel']
      },
      {
        title: 'OpenArm and Smoother Object-Selected Control',
        body: 'OpenArm was brought online, and object-selected gripper motion was improved so selecting an object automatically sends the gripper toward the target. The movement was smoothed because overly fast drag trajectories are hard for policies to learn, while controlled randomization remains in the loop to preserve data diversity.',
        references: ['openarm', 'teleoperation', 'gripper', 'randomization']
      }
    ]
  },
  '2026-06-21': {
    lead: 'This week, the robotics team consolidated the June work into a clearer data-loop direction: moving beyond standard short-horizon single-arm demonstrations toward complex-task data, correction data, and continuous model iteration. The focus was to make data collection more valuable, reduce low-quality trajectories, and prepare the post-training loop for scalable DAgger-style improvement.',
    sections: [
      {
        title: 'Teleoperation and Complex-Task Collection',
        body: 'The team continued improving direct gripper dragging, object selection with automatic pre-grasp movement, and bimanual control. The goal is to skip low-information but high-effort actions such as manually moving the gripper close to the target, while preserving the high-value parts of the demonstration: contact, grasping, gripper closing, and correction. After fixes around latency, sensitivity, penetration, and grasp stability, bimanual collection is more natural, and the Booster bimanual interface is now much smoother for future mobile-bimanual tasks.',
        references: ['teleoperation', 'gripper', 'openarm', 'booster']
      },
      {
        title: 'Verification, Checker, and Data Quality',
        body: 'Verification and checker logic were strengthened in response to new community cheating patterns. The stricter verification path is being extended to new features such as bimanual tasks and DAgger collection. In parallel, operation bugs, asset issues, frontend/backend inconsistencies, and replay problems were addressed so fewer low-quality trajectories enter the training pipeline and manual review remains manageable.',
        references: ['checker', 'verify', 'taskgen']
      },
      {
        title: 'Model Iteration and DAgger Post-Training',
        body: 'The automated task-to-policy loop is now largely connected: task, policy, success rate, heatmap, backend replay video, inference visualization, reset, undo/redo, and randomization are all part of the same iteration story. Directly collecting full failure-task demonstrations only produced limited gains, so the team is shifting toward DAgger-style correction data, where the database distinguishes human intervention segments from original policy rollout segments and supports verification.',
        references: ['dagger', 'model', 'policy', 'replay']
      },
      {
        title: 'TaskGen and Articulated Assets',
        body: 'TaskGen articulated-object support expanded beyond the earlier six categories. With an Articraft-style workflow, a coding agent can generate broader articulated assets, while a semantic LLM agent and DINO-based visual identifier retrieve better asset matches from prompts. The team is also improving description-to-checker automation plus asset initial-state and orientation correction to make generated tasks more stable and collectable.',
        references: ['taskgen', 'articulated', 'dataset']
      },
      {
        title: 'Real-World Validation and July Direction',
        body: 'Dataset v2 long-horizon data collection is underway, and early real-world Franka results suggest that Axis + DROID co-training can preserve useful learned priors on Pick Butter. The team will continue stress testing harder tasks to see whether AXIS diversity in semantics and spatial layouts improves real-world transfer. July will focus on DAgger/post-training pilot studies and Dataset v2 production, with both directions moving toward ICRA submission.',
        references: ['realworld', 'franka', 'dataset', 'booster']
      }
    ]
  },
  '2026-06-14': {
    lead: 'This cycle focused on making browser-based robot control smoother, preparing longer-horizon articulated-object tasks, and tightening the path from task data to trained and evaluated policies. The main theme was improving the robotics loop end to end: interaction, replay, verification, training, and evaluation all moved toward workflows that are easier to inspect, reproduce, and explain.',
    sections: [
      {
        title: 'Teleoperation and Data Collection',
        body: 'End-effector dragging was rebuilt so the gripper moves through smoother joint-space interpolation instead of abrupt incremental updates. The change reduces arrival jitter, raises the effective control frequency while dragging, and still keeps trajectories compatible with backend replay and verification. This matters because the team is using browser interaction as a data-collection surface: if the control interface is noisy or hard to operate, the resulting demonstrations become less useful for imitation and recovery training.',
        references: ['teleoperation', 'drag', 'replay']
      },
      {
        title: 'Long-Horizon Task Preparation',
        body: 'The task set expanded toward multi-step articulated-object demos, including tasks with hinged or movable objects and four to five meaningful action steps. These tasks give TaskGen a more concrete target than short pick-and-place scenes: generated environments need object state, contact timing, and intermediate progress to remain coherent across the full episode.',
        references: ['taskgen', 'articulated', 'randomization']
      },
      {
        title: 'Policy Release and Evaluation Loop',
        body: 'The policy workflow became more explicit by connecting task IDs, model paths, evaluation outputs, success-rate summaries, and visual diagnostics. This makes trained policies easier to review before release and gives reviewers a clearer map from a task or model identifier to the references that explain whether the policy is ready.',
        references: ['policy', 'model', 'dataset']
      },
      {
        title: 'Multi-Embodiment Dataset Direction',
        body: 'The team also validated dataset generation across multiple robot embodiments. Instead of treating each robot as a special case, the pipeline is moving toward shared task definitions, rendering, and evaluation surfaces that can be reused across arms and mobile manipulators. That is important for scaling demonstrations beyond a single robot form.',
        references: ['dataset', 'embodiment', 'booster']
      }
    ]
  },
  '2026-06-07': {
    lead: 'The team worked across interaction design, multi-embodiment TaskGen, checker reliability, and Booster task quality. The central goal was to make the web robotics stack more usable for humans while also making the resulting data more reliable for training and evaluation.',
    sections: [
      {
        title: 'Interaction Design for Easier Demonstrations',
        body: 'The teleoperation interface moved away from exposing every low-level motion decision to the user. Direct gripper dragging and object-assisted pre-grasp movement were introduced so the user can focus on the meaningful part of a manipulation episode: choosing the grasp point, closing the gripper at the right time, and making small corrections around contact. This is especially important for dual-arm and wheeled-dual-arm tasks, where raw control complexity can overwhelm the collector before useful data is produced.',
        references: ['teleoperation', 'drag']
      },
      {
        title: 'TaskGen Across Embodiments',
        body: 'TaskGen continued shifting from embodiment-specific patches to shared infrastructure. Layout generation, rendering, and checker generation are being reworked so a task is not implicitly tied to one robot configuration. This should make it easier to generate comparable tasks across Franka-like arms, Booster, ALOHA-style setups, and other embodiments without rebuilding the task logic each time.',
        references: ['taskgen', 'embodiment', 'checker']
      },
      {
        title: 'Booster Reliability',
        body: 'The team investigated why Booster tasks showed a higher failure rate than expected. The failures came from a mix of older task versions and mismatches between frontend and backend checker behavior. Fixing those gaps improves trust in the displayed pass/fail result and prevents training or evaluation decisions from being based on stale task definitions.',
        references: ['booster']
      },
      {
        title: 'Replay and Web Policy Support',
        body: 'Attempt video export and background task handling were improved so production task attempts can be inspected after the fact. This helps the team debug user reports, checker disagreements, and policy behavior without relying only on logs or manual reproduction.',
        references: ['attempt', 'replay', 'policy']
      }
    ]
  },
  '2026-06-01': {
    lead: 'This week concentrated on stabilizing articulated-object task generation, broadening randomized-view data collection, and improving the automation that connects task identifiers to training, checkpoints, and evaluation artifacts. The update also tightened verification so suspicious or physically inconsistent trajectories can be detected earlier.',
    sections: [
      {
        title: 'Articulated-Object TaskGen',
        body: 'TaskGen testing covered a wider set of articulated objects, including cabinet- and drawer-style objects that require open and close interactions rather than simple translation. Rotation and collision bugs were fixed so generated scenes better match the physical constraints the policy will later need to learn. This moves TaskGen closer to producing long-horizon manipulation tasks with meaningful object state changes.',
        references: ['taskgen', 'articulated']
      },
      {
        title: 'Randomized-View Data Collection',
        body: 'The data-collection pipeline added stronger camera-position randomization to improve visual robustness. The goal is to prevent policies from overfitting to a single browser view or a narrow distribution of camera angles. Randomized demonstrations also provide better material for evaluating whether a policy can generalize across scene presentation changes.',
        references: ['randomization', 'teleoperation']
      },
      {
        title: 'Training and Evaluation Automation',
        body: 'The task-to-model and model-to-evaluation workflows became more automated. Given a task ID, the system can trigger training, produce a checkpoint, upload artifacts, and generate evaluation outputs such as success rates and success-region visualizations. This reduces handoff cost and gives the team a clearer path from task definition to model review.',
        references: ['model', 'policy']
      },
      {
        title: 'Verification and Data Quality',
        body: 'Backend verification gained stronger checks for contact, orientation, step order, and slow-drift cheating. Instead of only checking terminal state, the verifier can reason about trajectory consistency over time. This is important for browser-collected robotics data because training quality depends on filtering out submissions that look successful only because the state was edited or drifted unnaturally.',
        references: ['checker', 'verify', 'replay']
      }
    ]
  },
  '2026-05-24': {
    lead: 'The main theme was automation across the data-to-model loop. The team connected production attempts, replay videos, task IDs, model training, checkpoint upload, and evaluation output into a more repeatable workflow while continuing to expand TaskGen and prepare the dataset path for release.',
    sections: [
      {
        title: 'Attempt Replay Automation',
        body: 'Attempt IDs can now be mapped to simulation replay videos, making production submissions easier to inspect. This turns raw user attempts into reviewable reference material, which is useful for debugging failed tasks, validating checker behavior, and explaining why a specific attempt should or should not enter a training dataset.',
        references: ['attempt', 'replay']
      },
      {
        title: 'Task-to-Model Pipeline',
        body: 'Given a task ID, the pipeline can move closer to training a model, uploading the checkpoint, and syncing the model metadata needed by product and evaluation surfaces. This is a key step toward repeatable robotics experiments because it makes the path from a browser task to a policy artifact explicit and scriptable.',
        references: ['model', 'policy']
      },
      {
        title: 'Evaluation Output',
        body: 'The evaluation side also became more structured. Given a task and model, the system can produce success-rate summaries and visualizations that explain where the policy succeeds or fails. These artifacts make it easier to compare task, dataset, and policy versions during review.',
        references: ['model', 'dataset']
      },
      {
        title: 'TaskGen and Real-World Preparation',
        body: 'TaskGen continued adding articulated-object capability while real-world Booster setup moved forward. Together these efforts connect simulated task generation with the practical requirements of robot embodiment, rendering, and hardware-facing validation.',
        references: ['taskgen', 'articulated', 'booster']
      }
    ]
  },
  '2026-05-17': {
    lead: 'This week improved data quality, TaskGen coverage, model deployment readiness, and real-world validation. The update is especially important because it connects user-facing task reliability with the recovery-data work needed to improve policies after failures.',
    sections: [
      {
        title: 'Replay and Verification Integrity',
        body: 'The backend replay mechanism was improved to reduce cases where an edited terminal state could pass as a valid completion. Instead of trusting only the final checker state, the system increasingly uses replay and trajectory-level signals to decide whether a task was solved legitimately. This makes the collected data safer to use for training.',
        references: ['checker', 'replay']
      },
      {
        title: 'Recovery-From-Failure Data',
        body: 'The recovery pipeline collected failed, near-success, and intermediate states so policies can learn from more than clean demonstrations. The idea is to start from meaningful failure states, train or fine-tune a lightweight policy, and evaluate whether adding recovery data improves success beyond the baseline plateau.',
        references: ['recovery', 'model']
      },
      {
        title: 'TaskGen Articulated Objects',
        body: 'TaskGen began producing articulated-object tasks end to end from prompt-level descriptions. This turns task intent into testable manipulation scenes and makes it possible to expand beyond simple object relocation into tasks where the object has internal state, joints, or open/close interactions.',
        references: ['taskgen', 'articulated']
      },
      {
        title: 'Web Simulation and Asset Quality',
        body: 'The team continued fixing asset-level issues such as penetration, hard-to-grasp objects, lag, and interaction instability. These fixes matter because low-quality assets can make a task look like a policy or user failure even when the underlying task definition is reasonable.',
        references: ['webapp', 'mujoco', 'axis arm']
      }
    ]
  },
  '2026-05-10': {
    lead: 'The work this week focused on understanding data quality, expanding TaskGen service capabilities, and making the browser-based data-to-model loop more reproducible. The update also includes practical simulation fixes that directly affect whether users can complete tasks cleanly.',
    sections: [
      {
        title: 'Data Quality and Failure Analysis',
        body: 'Task failure analysis separated real user performance from bot-like or repeated traffic. This prevents the team from misreading a task as low quality when the apparent failure rate is inflated by abnormal submissions. The same analysis informs scripts that can identify suspicious users or attempts based on verification failure reasons and behavior patterns.',
        references: ['checker', 'replay']
      },
      {
        title: 'TaskGen Web Service',
        body: 'The TaskGen service package added interfaces for customizing and visualizing data diversity as well as downstream model performance. This makes TaskGen more useful as an interactive system rather than only an offline generator: users can inspect how task variations affect the data and model loop.',
        references: ['taskgen']
      },
      {
        title: 'Simulation and Control Fixes',
        body: 'The team fixed asset-level problems such as lag, object adhesion, failed graspability, and penetration in the latest scene batch. Axis arm teleoperation, IK behavior, gripper closure, initial-state handling, and control-panel behavior were also adjusted so browser tasks behave more consistently during collection.',
        references: ['teleoperation', 'axis arm']
      },
      {
        title: 'Recovery Pipeline Planning',
        body: 'Recovery-from-failure work continued by preparing state selection, collection, training, evaluation, failure-task creation, and replay filtering as a coordinated pipeline. This sets up later experiments where failure states can be extracted automatically and turned into targeted recovery data.',
        references: ['recovery', 'model']
      }
    ]
  },
  '2026-05-03': {
    lead: 'The reporting period began with broad progress across task generation, simulation infrastructure, model training, failure recovery, and asset-level data expansion. The team was building the foundations for a full robotics data loop: generate tasks, collect data in the browser, verify attempts, train policies, and use failure cases to improve future data collection.',
    sections: [
      {
        title: 'TaskGen Foundation',
        body: 'TaskGen added asset scanning, long-horizon support, automatic checker generation, and multi-embodiment task generation. These capabilities make generated tasks more grounded in available scenes and assets while also reducing the manual work required to define what success means for a new manipulation task.',
        references: ['taskgen', 'checker', 'embodiment']
      },
      {
        title: 'Simulation and Replay Infrastructure',
        body: 'MuJoCo replay, verification, and scene-variant workflows were improved so generated tasks can be inspected and debugged more reliably. The team also worked on reducing repeated downloads caused by scene variants, which improves iteration speed for both humans and automation.',
        references: ['mujoco', 'replay']
      },
      {
        title: 'Recovery Data and Lightweight Training',
        body: 'Recovery-from-failure work collected intermediate states where the task was already failing, nearly successful, or positioned near a critical transition. Those states can be used to train a lightweight policy that either becomes an evaluation tool or produces additional data from underrepresented failure distributions.',
        references: ['recovery', 'model']
      },
      {
        title: 'Multi-Embodiment and Dataset Direction',
        body: 'The team started validating task generation and model workflows across multiple robot embodiments. This early work set up the later dataset direction: one task-generation pipeline should support different robot forms without requiring every embodiment to be treated as a separate product.',
        references: ['embodiment', 'dataset', 'policy']
      }
    ]
  }
};

const BLOCKED_MEDIA_IDS = [
  '37868db0a61c8069adebe3c1e374918d',
  '37868db0a61c8080a1f1c549597ebf8d',
  '38068db0a61c80a8ad86c24f3407ef97',
  '36468db0a61c801690e9cae4f106f507',
  '35d68db0a61c80b6a9ceec775bf79366'
];

const ALLOWED_MEDIA_IDS = [
  '39568db0a61c80e78e30eea69d47dad2',
  '39568db0a61c80c2992ddae4e41ee3c5',
  '3aa68db0a61c807f910bc6dfa9e850d5',
  '3a968db0a61c80638523d17ae3a67699',
  '3aa68db0a61c80a893e6f2eb644b434a',
  '3b868db0a61c80838e58d9585f6eca23',
  '3bf68db0a61c804882d0fe142f1f9912',
  '3c668db0a61c8012a0a6cd5ed76010be',
  '3c668db0a61c8052909ed1b3dfc5c40c',
  '3c668db0a61c803bb767d19b6e90142b',
  '3c668db0a61c8063978ee96a20d2af60'
];

function fmtDate(date: string) {
  if (!date || date === 'undated' || date === 'older') return date;
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.valueOf())) return date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtRange(week: WeeklyUpdate) {
  return `${fmtDate(week.startDate)} - ${fmtDate(week.endDate)}`;
}

function compact(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function contextText(demo: DemoItem) {
  return compact(`${demo.title} ${demo.caption} ${demo.tags.join(' ')}`).toLowerCase();
}

function reportTitle(week: WeeklyUpdate) {
  return `Robotics Progress: ${fmtRange(week)}`;
}

function reportLead(week: WeeklyUpdate) {
  return WEEK_COPY[week.id]?.lead || 'The robotics team continued implementation work and captured demo references in the progress notes.';
}

function reportSections(week: WeeklyUpdate) {
  return WEEK_COPY[week.id]?.sections || [];
}

function demoCaption(demo: DemoItem, week: WeeklyUpdate) {
  const text = contextText(demo);

  if (text.includes('arxiv') || text.includes('paper release')) {
    return 'The AXIS paper is released on arXiv with updated research materials.';
  }
  if (text.includes('clean task') || text.includes('grasped object')) {
    return 'TaskGen derives cleaner articulated tasks and automatically resizes grasped objects.';
  }
  if (text.includes('dreamzero') || text.includes('round two') || text.includes('round 2')) {
    return 'Round-two DAgger tasks are online with DreamZero finetuning on AXIS tasks.';
  }
  if (text.includes('pick place') || text.includes('counter to oven')) {
    return 'RoboCasa pick-and-place tasks run with object overlays in the browser interface.';
  }
  if (text.includes('distill') || text.includes('d0') || text.includes('correction episode')) {
    return 'DAgger distillation lifts closed-loop success while limiting forgetting on older tasks.';
  }
  if (text.includes('articulated asset') || text.includes('multi-embodiment scene')) {
    return 'TaskGen ships an articulated asset library across tabletop and kitchen embodiments.';
  }
  if (text.includes('layout') && text.includes('style')) {
    return 'All RoboCasa scenes are online as a 50-by-50 layout and style grid.';
  }
  if (text.includes('libero pro eval') || text.includes('eval result')) {
    return 'LIBERO Pro evaluation shows consistently high success on the cleaner task set.';
  }
  if (text.includes('checker') || text.includes('scene variant')) {
    return 'Verify and checker visualization run on CDN-hosted scene variants.';
  }
  if (text.includes('libero')) {
    return 'LIBERO Pro tasks and scenes run in the AXIS browser interface.';
  }
  if (text.includes('t1')) {
    return 'OpenArm control and T1 embodiment behavior are aligned across simulation and hardware.';
  }
  if (text.includes('openarm')) {
    return 'OpenArm support is validated in the browser-based task interface.';
  }
  if (text.includes('franka') || text.includes('cotraining') || text.includes('pick butter')) {
    return 'Real-world Franka co-training is tested against the DROID baseline.';
  }
  if (text.includes('task object') || text.includes('target area') || text.includes('overlay')) {
    return 'Task-object and target-area overlays guide collection in cluttered kitchen scenes.';
  }
  if (text.includes('joystick') || text.includes('teleop control')) {
    return 'Joystick and on-screen controls support smoother browser teleoperation.';
  }
  if (text.includes('task library') || text.includes('all tasks')) {
    return 'The RoboCasa task library expands with more kitchen scenes and embodiment variants.';
  }
  if (text.includes('robocasa') || text.includes('indoor scene') || text.includes('pandaomron')) {
    return 'Expanded RoboCasa scenes run in the browser with PandaOmron embodiment and live teleop controls.';
  }
  if (text.includes('articraft') || text.includes('dino')) {
    return 'TaskGen expands articulated assets through semantic and visual retrieval.';
  }
  if (text.includes('libero') || text.includes('worker') || text.includes('parallel')) {
    return 'TaskGen workers are debugged for scalable task generation and Libero Pro migration.';
  }
  if (text.includes('object selection') || text.includes('automatic pre-grasp') || text.includes('gripper')) {
    return 'Object selection and gripper movement are smoothed for correction-data collection.';
  }
  if (text.includes('drag') || text.includes('pre-grasp') || text.includes('teleop')) {
    return 'Teleoperation is tested with smoother gripper control and replay-safe motion.';
  }
  if (text.includes('triple camera')) {
    return 'Booster teleoperation is shown with the updated multi-camera setup.';
  }
  if (text.includes('booster') && text.includes('render')) {
    return 'Booster rendering runs through the embodiment-agnostic pipeline.';
  }
  if (text.includes('spatial randomization') || text.includes('wider taskgen')) {
    return 'TaskGen validates a wider and more uniform initial-position distribution.';
  }
  if (text.includes('dataset') || text.includes('six embodiments')) {
    return 'Dataset generation is validated across multiple robot embodiments.';
  }
  if (text.includes('articulated') || text.includes('cabinet') || text.includes('drawer')) {
    return 'TaskGen produces articulated-object manipulation tasks end to end.';
  }
  if (text.includes('recover') || text.includes('failure')) {
    return 'Recovery data collection starts from failed or near-success states.';
  }
  if (text.includes('booster')) {
    return 'Booster task setup is checked in the web simulation environment.';
  }
  if (text.includes('checker') && text.includes('taskgen')) {
    return 'TaskGen generates checker logic for new manipulation tasks.';
  }
  if (text.includes('checker')) {
    return 'Checker behavior is validated through replayed task attempts.';
  }
  if (text.includes('multi') && text.includes('embodiment')) {
    return 'TaskGen adapts task layouts across multiple robot embodiments.';
  }
  if (text.includes('initial_state') || text.includes('ik') || text.includes('axis arm')) {
    return 'Axis arm teleoperation and initial-state replay are verified in the web task.';
  }
  if (text.includes('attempt') || text.includes('replay')) {
    return 'Attempt replay videos are prepared for production task inspection.';
  }
  if (text.includes('task id') || text.includes('model training') || text.includes('policy')) {
    return 'The data-to-model pipeline trains and evaluates policies from task IDs.';
  }
  if (text.includes('model')) {
    return 'Lightweight policy training is evaluated on selected task data.';
  }
  if (text.includes('random') || text.includes('dagger')) {
    return 'Task randomization resets object and robot states for DAgger-style collection.';
  }
  if (text.includes('webapp') || text.includes('mujoco')) {
    return 'The browser task environment is checked through MuJoCo replay and verification.';
  }
  if (text.includes('taskgen')) {
    return 'TaskGen output is reviewed in the browser-based task environment.';
  }

  const topic = demo.tags[0] || week.period;
  return `Demo reference for the ${topic} work in this weekly report.`;
}

function mediaAlt(media: MediaItem, title: string) {
  return media.alt || title;
}

function MediaAsset({ item, title }: { item: MediaItem; title: string }) {
  if (item.type === 'image' && item.url) {
    return <img src={assetUrl(item.url)} alt={mediaAlt(item, title)} loading="lazy" />;
  }
  if ((item.type === 'video' || isVideoFile(item)) && item.url) {
    return <video src={assetUrl(item.url)} controls muted preload="metadata" />;
  }
  return (
    <a className="fileLink" href={assetUrl(item.url) || '#'} target="_blank" rel="noreferrer">
      {item.originalName || 'Open supporting file'}
    </a>
  );
}

function isVideoFile(item: MediaItem) {
  return /\.(mp4|mov|webm)(?:$|\?)/i.test(item.url || item.originalName || '');
}

function isDocumentImage(demo: DemoItem, media: MediaItem) {
  if (media.type !== 'image') return false;
  if (BLOCKED_MEDIA_IDS.some((id) => (media.url || '').includes(id))) return true;
  const text = contextText(demo);
  const documentTerms = [
    '.tsx',
    'api',
    'bot',
    'codebase',
    'delta_z',
    'discord',
    'failure rate',
    'gettrajectory',
    'success rate',
    'heatmap',
    'layout contribute',
    'overlap',
    'plot',
    's3',
    'samples',
    'checkpoint',
    'subsampled',
    'user id',
    'payload',
    'nonce',
    'residual',
    'snapshot',
    'table',
    'trajectory',
    'field',
    'workspace',
    'analytics'
  ];
  return documentTerms.some((term) => text.includes(term));
}

function isRobotDemoMedia(demo: DemoItem, media: MediaItem) {
  if (ALLOWED_MEDIA_IDS.some((id) => (media.url || '').includes(id))) return true;
  if (isDocumentImage(demo, media)) return false;
  if (media.type === 'video' || isVideoFile(media)) return true;

  const text = contextText(demo);
  const robotTerms = [
    'robot',
    'arm',
    'gripper',
    'teleop',
    'booster',
    'libero',
    'robocasa',
    't1',
    'paper',
    'arxiv',
    'mujoco',
    'taskgen',
    'articulated',
    'embodiment',
    'manipulation',
    'scene',
    'asset',
    'webapp',
    'axis arm',
    'drag'
  ];
  return robotTerms.some((term) => text.includes(term));
}

function visibleDemoEntries(week: WeeklyUpdate) {
  let videoCount = 0;
  let figCount = 0;
  let fileCount = 0;

  return week.demos.flatMap((demo, demoIndex) =>
    demo.media
      .filter((media) => isRobotDemoMedia(demo, media))
      .map((media, mediaIndex) => ({
        demo,
        media,
        title: demoCaption(demo, week),
        key: `${demo.id}-${media.url || mediaIndex}`,
        id: `demo-${week.id}-${demoIndex}-${mediaIndex}`,
        label: media.type === 'image'
          ? `Fig ${++figCount}`
          : (media.type === 'video' || isVideoFile(media))
            ? `Video ${++videoCount}`
            : `File ${++fileCount}`
      }))
  );
}

function referenceMatches(entry: ReturnType<typeof visibleDemoEntries>[number], section: ReportSection) {
  const text = compact(`${entry.title} ${contextText(entry.demo)} ${entry.label}`).toLowerCase();
  return section.references.some((keyword) => text.includes(keyword.toLowerCase()));
}

function sectionReferences(entries: ReturnType<typeof visibleDemoEntries>, section: ReportSection) {
  const related = entries.filter((entry) => referenceMatches(entry, section));
  return related.slice(0, 4);
}

function ReferenceLinks({ entries }: { entries: ReturnType<typeof visibleDemoEntries> }) {
  if (!entries.length) return null;

  return (
    <p className="referenceLinks">
      <span>Reference</span>
      {entries.map((entry) => (
        <a key={entry.id} href={`#${entry.id}`}>{entry.label}</a>
      ))}
    </p>
  );
}

function DemoReel({ entries }: { entries: ReturnType<typeof visibleDemoEntries> }) {
  if (!entries.length) return null;

  return (
    <section className="demoReel" aria-label="Demo references">
      <div className="reelHeading">
        <span>Demo reel</span>
        <em>{entries.length} media assets</em>
      </div>
      <div className="reelGrid">
        {entries.map(({ demo, media, title, key, id, label }) => (
          <figure
            className={`demoReference${media.fit === 'contain' ? ' isContain' : ''}${media.wide ? ' isWide' : ''}`}
            id={id}
            key={key}
          >
            <MediaAsset item={media} title={title} />
            <figcaption>
              <span className="demoLabel">{label}</span>
              <strong>{title}</strong>
              <span>{fmtDate(demo.date)}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function WeekNav({ weeks }: { weeks: WeeklyUpdate[] }) {
  return (
    <nav className="weekNav" aria-label="Weekly report navigation">
      <a className="weekNavBlog" href={assetUrl('/tech-blog')}>
        <strong>Tech Blog</strong>
        <em>Research notes →</em>
      </a>
      <span>Timeline</span>
      {weeks.map((week) => (
        <a key={week.id} href={`#week-${week.id}`}>
          <strong>{week.startDate.slice(5).replace('-', '/')}</strong>
          <em>{week.endDate.slice(5).replace('-', '/')}</em>
        </a>
      ))}
    </nav>
  );
}

function WeeklyReport({ week, index }: { week: WeeklyUpdate; index: number }) {
  const sections = reportSections(week);
  const demoEntries = visibleDemoEntries(week);

  return (
    <article className="report" id={`week-${week.id}`}>
      <aside className="reportMeta">
        <span className="reportNumber">{String(index + 1).padStart(2, '0')}</span>
        <span>{fmtRange(week)}</span>
      </aside>
      <div className="reportContent">
        <p className="eyebrow">Weekly report</p>
        <h2>{reportTitle(week)}</h2>
        <p className="reportLead">{reportLead(week)}</p>

        {sections.length > 0 && (
          <div className="reportSections">
            {sections.map((section) => (
              <section className="reportSection" key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
                <ReferenceLinks entries={sectionReferences(demoEntries, section)} />
                {section.links && (
                  <p className="reportExternalLinks">
                    {section.links.map((link) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                        {link.label} ↗
                      </a>
                    ))}
                  </p>
                )}
              </section>
            ))}
          </div>
        )}

        <DemoReel entries={demoEntries} />
      </div>
    </article>
  );
}

function TechBlog() {
  return (
    <section id="tech-blog" className="techBlog">
      <div className="techBlogHeader">
        <p className="eyebrow">{TECH_BLOG_POST.eyebrow}</p>
        <h2>{TECH_BLOG_POST.title}</h2>
        <p>{TECH_BLOG_POST.subtitle}</p>
      </div>

      <div className="techBlogThesis">
        <span>Thesis</span>
        <p>{TECH_BLOG_POST.thesis}</p>
      </div>

      <article className="techBlogBody">
        {TECH_BLOG_POST.sections.map((section) => (
          <section className="techBlogSection" key={section.title}>
            <h3>{section.title}</h3>
            {section.body.map((block) => {
              if (block.startsWith('FORMULA:')) {
                return <div className="techBlogFormula" key={block}>{block.slice(8)}</div>;
              }
              if (block.startsWith('QUOTE:')) {
                return <blockquote key={block}>{block.slice(6)}</blockquote>;
              }
              if (block.startsWith('BULLET:')) {
                return <p className="techBlogBullet" key={block}>{block.slice(7)}</p>;
              }
              return <p key={block}>{block}</p>;
            })}
          </section>
        ))}
      </article>

      <div className="techBlogReferences">
        <span>References</span>
        {TECH_BLOG_POST.references.map((reference) => (
          <a key={reference.href} href={reference.href} target="_blank" rel="noreferrer">
            {reference.label}
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const weeklyUpdates = [...data.weeklyUpdates].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const allTags = Array.from(new Set(weeklyUpdates.flatMap((w) => w.demos.flatMap((d) => d.tags)))).slice(0, 16);
  const latestWeek = weeklyUpdates[0];
  const latestSections = latestWeek ? reportSections(latestWeek).slice(0, 4) : [];

  return (
    <main>
      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">Axis Robotics · Weekly Update Report</p>
          <h1>Axis Robotics Team Weekly Progress</h1>
          <p className="heroLead">
            A concise technical digest of the robotics team&apos;s recent work, organized by weekly milestones and paired with demo references. The report is designed for readers who need to understand what changed, why it matters, and where the supporting robot demonstrations can be reviewed.
          </p>
          <div className="heroActions">
            <a href="#reports">Read reports</a>
            <a href={assetUrl('/tech-blog')}>Tech blog</a>
            <a href={data.sources.weeklyRoot} className="ghost" target="_blank" rel="noreferrer">View update archive</a>
          </div>
        </div>
        <div className="focusPanel">
          <p className="eyebrow">Latest cycle</p>
          <strong>{fmtDate(latestWeek?.endDate || data.stats.lastUpdate)}</strong>
          <span>{latestWeek ? fmtRange(latestWeek) : 'Latest robotics update'}</span>
          <div className="focusList">
            <p>This week&apos;s focus</p>
            {latestSections.map((section) => (
              <a key={section.title} href={`#week-${latestWeek?.id}`}>{section.title}</a>
            ))}
          </div>
        </div>
      </section>

      <section className="tagCloud" aria-label="topics">
        <span>Topics</span>
        {allTags.map((tag) => <span key={tag}>{tag}</span>)}
        <span className="generated">Updated {new Date(data.generatedAt).toLocaleString()}</span>
      </section>

      <div className="contentShell">
        <WeekNav weeks={weeklyUpdates} />
        <section id="reports" className="reports">
          {weeklyUpdates.map((week, index) => (
            <WeeklyReport key={week.id} week={week} index={index} />
          ))}
        </section>
      </div>
    </main>
  );
}
