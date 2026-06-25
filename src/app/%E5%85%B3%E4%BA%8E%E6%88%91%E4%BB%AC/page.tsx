"use client";

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string;
}

export default function ContactCN() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: "网站上有哪些类型的工具?",
      a: "该网站提供了广泛的电子商务工具，包括外贸必备工具、设计媒体工具、支付方式工具、搜索引擎工具、B2B平台工具，以及针对京东、拼多多、淘宝和天猫等特定平台的工具。"
    },
    {
      q: "网站上有哪些热门工具?",
      a: "一些常见的热门工具包括超级店长、蚁小二、店长铺货、抖店工具箱、易分单、尚讯拍单、速打、点三ERP和领羊交易等。"
    },
    {
      q: "网站上提供哪些营销和推广工具?",
      a: "网站提供了内容分发和推广工具，如达库全球软文、助手分销代发、Shopchup、摩小智SCRM和视采客一站式视频营销系统。"
    },
    {
      q: "网站上有数据分析和店铺管理工具吗?",
      a: "是的，网站提供了数据分析和店铺管理工具，包括探索旺、店铺汇达、精品库、有店多、淘淘易通和京云助手等。"
    },
    {
      q: "如何访问或使用网站上的工具?",
      a: "网站提供了各种工具的链接和简要描述，用户可以直接点击前往对应工具官方网站进行注册、订购或使用。"
    },
    {
      q: "网站除了工具列表还提供其他信息或资源吗?",
      a: "除了丰富齐备的电商工具网格导航，网站还在不断更新京东、淘宝天猫、拼多多以及跨境电商、直播带货等维度的海量前沿行业资讯和百科知识。"
    },
    {
      q: "网站有联系方式或支持服务吗?",
      a: "如果有好的工具/系统想要入驻展示、或者进行品牌推广与SEO软文发布，可以直接联系微信：18930311251 与我们进行商务沟通。"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-orange-600">首页</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">商务合作</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-10 flex flex-col justify-center space-y-4">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full self-start">关于我们</span>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              一站式电商解决方案
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              在电商百科网(dsbkw.com)，我们的使命是为在线企业和企业家提供知识、工具和策略，帮助他们在数字市场上取得成功。作为电子商务行业的领先资源，我们提供全面的导航和行业洞见。
            </p>
            <div className="pt-2">
              <p className="text-sm font-bold text-slate-900">商务合作联系方式：</p>
              <span className="inline-block bg-orange-600/10 text-orange-600 border border-orange-600/20 px-4 py-2 rounded-lg text-sm font-bold mt-2">
                微信 (WeChat)：18930311251
              </span>
            </div>
          </div>
          <div className="relative aspect-[16/10] md:aspect-auto bg-slate-100">
            <img
              src="/wp-content/uploads/2024/08/cross-boder_ecommerce_ft_image-1024x576.jpg"
              alt="E-commerce Solutions"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3">我们的使命</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              策划和提供最相关、最新的电子商务趋势、运营策略和软件解决方案信息，赋能商家和用户做出明智的决策，将他们的在线业务推向新的高度。
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3">我们的愿景</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              成为广大电商从业者的可信赖伙伴。通过专业的行业导航、实战分析和工具最佳实践，指导商家在多变的市场中实现可持续增长。
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">需要帮助吗？</h2>
            <p className="text-sm text-gray-500">常见问题解答</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="transition-all">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 hover:text-orange-600 hover:bg-orange-50/20 transition-all cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-600' : 'text-gray-400'}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="p-5 bg-slate-50/50 text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
