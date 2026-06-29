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
};

const WEEK_COPY: Record<string, { lead: string; sections: ReportSection[] }> = {
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

  if (text.includes('drag') || text.includes('pre-grasp') || text.includes('teleop')) {
    return 'Teleoperation is tested with smoother gripper control and replay-safe motion.';
  }
  if (text.includes('triple camera')) {
    return 'Booster teleoperation is shown with the updated multi-camera setup.';
  }
  if (text.includes('booster') && text.includes('render')) {
    return 'Booster rendering runs through the embodiment-agnostic pipeline.';
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
  if (isDocumentImage(demo, media)) return false;
  if (media.type === 'video' || isVideoFile(media)) return true;

  const text = contextText(demo);
  const robotTerms = [
    'robot',
    'arm',
    'gripper',
    'teleop',
    'booster',
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
          <figure className="demoReference" id={id} key={key}>
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
              </section>
            ))}
          </div>
        )}

        <DemoReel entries={demoEntries} />
      </div>
    </article>
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
            <a href={data.sources.weeklyRoot} className="ghost" target="_blank" rel="noreferrer">View update archive</a>
          </div>
        </div>
        <div className="focusPanel">
          <p className="eyebrow">Latest cycle</p>
          <strong>{fmtDate(latestWeek?.startDate || data.stats.lastUpdate)}</strong>
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
