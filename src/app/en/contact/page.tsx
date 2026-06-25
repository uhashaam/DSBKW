"use client";

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string;
}

export default function ContactEN() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: "What types of tools are available on the website?",
      a: "The website provides a wide range of e-commerce tools, including global trade essential tools, design and media utilities, payment methods, search engine optimizations, B2B platforms, and platform-specific helpers for Jingdong, Pinduoduo, Taobao, and Tmall."
    },
    {
      q: "What are the most popular tools listed?",
      a: "Some of the popular tools include Super Shopkeeper, Yi Xiao Er, Shopkeeper Listing, Doudian Toolbox, Yi Fen Dan, Shangxun Order, Su Da, Diansan ERP, and Lingyang Deal."
    },
    {
      q: "Are there marketing and PR promotion tools?",
      a: "Yes, we feature content distribution and marketing systems such as Daku Global PR, Assistant Dropshipping, Shopchup, SCRM integrations, and video collection automation systems."
    },
    {
      q: "Does the website support store management and data analysis?",
      a: "Yes, the platform references professional analytics and management tools, including Tanwang, Dianpuhui, Jingpin库, Youdianduo, Taotao Yitong, and Jingyun Assistant."
    },
    {
      q: "How do I access or purchase tools from the directory?",
      a: "The directory provides outbound links and summary descriptions for each tool. Users can directly click the link to visit the respective official websites to register, order, or use them."
    },
    {
      q: "Does the website offer other resources besides tools?",
      a: "Beyond the tools grid, we constantly publish valuable e-commerce knowledge bases, encyclopedia entries, and industry news updates for both domestic platforms and global cross-border trade."
    },
    {
      q: "How can I contact the site administrator for ads or listing?",
      a: "For advertisement placement, brand promotions, soft content release, or adding your tool/system to the grid, you can directly connect with us via WeChat ID: 18930311251."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <Link href="/en/" className="hover:text-orange-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Business Cooperation</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-10 flex flex-col justify-center space-y-4">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full self-start">About Us</span>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              One-stop E-Commerce Solutions
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              At E-Commerce Encyclopedia (dsbkw.com), our mission is to empower online businesses and entrepreneurs with the knowledge, tools, and strategies necessary to succeed in digital marketplaces. We provide comprehensive navigation, reviews, and industry insights.
            </p>
            <div className="pt-2">
              <p className="text-sm font-bold text-slate-900">Business Contact Info:</p>
              <span className="inline-block bg-orange-600/10 text-orange-600 border border-orange-600/20 px-4 py-2 rounded-lg text-sm font-bold mt-2 font-mono">
                WeChat: 18930311251
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
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3">Our Mission</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              To curate and distribute the most relevant and up-to-date e-commerce trends, operational tactics, and software directory listings, empowering business owners to scale their online presence.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-slate-900 border-l-4 border-orange-500 pl-3">Our Vision</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              To be the trusted advisor and partner for digital merchants. We support sustainable growth through professional tool guides, strategic insights, and best practices.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Need Any Help?</h2>
            <p className="text-sm text-gray-500">Frequently Asked Questions</p>
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
