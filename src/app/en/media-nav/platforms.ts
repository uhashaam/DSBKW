export type PlatformItem = {
  name: string;
  type: string;
  desc: string;
  users: string;
  url: string;
  /**
   * Optional local icon image path under `public/`.
   * Example: `/media-nav/wechat.png`
   */
  icon?: string;
};

export type PlatformSection = {
  id: "social" | "video" | "article" | "audio";
  title: string;
  items: PlatformItem[];
};

export const sections: PlatformSection[] = [
  {
    id: "social",
    title: "Social Platforms",
    items: [
      {
        name: "WeChat Official Accounts",
        type: "Articles",
        desc: "One of China’s largest social platforms. Official Accounts are great for in-depth content, broad reach, subscriptions, engagement, and monetization.",
        users: "Users: 1.2B+",
        url: "https://mp.weixin.qq.com/",
      },
      {
        name: "Weibo",
        type: "Short posts",
        desc: "A highly influential social network in China, ideal for trends and fast distribution with strong interaction and rapid information spread.",
        users: "Users: 580M+",
        url: "https://weibo.com/signup/signup.php",
      },
      {
        name: "QQ Zone",
        type: "General",
        desc: "A Tencent social platform popular among younger users. Suitable for sharing life updates, photos, and posts with strong social interactions.",
        users: "Users: 570M+",
        url: "https://qzone.qq.com/",
      },
      {
        name: "Xiaohongshu (RED)",
        type: "Lifestyle",
        desc: "A lifestyle community and consumption decision platform, popular among young users, great for beauty, fashion, and lifestyle sharing.",
        users: "MAU: 200M+",
        url: "https://creator.xiaohongshu.com/",
      },
      {
        name: "Douban",
        type: "Culture",
        desc: "One of China’s largest culture communities, ideal for book, movie, and music reviews and other culture-focused content.",
        users: "MAU: 80M+",
        url: "https://www.douban.com/",
      },
      {
        name: "Zhihu",
        type: "Q&A",
        desc: "A high-quality Chinese Q&A community and original content platform, great for deep and professional knowledge sharing.",
        users: "MAU: 100M+",
        url: "https://www.zhihu.com/signup",
      },
    ],
  },
  {
    id: "video",
    title: "Video Platforms",
    items: [
      {
        name: "Douyin",
        type: "Short video",
        desc: "China’s most popular short-video platform, great for creative content and brand marketing with massive reach and strong viral potential.",
        users: "DAU: 600M+",
        url: "https://creator.douyin.com/",
      },
      {
        name: "Bilibili",
        type: "Long video",
        desc: "A comprehensive video community popular among young users, ideal for knowledge, creative, and ACG content with high engagement.",
        users: "MAU: 290M+",
        url: "https://member.bilibili.com/platform/upload/video/frame",
      },
      {
        name: "Xigua Video",
        type: "Mid-form video",
        desc: "ByteDance’s mid-form video platform, suitable for long-form creation with integrated traffic across Douyin and Toutiao.",
        users: "MAU: 300M+",
        url: "https://studio.ixigua.com/",
      },
      {
        name: "Kuaishou",
        type: "Short video",
        desc: "A leading short-video platform with a broad user base and strong community vibe, great for everyday-life content and sharing.",
        users: "DAU: 300M+",
        url: "https://creator.kuaishou.com/",
      },
      {
        name: "iQIYI Creator",
        type: "Long video",
        desc: "A major long-video platform suitable for film, variety, and documentary content with a large user base and quality traffic.",
        users: "MAU: 500M+",
        url: "https://creator.iqiyi.com/",
      },
      {
        name: "Tencent Video",
        type: "Long video",
        desc: "One of China’s largest online video platforms, backed by Tencent’s ecosystem with abundant traffic resources for quality long-form content.",
        users: "MAU: 600M+",
        url: "https://v.qq.com/x/partner/",
      },
    ],
  },
  {
    id: "article",
    title: "Article Platforms",
    items: [
      {
        name: "Zhihu",
        type: "Q&A",
        desc: "A high-quality Chinese Q&A community and original content platform, great for deep and professional knowledge sharing.",
        users: "MAU: 100M+",
        url: "https://www.zhihu.com/signup",
      },
      {
        name: "Baijiahao",
        type: "General",
        desc: "Baidu’s content creation platform. Great for knowledge and news content with Baidu Search traffic support and multiple monetization paths.",
        users: "MAU: 200M+",
        url: "https://baijiahao.baidu.com/",
      },
      {
        name: "Toutiao Account",
        type: "News",
        desc: "ByteDance’s general content platform with a powerful recommendation algorithm and huge traffic, suitable for many content types.",
        users: "DAU: 120M+",
        url: "https://mp.toutiao.com/",
      },
      {
        name: "Dayuhao",
        type: "General",
        desc: "Alibaba’s creator platform integrated with Youku, Tudou, and UC, suitable for both video and article creation with strong traffic resources.",
        users: "MAU: 250M+",
        url: "https://mp.dayu.com/",
      },
      {
        name: "Sohu Account",
        type: "News",
        desc: "Sohu’s self-media platform for news and in-depth reporting with high authority and strong media influence.",
        users: "MAU: 150M+",
        url: "https://mp.sohu.com/",
      },
      {
        name: "Penguin Account",
        type: "General",
        desc: "Tencent’s open content platform integrated with WeChat, QQ, and Tencent News, offering rich traffic for various content types.",
        users: "MAU: 800M+",
        url: "https://om.qq.com/",
      },
    ],
  },
  {
    id: "audio",
    title: "Audio Platforms",
    items: [
      {
        name: "Ximalaya",
        type: "Audio",
        desc: "A leading audio sharing platform in China, suitable for audiobooks, radio dramas, and knowledge lectures with a broad audience.",
        users: "MAU: 220M+",
        url: "https://www.ximalaya.com/creator/",
      },
      {
        name: "Qingting FM",
        type: "Radio",
        desc: "A comprehensive audio platform focused on radio and spoken content, suitable for news, stories, and emotion-themed programs.",
        users: "MAU: 100M+",
        url: "https://www.qingting.fm/creator/",
      },
      {
        name: "NetEase Cloud Music",
        type: "Music",
        desc: "A music platform centered on discovery and sharing, suitable for music creation, playlists, and music storytelling among young users.",
        users: "MAU: 180M+",
        url: "https://music.163.com/creator/#/apply",
      },
      {
        name: "Lizhi FM",
        type: "Podcast",
        desc: "A UGC podcast-focused platform suitable for personal radio and podcast creation with active interactions and a young audience.",
        users: "MAU: 50M+",
        url: "https://www.lizhi.fm/creator/",
      },
      {
        name: "Penguin FM",
        type: "Audio",
        desc: "Tencent’s audio platform backed by its ecosystem, suitable for various audio content types with strong traffic resources.",
        users: "MAU: 80M+",
        url: "https://fm.qq.com/",
      },
      {
        name: "Lazy Audio (Lanren Tingshu)",
        type: "Audiobooks",
        desc: "An audiobook-focused platform suitable for novels, storytelling, and history content for users who enjoy listening.",
        users: "MAU: 60M+",
        url: "https://www.lrts.me/",
      },
    ],
  },
];
