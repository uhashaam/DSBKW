"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isEn = pathname ? pathname.startsWith('/en') : false;

  const t = {
    aboutTitle: isEn ? "About Us" : "关于我们",
    aboutDesc: isEn
      ? "E-Commerce Encyclopedia (dsbkw.com) is committed to building a comprehensive, professional, and convenient one-stop service and communication platform for online entrepreneurs. We aggregate massive e-commerce knowledge, industry information, and cutting-edge software strategies."
      : "电商百科网（dsbkw.com）致力于打造一个全面、专业、便捷的一站式电商服务与交流平台。我们汇聚了海量的电商知识、行业资讯、实战经验和前沿技术。",
    joinTitle: isEn ? "Join Us" : "商务合作",
    joinDesc: isEn
      ? "Scan WeChat or contact us directly to explore ads placement, brand promotions, and software listings."
      : "如果您有好的工具、系统想要入驻或发布软文推广，请添加微信与我们取得联系，获取最新动态及推广资源。",
    wechat: isEn ? "WeChat ID: 18930311251" : "合作微信：18930311251",
    partnerTitle: isEn ? "Partners" : "合作伙伴",
    copyright: isEn
      ? "© 2026 E-Commerce Encyclopedia. All Rights Reserved."
      : "© 2026 电商百科网 版权所有. 沪ICP备2021029281号",
  };

  return (
    <footer className="border-t bg-slate-900 text-slate-400 mt-16 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-white text-base mb-4 tracking-wide">{t.aboutTitle}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.aboutDesc}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-white text-base mb-4 tracking-wide">{t.joinTitle}</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            {t.joinDesc}
          </p>
          <span className="inline-block bg-orange-600/10 text-orange-400 border border-orange-600/35 px-3 py-1 rounded text-xs font-semibold">
            {t.wechat}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-white text-base mb-4 tracking-wide">{t.partnerTitle}</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-orange-500/25 transition-all">
              点三ERP
            </div>
            <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-orange-500/25 transition-all">
              蚁小二
            </div>
            <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-orange-500/25 transition-all">
              超级店长
            </div>
            <div className="h-10 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-400 hover:text-white border border-slate-700/50 hover:border-orange-500/25 transition-all">
              达库软文
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>{t.copyright}</p>
      </div>
    </footer>
  );
}
