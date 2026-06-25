"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { isAdminAuthed } from "@/lib/adminAuth";

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full bg-slate-50 border rounded-lg flex items-center justify-center text-slate-400 text-sm">
      Loading editor...
    </div>
  ),
});
import 'react-quill-new/dist/quill.snow.css';

// Interfaces mapping src/lib/data.ts
interface SEOData {
  focusKeyword?: string;
  focusKeyword_en?: string;
  seoTitle?: string;
  seoTitle_en?: string;
  seoDescription?: string;
  seoDescription_en?: string;
  canonical?: string;
  robots?: string;
  schemaType?: 'Article' | 'FAQ' | 'None';
}

interface Article {
  slug: string;
  title: string;
  categories: string[];
  featuredImage: string | null;
  publishedTime: string | null;
  content: string;
  slug_en?: string;
  title_en?: string;
  categories_en?: string[];
  content_en?: string;
  seo?: SEOData;
}

interface ToolItem {
  id: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  url: string;
  icon: string;
  rating: number;
  users_zh: string;
  users_en: string;
  banner?: string;
}

interface ToolCategory {
  id: string;
  title_zh: string;
  title_en: string;
  tools: ToolItem[];
}

interface SiteSettings {
  siteName_zh: string;
  siteName_en: string;
  siteDescription_zh: string;
  siteDescription_en: string;
  seo_separator: string;
  seo_title_template: string;
  seo_description_template: string;
  languages: string[];
  defaultLanguage: string;
  wechatContact: string;
  partners: Array<{ name: string; link: string }>;
  toolCategories: ToolCategory[];
}

const API_BASE = 'http://localhost:3001/api';

export default function AdminPage() {
  const router = useRouter();
  const [authed] = useState(() => {
    if (typeof window === "undefined") return false;
    return isAdminAuthed();
  });

  // Basic client-side auth gate (required for static export deployments)
  useEffect(() => {
    if (!authed) router.replace("/admin/login/?next=/admin/");
  }, [authed, router]);

  const [activeTab, setActiveTab] = useState<'settings' | 'tools' | 'posts'>('posts');
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [posts, setPosts] = useState<Article[]>([]);
  
  // Editing states
  const [editingPost, setEditingPost] = useState<Article | null>(null);
  const [postFormOldSlug, setPostFormOldSlug] = useState<string>('');
  const [postSearch, setPostSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [editorLanguage, setEditorLanguage] = useState<'zh' | 'en' | 'seo'>('zh');

  // Load configuration and verify API health
  useEffect(() => {
    if (!authed) return;
    async function init() {
      try {
        const testRes = await fetch(`${API_BASE}/settings`, { method: 'GET' });
        if (testRes.ok) {
          setIsServerOnline(true);
          const settingsData = await testRes.json();
          setSettings(settingsData);
          
          const postsRes = await fetch(`${API_BASE}/posts`);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(postsData);
          }
        }
      } catch (err) {
        console.warn('Local Admin API server is offline. Running in read-only / demo mode.', err);
        setIsServerOnline(false);
        // Load default mock data for demo fallback
        setSettings({
          siteName_zh: "电商百科网",
          siteName_en: "E-Commerce Encyclopedia",
          siteDescription_zh: "一站式电商导航平台",
          siteDescription_en: "One-stop ecommerce navigation platform",
          seo_separator: "-",
          seo_title_template: "%title% %sep% %sitename%",
          seo_description_template: "%excerpt%",
          languages: ["zh", "en"],
          defaultLanguage: "zh",
          wechatContact: "18930311251",
          partners: [],
          toolCategories: []
        });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-gray-500">
        Redirecting to login...
      </div>
    );
  }

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isServerOnline || !settings) return;
    
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert('系统设置保存成功！');
      } else {
        alert('保存设置失败。');
      }
    } catch (err) {
      alert('无法连接到 API 服务器。');
    }
  };

  // Edit / Add Tool in Settings
  const handleUpdateTool = (catIndex: number, toolIndex: number, fields: Partial<ToolItem>) => {
    if (!settings) return;
    const updatedCats = [...settings.toolCategories];
    updatedCats[catIndex].tools[toolIndex] = {
      ...updatedCats[catIndex].tools[toolIndex],
      ...fields
    };
    setSettings({ ...settings, toolCategories: updatedCats });
  };

  const handleAddTool = (catIndex: number) => {
    if (!settings) return;
    const updatedCats = [...settings.toolCategories];
    const newTool: ToolItem = {
      id: `new_tool_${Date.now()}`,
      name_zh: '新工具名称',
      name_en: 'New Tool Name',
      description_zh: '工具中文描述介绍',
      description_en: 'Tool English description',
      url: '/new-tool/',
      icon: '/wp-content/uploads/2024/08/616157f533fc3-1.png',
      rating: 5,
      users_zh: '10K人在用',
      users_en: '10K users'
    };
    updatedCats[catIndex].tools.push(newTool);
    setSettings({ ...settings, toolCategories: updatedCats });
  };

  const handleRemoveTool = (catIndex: number, toolIndex: number) => {
    if (!settings) return;
    if (!confirm('确定要删除这个工具吗？')) return;
    const updatedCats = [...settings.toolCategories];
    updatedCats[catIndex].tools.splice(toolIndex, 1);
    setSettings({ ...settings, toolCategories: updatedCats });
  };

  // Create new post template
  const handleCreateNewPost = () => {
    const newPost: Article = {
      slug: `new-post-${Date.now()}`,
      title: '新建文章标题',
      categories: ['电商资讯'],
      featuredImage: '/wp-content/uploads/2024/08/20240813-161115.png',
      publishedTime: new Date().toISOString(),
      content: '<p>在这里输入文章的中文主体 HTML 内容...</p>',
      slug_en: `new-post-${Date.now()}`,
      title_en: 'New Post Title',
      categories_en: ['E-Commerce News'],
      content_en: '<p>Input English article body HTML content here...</p>',
      seo: {
        focusKeyword: '',
        focusKeyword_en: '',
        seoTitle: '%title% %sep% %sitename%',
        seoTitle_en: '%title% %sep% %sitename%',
        seoDescription: '%excerpt%',
        seoDescription_en: '%excerpt%',
        schemaType: 'Article',
        robots: 'index, follow'
      }
    };
    setEditingPost(newPost);
    setPostFormOldSlug('');
    setEditorLanguage('zh');
  };

  // Save Post to server
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    // Basic Validation
    if (!editingPost.slug.trim()) {
      alert('中文 Slug 不能为空');
      return;
    }

    try {
      const payload = {
        ...editingPost,
        oldSlug: postFormOldSlug || undefined
      };

      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        // Update local list
        let updatedPosts = [...posts];
        const index = updatedPosts.findIndex(p => p.slug === editingPost.slug || (postFormOldSlug && p.slug === postFormOldSlug));
        if (index > -1) {
          updatedPosts[index] = data.post;
        } else {
          updatedPosts.unshift(data.post);
        }
        setPosts(updatedPosts);
        setEditingPost(null);
        alert('文章保存成功！');
      } else {
        alert('保存文章失败');
      }
    } catch (err) {
      alert('保存失败：无法连接 API 服务器');
    }
  };

  // Delete Post
  const handleDeletePost = async (slug: string) => {
    if (!confirm(`确定要彻底删除文章 "${slug}" 吗？`)) return;

    try {
      const res = await fetch(`${API_BASE}/posts?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.slug !== slug));
        alert('文章删除成功！');
      } else {
        alert('删除文章失败');
      }
    } catch (err) {
      alert('删除失败：无法连接 API 服务器');
    }
  };

  // Update Focus Keyword for active language
  const handleUpdateFocusKeyword = (value: string) => {
    if (!editingPost) return;
    const activeAnalysisLang = editorLanguage === 'en' ? 'en' : 'zh';
    if (activeAnalysisLang === 'zh') {
      setEditingPost({
        ...editingPost,
        seo: {
          ...(editingPost.seo || {}),
          focusKeyword: value
        }
      });
    } else {
      setEditingPost({
        ...editingPost,
        seo: {
          ...(editingPost.seo || {}),
          focusKeyword_en: value
        }
      });
    }
  };

  // SEO Score Analyzer Helper
  const analyzeSEOScore = (post: Article, lang: 'zh' | 'en') => {
    const kw = lang === 'zh' ? post.seo?.focusKeyword : post.seo?.focusKeyword_en;
    const title = lang === 'zh' ? post.title : post.title_en;
    const desc = lang === 'zh' ? post.seo?.seoDescription : post.seo?.seoDescription_en;
    const content = lang === 'zh' ? post.content : post.content_en;
    const slug = lang === 'zh' ? post.slug : post.slug_en;

    if (!kw) return { score: 0, checks: [] };

    const checks = [
      { id: 1, label: '焦点关键词在标题中出现', passed: title?.toLowerCase().includes(kw.toLowerCase()) },
      { id: 2, label: '焦点关键词在SEO描述中出现', passed: desc?.toLowerCase().includes(kw.toLowerCase()) },
      { id: 3, label: '焦点关键词在内容中出现', passed: content?.toLowerCase().includes(kw.toLowerCase()) },
      { id: 4, label: '文章标题字数足够', passed: (title?.length || 0) > 8 },
      { id: 5, label: '内容字数充足', passed: (content?.replace(/<[^>]*>/g, '').length || 0) > 100 },
      { id: 6, label: 'Slug 有效且短于 60字符', passed: !!slug && slug.length <= 60 && /^[a-z0-9-]+$/.test(slug) },
      { id: 7, label: 'Canonical 标签有效', passed: !!post.seo?.canonical && /^https?:\/\/[^\s]+$/.test(post.seo.canonical) },
      { id: 8, label: 'Meta 描述长度 50-160', passed: (desc?.length ?? 0) >= 50 && (desc?.length ?? 0) <= 160 },
      { id: 9, label: '内容包含至少 1 个链接', passed: /<a\s+[^>]*href=/i.test(content ?? '') },
      { id: 10, label: '所有图片都有 alt 文本', passed: (() => {
        const imgTags = (content ?? '').match(/<img[^>]*>/gi) || [];
        return imgTags.every(tag => /alt=/.test(tag));
      })() }
    ];

    const passedCount = checks.filter(c => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return { score, checks };
  };

  // Google Preview Snippet Helper
  const resolveTemplate = (template: string, post: Article, lang: 'zh' | 'en') => {
    if (!template) return '';
    const titleVal = lang === 'zh' ? post.title : (post.title_en || post.title);
    const sepVal = settings?.seo_separator || '-';
    const siteNameVal = lang === 'zh' ? settings?.siteName_zh : settings?.siteName_en;
    const cleanContent = (lang === 'zh' ? post.content : post.content_en) || '';
    const excerptVal = cleanContent.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

    return template
      .replace(/%title%/g, titleVal || '')
      .replace(/%sep%/g, sepVal)
      .replace(/%sitename%/g, siteNameVal || '')
      .replace(/%excerpt%/g, excerptVal);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-semibold">正在载入后台编辑器数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Header */}
      <div className="bg-slate-950 text-white px-6 py-4 flex flex-wrap items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold bg-orange-600 px-3 py-1.5 rounded-lg text-white">DSBKW</span>
          <span className="text-lg font-medium text-gray-200">系统管理后台 (Vite/AppRouter)</span>
        </div>
        <div className="flex items-center space-x-4">
          {isServerOnline ? (
            <span className="flex items-center text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              本地 API 服务器在线 (开发模式)
            </span>
          ) : (
            <span className="flex items-center text-xs font-semibold bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/30">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>
              只读/静态模式 (API 服务器离线)
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-4 space-y-2 shrink-0">
          <p className="text-xs uppercase font-bold text-slate-500 px-3 py-2 tracking-wider">功能导航</p>
          <button
            onClick={() => { setActiveTab('posts'); setEditingPost(null); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center space-x-3 ${activeTab === 'posts' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            博文与内容管理
          </button>
          <button
            onClick={() => { setActiveTab('tools'); setEditingPost(null); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center space-x-3 ${activeTab === 'tools' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            首页推荐/工具链接
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setEditingPost(null); }}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center space-x-3 ${activeTab === 'settings' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            系统与 SEO 全局设置
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* TAB 1: SITE SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">系统全局配置 & SEO设置</h2>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">站点名称 (中文)</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                      value={settings.siteName_zh}
                      onChange={(e) => setSettings({ ...settings, siteName_zh: e.target.value })}
                      disabled={!isServerOnline}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Site Name (English)</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                      value={settings.siteName_en}
                      onChange={(e) => setSettings({ ...settings, siteName_en: e.target.value })}
                      disabled={!isServerOnline}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">站点SEO描述 (中文)</label>
                    <textarea
                      rows={3}
                      className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                      value={settings.siteDescription_zh}
                      onChange={(e) => setSettings({ ...settings, siteDescription_zh: e.target.value })}
                      disabled={!isServerOnline}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Site Description (English)</label>
                    <textarea
                      rows={3}
                      className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                      value={settings.siteDescription_en}
                      onChange={(e) => setSettings({ ...settings, siteDescription_en: e.target.value })}
                      disabled={!isServerOnline}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">RankMath SEO 默认模版参数</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">SEO 标题分隔符</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                        value={settings.seo_separator}
                        onChange={(e) => setSettings({ ...settings, seo_separator: e.target.value })}
                        disabled={!isServerOnline}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">SEO 标题模版</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                        value={settings.seo_title_template}
                        onChange={(e) => setSettings({ ...settings, seo_title_template: e.target.value })}
                        disabled={!isServerOnline}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">SEO 描述模版</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                        value={settings.seo_description_template}
                        onChange={(e) => setSettings({ ...settings, seo_description_template: e.target.value })}
                        disabled={!isServerOnline}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">支持变量: %title% (博文/页面标题), %sep% (分隔符), %sitename% (站点名), %excerpt% (摘要自动解析)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">商务合作 (微信公众号/微信号)</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                      value={settings.wechatContact}
                      onChange={(e) => setSettings({ ...settings, wechatContact: e.target.value })}
                      disabled={!isServerOnline}
                    />
                  </div>
                </div>

                {isServerOnline && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-orange-700 shadow-md transition-all cursor-pointer"
                    >
                      保存系统配置
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: TOOLS & LINKS GRID */}
          {activeTab === 'tools' && settings && (
            <div className="space-y-8 max-w-5xl">
              <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">首页工具网格排序与管理</h2>
                  <p className="text-sm text-gray-500 mt-1">编辑和排布首页的导航方块、图标路径、评分以及点击链接（支持中英双语）。</p>
                </div>
                {isServerOnline && (
                  <button
                    onClick={handleSaveSettings}
                    className="bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange-700 shadow-md transition-all cursor-pointer"
                  >
                    保存网格更改
                  </button>
                )}
              </div>

              {settings.toolCategories.map((category, catIndex) => (
                <div key={category.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div className="flex space-x-4 items-center">
                      <h3 className="font-bold text-gray-900 text-base">{category.title_zh} / {category.title_en}</h3>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-mono">{category.id}</span>
                    </div>
                    {isServerOnline && (
                      <button
                        onClick={() => handleAddTool(catIndex)}
                        className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center space-x-1"
                      >
                        <span>+ 添加工具</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {category.tools.map((tool, toolIndex) => (
                      <div key={tool.id} className="border rounded-xl p-4 bg-gray-50 relative group/card">
                        
                        {isServerOnline && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(catIndex, toolIndex)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
                            title="删除此工具"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        )}

                        <div className="flex space-x-4">
                          <img
                            src={tool.icon}
                            alt="icon"
                            className="w-12 h-12 rounded-lg bg-white border object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/wp-content/uploads/2024/08/20240813-161115.png';
                            }}
                          />
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">名称 (中文)</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-sm outline-none focus:border-orange-500"
                                  value={tool.name_zh}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { name_zh: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">Name (English)</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-sm outline-none focus:border-orange-500"
                                  value={tool.name_en}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { name_en: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">描述 (中文)</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-sm outline-none focus:border-orange-500"
                                  value={tool.description_zh}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { description_zh: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">Desc (English)</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-sm outline-none focus:border-orange-500"
                                  value={tool.description_en}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { description_en: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">链接地址</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-xs outline-none focus:border-orange-500"
                                  value={tool.url}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { url: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">Icon 路径</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-xs outline-none focus:border-orange-500"
                                  value={tool.icon}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { icon: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">评分 (1-5)</label>
                                <select
                                  className="w-full border rounded p-1 text-xs bg-white outline-none focus:border-orange-500"
                                  value={tool.rating}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { rating: parseInt(e.target.value) })}
                                  disabled={!isServerOnline}
                                >
                                  <option value={5}>⭐⭐⭐⭐⭐ 5星</option>
                                  <option value={4}>⭐⭐⭐⭐ 4星</option>
                                  <option value={3}>⭐⭐⭐ 3星</option>
                                  <option value={2}>⭐⭐ 2星</option>
                                  <option value={1}>⭐ 1星</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">人使用数 (中文)</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-sm outline-none focus:border-orange-500"
                                  value={tool.users_zh}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { users_zh: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500">Users count (EN)</label>
                                <input
                                  type="text"
                                  className="w-full border rounded p-1 text-sm outline-none focus:border-orange-500"
                                  value={tool.users_en}
                                  onChange={(e) => handleUpdateTool(catIndex, toolIndex, { users_en: e.target.value })}
                                  disabled={!isServerOnline}
                                />
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MANAGE POSTS LIST */}
          {activeTab === 'posts' && !editingPost && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4 border-b pb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">博文内容列表</h2>
                  <p className="text-sm text-gray-500 mt-1">管理系统提取的文章，包含中文和英文翻译版本，设置 Rankmath SEO 指标。</p>
                </div>
                {isServerOnline && (
                  <button
                    onClick={handleCreateNewPost}
                    className="bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-orange-700 shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <span>+ 新建文章</span>
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="搜索文章标题或 Slug..."
                  className="flex-1 min-w-[260px] border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                />
                <select
                  className="border rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-500 shrink-0"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                >
                  <option value="">全部栏目分类</option>
                  <option value="京东">京东</option>
                  <option value="拼多多">拼多多</option>
                  <option value="淘宝天猫">淘宝天猫</option>
                  <option value="电商资讯">电商资讯</option>
                  <option value="直播带货">直播带货</option>
                  <option value="跨境电商">跨境电商</option>
                </select>
              </div>

              {/* Table */}
              <div className="border rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 font-bold border-b">
                      <th className="p-4">特色图</th>
                      <th className="p-4">中文标题 & 栏目</th>
                      <th className="p-4">英文标题 & 翻译状态</th>
                      <th className="p-4">发布时间</th>
                      <th className="p-4 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {posts
                      .filter(post => {
                        const matchesSearch = post.title.toLowerCase().includes(postSearch.toLowerCase()) || 
                                              post.slug.toLowerCase().includes(postSearch.toLowerCase()) || 
                                              (post.title_en && post.title_en.toLowerCase().includes(postSearch.toLowerCase()));
                        const matchesCategory = selectedCategoryFilter === '' || post.categories.includes(selectedCategoryFilter);
                        return matchesSearch && matchesCategory;
                      })
                      .map((post) => (
                        <tr key={post.slug} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <img
                              src={post.featuredImage || '/wp-content/uploads/2024/08/20240813-161115.png'}
                              alt="thumb"
                              className="w-16 h-10 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/wp-content/uploads/2024/08/20240813-161115.png';
                              }}
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-900 max-w-sm truncate">{post.title}</div>
                            <div className="flex gap-1.5 mt-1">
                              {post.categories.map(c => (
                                <span key={c} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            {post.title_en ? (
                              <div>
                                <div className="text-gray-900 font-medium max-w-sm truncate">{post.title_en}</div>
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1 inline-block">已翻译 (English)</span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-gray-400 text-xs italic">暂无英文版本</span>
                                <br />
                                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 mt-1 inline-block">仅限中文</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-gray-500 font-mono text-xs">
                            {post.publishedTime ? new Date(post.publishedTime).toLocaleDateString('zh-CN') : '-'}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => { setEditingPost(post); setPostFormOldSlug(post.slug); }}
                                className="text-xs font-semibold bg-gray-100 text-gray-700 border hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all flex items-center"
                              >
                                编辑/翻译
                              </button>
                              {isServerOnline && (
                                <button
                                  onClick={() => handleDeletePost(post.slug)}
                                  className="text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  删除
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EDIT POST MODULE (ACTIVE WHEN editingPost !== null) */}
          {editingPost && (() => {
            const activeAnalysisLang = editorLanguage === 'en' ? 'en' : 'zh';
            const seoAnalysis = analyzeSEOScore(editingPost, activeAnalysisLang);
            const currentScore = seoAnalysis.score;
            const currentChecks = seoAnalysis.checks;
            const currentKeyword = activeAnalysisLang === 'zh'
              ? (editingPost.seo?.focusKeyword || '')
              : (editingPost.seo?.focusKeyword_en || '');

            return (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-7xl">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {postFormOldSlug ? `编辑博文: ${editingPost.title}` : '新建博文文章'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Slug: {editingPost.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="text-sm font-semibold border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  返回列表
                </button>
              </div>

              {/* Languages / SEO Selector */}
              <div className="flex border-b mb-6 space-x-2">
                <button
                  type="button"
                  onClick={() => setEditorLanguage('zh')}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${editorLanguage === 'zh' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                  🇨🇳 中文内容配置
                </button>
                <button
                  type="button"
                  onClick={() => setEditorLanguage('en')}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${editorLanguage === 'en' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                  🇺🇸 英文翻译配置
                </button>
                <button
                  type="button"
                  onClick={() => setEditorLanguage('seo')}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${editorLanguage === 'seo' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                  📈 RankMath SEO Pro 参数
                </button>
              </div>

              <form onSubmit={handleSavePost} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Left Column - Main Editor Fields */}
                  <div className="lg:col-span-2 space-y-6">

                {/* EDITING CHINESE */}
                {editorLanguage === 'zh' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">文章标题 (中文)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500 font-medium"
                          value={editingPost.title}
                          onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                          disabled={!isServerOnline}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">文章 Slug (中文 URL 标识)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500 font-mono text-sm"
                          value={editingPost.slug}
                          onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                          disabled={!isServerOnline}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">特色图片路径 (Featured Image)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500 font-mono text-xs"
                          value={editingPost.featuredImage || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, featuredImage: e.target.value })}
                          disabled={!isServerOnline}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">发布时间</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500 font-mono text-xs"
                          value={editingPost.publishedTime || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, publishedTime: e.target.value })}
                          disabled={!isServerOnline}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">所属栏目分类 (中文)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                          placeholder="例如: 电商资讯"
                          value={editingPost.categories.join(', ')}
                          onChange={(e) => setEditingPost({ ...editingPost, categories: e.target.value.split(',').map(s => s.trim()) })}
                          disabled={!isServerOnline}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">文章正文内容 (支持 HTML)</label>
                      <ReactQuill
                        theme="snow"
                        value={editingPost.content}
                        onChange={(value) => setEditingPost({ ...editingPost, content: value })}
                        readOnly={!isServerOnline}
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* EDITING ENGLISH */}
                {editorLanguage === 'en' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Article Title (English)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500 font-medium"
                          placeholder="Insert Translated Title..."
                          value={editingPost.title_en || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, title_en: e.target.value })}
                          disabled={!isServerOnline}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Article Slug (English URL)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500 font-mono text-sm"
                          placeholder="e.g. speedy-sales-aliexpress"
                          value={editingPost.slug_en || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, slug_en: e.target.value })}
                          disabled={!isServerOnline}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Categories (English)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2.5 outline-none focus:border-orange-500"
                          placeholder="e.g. E-Commerce News, Wiki"
                          value={editingPost.categories_en?.join(', ') || ''}
                          onChange={(e) => setEditingPost({ ...editingPost, categories_en: e.target.value.split(',').map(s => s.trim()) })}
                          disabled={!isServerOnline}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Article Content (English HTML)</label>
                      <ReactQuill
                        theme="snow"
                        value={editingPost.content_en || ''}
                        onChange={(value) => setEditingPost({ ...editingPost, content_en: value })}
                        readOnly={!isServerOnline}
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* EDITING RANKMATH SEO */}
                {editorLanguage === 'seo' && (
                  <div className="space-y-6">

                    <div className="border-t pt-5">
                      <h4 className="font-bold text-gray-800 text-sm mb-4">Google Search 搜索预览预览 (Live Search Snippet)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Chinese Preview */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <p className="text-xs font-bold text-slate-500 mb-2">🇨🇳 谷歌搜索预览 (中文版)</p>
                          <div className="bg-white p-4 rounded-md border font-sans">
                            <span className="text-xs text-gray-600 block truncate">https://dsbkw.com/zh/{editingPost.slug}/</span>
                            <span className="text-[#1a0dab] text-lg hover:underline cursor-pointer block truncate font-medium mt-1">
                              {resolveTemplate(editingPost.seo?.seoTitle || '%title% %sep% %sitename%', editingPost, 'zh')}
                            </span>
                            <p className="text-xs text-[#4d5156] leading-relaxed mt-1 line-clamp-2">
                              {resolveTemplate(editingPost.seo?.seoDescription || '%excerpt%', editingPost, 'zh')}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-3 mt-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">自定义中文 SEO 标题</label>
                              <input
                                type="text"
                                className="w-full border rounded p-1.5 text-xs bg-white outline-none focus:border-orange-500"
                                value={editingPost.seo?.seoTitle || ''}
                                onChange={(e) => setEditingPost({
                                  ...editingPost,
                                  seo: { ...editingPost.seo, seoTitle: e.target.value }
                                })}
                                disabled={!isServerOnline}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">自定义中文 SEO 描述</label>
                              <textarea
                                rows={2}
                                className="w-full border rounded p-1.5 text-xs bg-white outline-none focus:border-orange-500"
                                value={editingPost.seo?.seoDescription || ''}
                                onChange={(e) => setEditingPost({
                                  ...editingPost,
                                  seo: { ...editingPost.seo, seoDescription: e.target.value }
                                })}
                                disabled={!isServerOnline}
                              />
                            </div>
                          </div>
                        </div>

                        {/* English Preview */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <p className="text-xs font-bold text-slate-500 mb-2">🇺🇸 Google Preview (English)</p>
                          <div className="bg-white p-4 rounded-md border font-sans">
                            <span className="text-xs text-gray-600 block truncate">https://dsbkw.com/en/{editingPost.slug_en || editingPost.slug}/</span>
                            <span className="text-[#1a0dab] text-lg hover:underline cursor-pointer block truncate font-medium mt-1">
                              {resolveTemplate(editingPost.seo?.seoTitle_en || '%title% %sep% %sitename%', editingPost, 'en')}
                            </span>
                            <p className="text-xs text-[#4d5156] leading-relaxed mt-1 line-clamp-2">
                              {resolveTemplate(editingPost.seo?.seoDescription_en || '%excerpt%', editingPost, 'en')}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-3 mt-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Custom English SEO Title</label>
                              <input
                                type="text"
                                className="w-full border rounded p-1.5 text-xs bg-white outline-none focus:border-orange-500"
                                value={editingPost.seo?.seoTitle_en || ''}
                                onChange={(e) => setEditingPost({
                                  ...editingPost,
                                  seo: { ...editingPost.seo, seoTitle_en: e.target.value }
                                })}
                                disabled={!isServerOnline}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Custom English SEO Description</label>
                              <textarea
                                rows={2}
                                className="w-full border rounded p-1.5 text-xs bg-white outline-none focus:border-orange-500"
                                value={editingPost.seo?.seoDescription_en || ''}
                                onChange={(e) => setEditingPost({
                                  ...editingPost,
                                  seo: { ...editingPost.seo, seoDescription_en: e.target.value }
                                })}
                                disabled={!isServerOnline}
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">规范网址 (Canonical URL)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2 text-sm outline-none focus:border-orange-500"
                          placeholder="例如: https://dsbkw.com/custom/"
                          value={editingPost.seo?.canonical || ''}
                          onChange={(e) => setEditingPost({
                            ...editingPost,
                            seo: { ...editingPost.seo, canonical: e.target.value }
                          })}
                          disabled={!isServerOnline}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">搜索引擎蜘蛛 (Robots)</label>
                        <input
                          type="text"
                          className="w-full border rounded-lg p-2 text-sm outline-none focus:border-orange-500"
                          value={editingPost.seo?.robots || 'index, follow'}
                          onChange={(e) => setEditingPost({
                            ...editingPost,
                            seo: { ...editingPost.seo, robots: e.target.value }
                          })}
                          disabled={!isServerOnline}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">谷歌富媒体 Schema 结构</label>
                        <select
                          className="w-full border rounded-lg p-2 text-sm bg-white outline-none focus:border-orange-500"
                          value={editingPost.seo?.schemaType || 'Article'}
                          onChange={(e) => setEditingPost({
                            ...editingPost,
                            seo: { ...editingPost.seo, schemaType: e.target.value as 'Article' | 'FAQ' | 'None' }
                          })}
                          disabled={!isServerOnline}
                        >
                          <option value="Article">结构化博文 (Article Schema)</option>
                          <option value="FAQ">常见问答 (FAQ Accordion Schema)</option>
                          <option value="None">无结构化 (None)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                    </div>

                    {/* Right Column - RankMath SEO Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-6 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                          <div className="flex items-center space-x-2">
                            <span className="bg-orange-600 text-white text-xs font-black px-2 py-0.5 rounded">RM</span>
                            <h3 className="font-bold text-slate-800 text-sm">RankMath SEO 分析</h3>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 animate-pulse">
                            {activeAnalysisLang === 'zh' ? '🇨🇳 中文版' : '🇺🇸 英文版'}
                          </span>
                        </div>

                        {/* Score Circle Progress */}
                        <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
                          <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                className="text-slate-100"
                                strokeWidth="5"
                                stroke="currentColor"
                                fill="transparent"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                strokeWidth="5"
                                strokeDasharray={2 * Math.PI * 26}
                                strokeDashoffset={2 * Math.PI * 26 - (currentScore / 100) * (2 * Math.PI * 26)}
                                strokeLinecap="round"
                                stroke={currentScore >= 80 ? '#10b981' : currentScore >= 50 ? '#f59e0b' : '#f43f5e'}
                                fill="transparent"
                                className="transition-all duration-300"
                              />
                            </svg>
                            <span className="absolute text-sm font-extrabold" style={{ color: currentScore >= 80 ? '#059669' : currentScore >= 50 ? '#d97706' : '#e11d48' }}>
                              {currentScore}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">SEO 得分</p>
                            <p className="text-lg font-black text-slate-800">{currentScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></p>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              currentScore >= 80 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : currentScore >= 50 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {currentScore >= 80 ? '优秀 (Excellent)' : currentScore >= 50 ? '良好 (Good)' : '需改善 (Needs Work)'}
                            </span>
                          </div>
                        </div>

                        {/* Focus Keyword Input in Sidebar */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700">焦点关键词 (Focus Keyword)</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium"
                            placeholder="输入要优化的焦点关键词..."
                            value={currentKeyword}
                            onChange={(e) => handleUpdateFocusKeyword(e.target.value)}
                            disabled={!isServerOnline}
                          />
                          <p className="text-[10px] text-slate-400 leading-normal">
                            输入该文章的主关键词（如: "速卖通" 或 "AliExpress"），系统将根据它进行 SEO 校验与计分。
                          </p>
                        </div>

                        {/* Checklist Section */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-700">SEO 优化建议清单</p>
                          
                          {!currentKeyword ? (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex items-start space-x-2">
                              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>请输入<strong>焦点关键词</strong>开始进行全面的搜索引擎优化 analysis。</span>
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                              {/* Group 1: Basic SEO */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span>基础 SEO 校验</span>
                                  <span>{currentChecks.filter(c => [1, 2, 3, 5].includes(c.id) && c.passed).length} / 4</span>
                                </div>
                                <div className="bg-white rounded-lg border border-slate-100 p-2.5 space-y-2 text-[11px]">
                                  {currentChecks.filter(c => [1, 2, 3, 5].includes(c.id)).map(c => (
                                    <div key={c.id} className="flex items-start">
                                      <span className={`w-3.5 h-3.5 rounded-full mr-2 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5 ${c.passed ? 'bg-emerald-500' : 'bg-rose-400'}`}>
                                        {c.passed ? '✓' : '×'}
                                      </span>
                                      <span className={c.passed ? 'text-slate-700' : 'text-slate-400'}>{c.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Group 2: Doc Checks */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span>结构与标签优化</span>
                                  <span>{currentChecks.filter(c => [4, 6, 7, 8].includes(c.id) && c.passed).length} / 4</span>
                                </div>
                                <div className="bg-white rounded-lg border border-slate-100 p-2.5 space-y-2 text-[11px]">
                                  {currentChecks.filter(c => [4, 6, 7, 8].includes(c.id)).map(c => (
                                    <div key={c.id} className="flex items-start">
                                      <span className={`w-3.5 h-3.5 rounded-full mr-2 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5 ${c.passed ? 'bg-emerald-500' : 'bg-rose-400'}`}>
                                        {c.passed ? '✓' : '×'}
                                      </span>
                                      <span className={c.passed ? 'text-slate-700' : 'text-slate-400'}>{c.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Group 3: Readability */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span>内容可读性与媒体</span>
                                  <span>{currentChecks.filter(c => [9, 10].includes(c.id) && c.passed).length} / 2</span>
                                </div>
                                <div className="bg-white rounded-lg border border-slate-100 p-2.5 space-y-2 text-[11px]">
                                  {currentChecks.filter(c => [9, 10].includes(c.id)).map(c => (
                                    <div key={c.id} className="flex items-start">
                                      <span className={`w-3.5 h-3.5 rounded-full mr-2 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5 ${c.passed ? 'bg-emerald-500' : 'bg-rose-400'}`}>
                                        {c.passed ? '✓' : '×'}
                                      </span>
                                      <span className={c.passed ? 'text-slate-700' : 'text-slate-400'}>{c.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isServerOnline && (
                    <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingPost(null)}
                        className="border text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-orange-700 shadow-md transition-all cursor-pointer"
                      >
                        保存更新
                      </button>
                    </div>
                  )}
                </form>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
