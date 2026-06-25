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
    title: "社交平台",
    items: [
      {
        name: "微信公众号",
        type: "图文",
        desc: "国内最大的社交平台之一，公众号适合深度内容创作，用户群体覆盖广泛，可实现内容推送、互动交流及商业变现。",
        users: "用户量：12亿+",
        url: "https://mp.weixin.qq.com/",
      },
      {
        name: "微博",
        type: "短内容",
        desc: "中国最具影响力的社交媒体之一，适合热点追踪和快速传播，信息传播速度快，互动性强。",
        users: "用户量：5.8亿+",
        url: "https://weibo.com/signup/signup.php",
      },
      {
        name: "QQ空间",
        type: "综合",
        desc: "腾讯旗下的社交平台，用户以年轻群体为主，适合分享生活、照片和日志，具有较强的社交互动功能。",
        users: "用户量：5.7亿+",
        url: "https://qzone.qq.com/",
      },
      {
        name: "小红书",
        type: "种草",
        desc: "生活方式平台和消费决策入口，用户以年轻女性为主，适合美妆、时尚、生活方式等内容分享。",
        users: "月活：2亿+",
        url: "https://creator.xiaohongshu.com/",
      },
      {
        name: "豆瓣",
        type: "文艺",
        desc: "中国最大的文化社区之一，用户以文艺青年为主，适合书评、影评、乐评等内容创作和分享。",
        users: "月活：8000万+",
        url: "https://www.douban.com/",
      },
      {
        name: "知乎",
        type: "问答",
        desc: "中文互联网高质量问答社区和创作者聚集的原创内容平台，适合深度内容和专业知识分享。",
        users: "月活：1亿+",
        url: "https://www.zhihu.com/signup",
      },
    ],
  },
  {
    id: "video",
    title: "视频平台",
    items: [
      {
        name: "抖音",
        type: "短视频",
        desc: "国内最火爆的短视频平台，适合创意内容和品牌推广，用户群体年轻化，传播力极强。",
        users: "日活：6亿+",
        url: "https://creator.douyin.com/",
      },
      {
        name: "哔哩哔哩",
        type: "长视频",
        desc: "年轻人聚集的综合性视频社区，适合知识类、二次元及创意内容，用户粘性高，互动性强。",
        users: "月活：2.9亿+",
        url: "https://member.bilibili.com/platform/upload/video/frame",
      },
      {
        name: "西瓜视频",
        type: "中视频",
        desc: "字节跳动旗下的中视频平台，适合长内容创作，与抖音、今日头条形成流量矩阵，收益模式多样。",
        users: "月活：3亿+",
        url: "https://studio.ixigua.com/",
      },
      {
        name: "快手",
        type: "短视频",
        desc: "国内领先的短视频平台，用户群体广泛，内容风格贴近生活，社区氛围浓厚，适合记录和分享日常。",
        users: "日活：3亿+",
        url: "https://creator.kuaishou.com/",
      },
      {
        name: "爱奇艺号",
        type: "长视频",
        desc: "中国领先的长视频平台，适合影视、综艺、纪录片等内容创作，拥有庞大的用户基数和优质的流量资源。",
        users: "月活：5亿+",
        url: "https://creator.iqiyi.com/",
      },
      {
        name: "腾讯视频",
        type: "长视频",
        desc: "中国最大的在线视频平台之一，适合高质量长视频内容创作，背靠腾讯生态，流量资源丰富。",
        users: "月活：6亿+",
        url: "https://v.qq.com/x/partner/",
      },
    ],
  },
  {
    id: "article",
    title: "文章平台",
    items: [
      {
        name: "知乎",
        type: "问答",
        desc: "中文互联网高质量问答社区和创作者聚集的原创内容平台，适合深度内容和专业知识分享。",
        users: "月活：1亿+",
        url: "https://www.zhihu.com/signup",
      },
      {
        name: "百家号",
        type: "综合",
        desc: "百度旗下的内容创作平台，适合知识类、资讯类内容，可获得百度搜索流量支持，收益模式多样。",
        users: "月活：2亿+",
        url: "https://baijiahao.baidu.com/",
      },
      {
        name: "头条号",
        type: "资讯",
        desc: "字节跳动旗下的综合性内容平台，适合各类内容创作，推荐算法精准，流量庞大。",
        users: "日活：1.2亿+",
        url: "https://mp.toutiao.com/",
      },
      {
        name: "大鱼号",
        type: "综合",
        desc: "阿里巴巴旗下的内容创作平台，与优酷、土豆、UC等平台打通，适合视频和图文内容创作，流量资源丰富。",
        users: "月活：2.5亿+",
        url: "https://mp.dayu.com/",
      },
      {
        name: "搜狐号",
        type: "资讯",
        desc: "搜狐旗下的自媒体平台，适合新闻资讯、深度报道等内容创作，具有较高的权威性和媒体影响力。",
        users: "月活：1.5亿+",
        url: "https://mp.sohu.com/",
      },
      {
        name: "企鹅号",
        type: "综合",
        desc: "腾讯旗下的内容开放平台，与微信、QQ、腾讯新闻等平台打通，适合各类内容创作，流量资源丰富。",
        users: "月活：8亿+",
        url: "https://om.qq.com/",
      },
    ],
  },
  {
    id: "audio",
    title: "音频平台",
    items: [
      {
        name: "喜马拉雅",
        type: "音频",
        desc: "中国领先的音频分享平台，适合有声书、广播剧、知识讲座等内容创作，用户群体广泛。",
        users: "月活：2.2亿+",
        url: "https://www.ximalaya.com/creator/",
      },
      {
        name: "蜻蜓FM",
        type: "广播",
        desc: "综合性音频平台，以广播和有声内容为主，适合新闻资讯、情感故事等内容创作。",
        users: "月活：1亿+",
        url: "https://www.qingting.fm/creator/",
      },
      {
        name: "网易云音乐",
        type: "音乐",
        desc: "专注于发现与分享的音乐平台，适合音乐创作、歌单推荐和音乐故事分享，用户以年轻人为主。",
        users: "月活：1.8亿+",
        url: "https://music.163.com/creator/#/apply",
      },
      {
        name: "荔枝FM",
        type: "播客",
        desc: "以UGC播客内容为主的平台，适合个人电台、播客等内容创作，用户以年轻群体为主，互动性强。",
        users: "月活：5000万+",
        url: "https://www.lizhi.fm/creator/",
      },
      {
        name: "企鹅FM",
        type: "音频",
        desc: "腾讯旗下的音频平台，背靠腾讯生态，适合各类音频内容创作，拥有庞大的用户基数和流量资源。",
        users: "月活：8000万+",
        url: "https://fm.qq.com/",
      },
      {
        name: "懒人听书",
        type: "有声书",
        desc: "专注于有声读物的平台，适合小说、评书、历史等有声内容创作，用户以喜爱听书的人群为主。",
        users: "月活：6000万+",
        url: "https://www.lrts.me/",
      },
    ],
  },
];
