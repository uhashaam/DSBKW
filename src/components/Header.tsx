"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check if we are in the English section
  const isEn = pathname ? pathname.startsWith('/en') : false;

  // Sync menu translation
  const t = {
    home: isEn ? 'Home' : '首页',
    tools: isEn ? 'Tools' : '工具大全',
    com: isEn ? 'Global Trade Tools' : '外贸必备工具',
    social: isEn ? 'Design Media' : '国外设计媒体',
    payment: isEn ? 'Payment Methods' : '收付款方式',
    search: isEn ? 'Search Engines' : '搜索引擎',
    b2b: isEn ? 'B2B Platforms' : 'B2B平台',
    jd: isEn ? 'Jingdong' : '京东',
    pdd: isEn ? 'Pinduoduo' : '拼多多',
    taobao: isEn ? 'Taobao Tmall' : '淘宝天猫',
    news: isEn ? 'E-Commerce News' : '电商资讯',
    live: isEn ? 'Live Streaming' : '直播带货',
    crossBorder: isEn ? 'Cross-Border' : '跨境电商',
    wiki: isEn ? 'Wiki' : '电商百科',
    navigation: isEn ? 'Media Nav' : '自媒体导航',
    contact: isEn ? 'Contact Us' : '商务合作',
  };

  // Toggle Language Handler
  const toggleLanguage = () => {
    if (!pathname) return;

    if (pathname.includes('/admin')) {
      return;
    }

    if (isEn) {
      // Switch to Chinese
      let newPath = pathname.replace(/^\/en/, '');
      if (newPath === '/media-nav' || newPath === '/media-nav/') {
        newPath = '/自媒体导航/';
      }
      if (newPath === '/contact' || newPath === '/contact/') {
        newPath = '/关于我们/';
      }
      if (!newPath) newPath = '/';
      router.push(newPath);
    } else {
      // Switch to English
      let newPath = pathname;
      if (pathname === '/' || pathname === '') {
        newPath = '/en/';
      } else if (pathname === '/自媒体导航' || pathname === '/自媒体导航/') {
        newPath = '/en/media-nav/';
      } else if (pathname === '/关于我们' || pathname === '/关于我们/') {
        newPath = '/en/contact/';
      } else {
        newPath = `/en${pathname}`;
      }
      router.push(newPath);
    }
  };

  // Generate localized link helper
  const localLink = (path: string) => {
    if (isEn) {
      if (path === '/') return '/en/';
      return `/en${path}`;
    }
    if (path === '/contact/') return '/关于我们/';
    return path;
  };

  const mediaNavHref = isEn ? "/en/media-nav/" : "/自媒体导航/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href={isEn ? '/en/' : '/'} className="flex items-center space-x-2 shrink-0">
          <img
            src="/wp-content/uploads/2024/08/20240813-161115.png"
            alt={isEn ? "E-Commerce Encyclopedia" : "电商百科网"}
            className="h-8 md:h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex gap-5 items-center">
          <Link href={localLink('/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.home}
          </Link>
          
          {/* Dropdown menu */}
          <div 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors py-2 cursor-pointer">
              {t.tools}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            
            {dropdownOpen && (
              <div className="absolute left-0 top-full w-48 bg-white shadow-xl border border-gray-100 rounded-lg mt-0 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Main site uses top-level posts for these tool pages (not category archives) */}
                <Link href={localLink('/com/')} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">{t.com}</Link>
                <Link href={localLink('/social/')} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">{t.social}</Link>
                <Link href={localLink('/bridge/')} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">{t.payment}</Link>
                <Link href={localLink('/search/')} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">{t.search}</Link>
                <Link href={localLink('/b2b/')} className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all">{t.b2b}</Link>
              </div>
            )}
          </div>

          <Link href={localLink('/category/jingdong/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.jd}
          </Link>
          <Link href={localLink('/category/pdd/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.pdd}
          </Link>
          <Link href={localLink('/category/taobao/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.taobao}
          </Link>
          <Link href={localLink('/category/ask/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.news}
          </Link>
          <Link href={localLink('/category/video/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.live}
          </Link>
          <Link href={localLink('/category/bridge/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.crossBorder}
          </Link>
          <Link href={localLink('/category/baike/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.wiki}
          </Link>
          <Link href={mediaNavHref} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.navigation}
          </Link>
          <Link href={localLink('/contact/')} className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors">
            {t.contact}
          </Link>
        </nav>

        {/* Right tools (Lang Switcher, etc) */}
        <div className="flex items-center space-x-3">
          {/* Language toggle button */}
          {!pathname?.includes('/admin') && (
            <button
              onClick={toggleLanguage}
              className="flex items-center text-xs font-bold text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-200 bg-gray-50/50 hover:bg-orange-50 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {isEn ? '中文简体' : 'English'}
            </button>
          )}

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden text-gray-600 hover:text-orange-600 p-1 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t p-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <Link href={localLink('/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.home}</Link>
          
          <div className="border-l-2 border-orange-500 pl-3 py-1 space-y-1 my-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.tools}</p>
            <Link href={localLink('/com/')} onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-xs text-gray-600 hover:text-orange-600">{t.com}</Link>
            <Link href={localLink('/social/')} onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-xs text-gray-600 hover:text-orange-600">{t.social}</Link>
            <Link href={localLink('/bridge/')} onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-xs text-gray-600 hover:text-orange-600">{t.payment}</Link>
            <Link href={localLink('/search/')} onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-xs text-gray-600 hover:text-orange-600">{t.search}</Link>
            <Link href={localLink('/b2b/')} onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-xs text-gray-600 hover:text-orange-600">{t.b2b}</Link>
          </div>

          <Link href={localLink('/category/jingdong/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.jd}</Link>
          <Link href={localLink('/category/pdd/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.pdd}</Link>
          <Link href={localLink('/category/taobao/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.taobao}</Link>
          <Link href={localLink('/category/ask/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.news}</Link>
          <Link href={localLink('/category/video/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.live}</Link>
          <Link href={localLink('/category/bridge/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.crossBorder}</Link>
          <Link href={localLink('/category/baike/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.wiki}</Link>
          <Link href={mediaNavHref} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.navigation}</Link>
          <Link href={localLink('/contact/')} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded hover:bg-gray-50 text-sm font-semibold text-gray-700">{t.contact}</Link>
        </div>
      )}

    </header>
  );
}
