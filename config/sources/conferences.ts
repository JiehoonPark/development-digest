import type { Source } from "./types.js";

export const conferences: Source[] = [
  {
    id: "conf-feconf",
    name: "FEConf",
    type: "youtube",
    category: "conference",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCWEzfYIpFBIG5jh6laXC6hA",
    channelId: "UCWEzfYIpFBIG5jh6laXC6hA",
    weight: 8,
    language: "ko",
  },
  {
    id: "conf-jsconf",
    name: "JSConf",
    type: "youtube",
    category: "conference",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCzoVCacndDCfGDf41P-z0iA",
    channelId: "UCzoVCacndDCfGDf41P-z0iA",
    weight: 7,
    language: "en",
  },
  {
    id: "conf-reactconf",
    name: "React Conf",
    type: "youtube",
    category: "conference",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCFbNIlppjAuEX4znoulh0Cw",
    channelId: "UCFbNIlppjAuEX4znoulh0Cw",
    weight: 9,
    language: "en",
  },
  {
    id: "conf-nextjs-conf",
    name: "Next.js Conf",
    type: "youtube",
    category: "conference",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UC3I4FeSKjqBMKjgZ3JTAuZA",
    channelId: "UC3I4FeSKjqBMKjgZ3JTAuZA",
    weight: 8,
    language: "en",
  },
];
