export type MediaItem = {
  type: 'image' | 'video' | 'file';
  url?: string;
  alt?: string;
  originalName?: string;
  notionBlockId?: string;
};

export type DemoItem = {
  id: string;
  date: string;
  weekId: string;
  owner: 'Mengfei' | 'Yikai' | 'Weekly';
  title: string;
  caption: string;
  tags: string[];
  media: MediaItem[];
  sourceUrl: string;
};

export type WeeklyUpdate = {
  id: string;
  title: string;
  period: string;
  startDate: string;
  endDate: string;
  sourceUrl: string;
  summary: string[];
  demos: DemoItem[];
};

export type SiteData = {
  generatedAt: string;
  sources: Record<string, string>;
  stats: {
    weeklyUpdates: number;
    demoItems: number;
    mediaItems: number;
    lastUpdate: string;
  };
  weeklyUpdates: WeeklyUpdate[];
};
