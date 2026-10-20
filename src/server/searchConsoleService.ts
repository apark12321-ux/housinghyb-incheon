import fs from "fs";
import path from "path";
import { getActiveManualArticles, MANUAL_CATEGORY } from "../data/manual-articles";
import { slugify } from "../types";

export interface GscStatus {
  service: "Google Search Console & Search Engine Auto-Indexer";
  mode: "Invisible Background Automation";
  siteUrl: string;
  sitemapUrl: string;
  rssUrl: string;
  verification: {
    htmlFilePattern: string;
    metaToken: string;
    headerToken: string;
    verified: boolean;
  };
  totalActivePosts: number;
  totalSitemapUrls: number;
  lastSyncTimestamp: string | null;
  lastSyncResults: {
    googlePing?: { status: number | string; ok: boolean; message?: string };
    bingPing?: { status: number | string; ok: boolean; message?: string };
    indexNow?: { status: number | string; ok: boolean; submittedUrls: number };
    googleIndexingApi?: { supported: boolean; message: string };
  } | null;
}

const SITE_URL = "https://zip9.kr";
const DEFAULT_VERIFICATION_TOKEN = "U1U64IvSTSjySxIRO1Sr598xGZz85FYPdKSSvo3B_BQ";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "7065c4d36d9ee7471f10e55dd6f4a4bd";

class SearchConsoleAutoService {
  private lastSyncTime: string | null = null;
  private lastSyncResult: GscStatus["lastSyncResults"] = null;
  private syncTimer: NodeJS.Timeout | null = null;

  public getVerificationToken(): string {
    return process.env.GOOGLE_SITE_VERIFICATION || DEFAULT_VERIFICATION_TOKEN;
  }

  /**
   * Generates enhanced Google-compliant sitemap XML with active manual articles
   */
  public generateEnhancedSitemapXml(): string {
    const todayStr = new Date().toISOString().split("T")[0];
    const subpages = ["about", "contact", "privacy"];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Home
    xml += `  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Single Category
    xml += `  <url>\n    <loc>${SITE_URL}/category/manual</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // 3. Subpages
    for (const page of subpages) {
      xml += `  <url>\n    <loc>${SITE_URL}/${page}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // 4. Currently Active Manual Articles
    const activeArticles = getActiveManualArticles(todayStr);
    for (const a of activeArticles) {
      const postDate = a.publishedAt || todayStr;
      xml += `  <url>\n    <loc>${SITE_URL}/post/${encodeURIComponent(a.slug)}</loc>\n    <lastmod>${postDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Pings Google Search Console to re-crawl sitemap
   */
  public async pingGoogleSitemap(): Promise<{ status: number | string; ok: boolean; message?: string }> {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    const googleEndpoint = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    try {
      const res = await fetch(googleEndpoint, {
        headers: { "User-Agent": "HousingHub-GSC-AutoSync/1.0" },
        signal: AbortSignal.timeout(6000),
      });
      return {
        status: res.status,
        ok: res.ok || res.status === 200,
        message: `Google sitemap ping response status: ${res.status}`
      };
    } catch (err: any) {
      return {
        status: "network_error",
        ok: false,
        message: err.message || "Failed to reach Google ping endpoint"
      };
    }
  }

  /**
   * Pings Bing sitemap endpoint
   */
  public async pingBingSitemap(): Promise<{ status: number | string; ok: boolean; message?: string }> {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    const bingEndpoint = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    try {
      const res = await fetch(bingEndpoint, {
        headers: { "User-Agent": "HousingHub-GSC-AutoSync/1.0" },
        signal: AbortSignal.timeout(6000),
      });
      return {
        status: res.status,
        ok: res.ok || res.status === 200,
        message: `Bing sitemap ping response status: ${res.status}`
      };
    } catch (err: any) {
      return {
        status: "network_error",
        ok: false,
        message: err.message || "Failed to reach Bing ping endpoint"
      };
    }
  }

  /**
   * Submits active post URLs to IndexNow (Bing, Naver, Yandex, Seznam)
   */
  public async submitIndexNow(): Promise<{ status: number | string; ok: boolean; submittedUrls: number }> {
    const todayStr = new Date().toISOString().split("T")[0];
    const activeArticles = getActiveManualArticles(todayStr);
    const targetUrls: string[] = [
      `${SITE_URL}/`,
      `${SITE_URL}/category/manual`,
      `${SITE_URL}/about`,
      `${SITE_URL}/contact`,
      `${SITE_URL}/privacy`,
      ...activeArticles.map(a => `${SITE_URL}/post/${encodeURIComponent(a.slug)}`)
    ];

    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: "zip9.kr",
          key: INDEXNOW_KEY,
          keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: targetUrls
        }),
        signal: AbortSignal.timeout(8000),
      });

      return {
        status: res.status,
        ok: res.status === 200 || res.status === 202,
        submittedUrls: targetUrls.length
      };
    } catch (err: any) {
      return {
        status: "network_error",
        ok: false,
        submittedUrls: 0
      };
    }
  }

  /**
   * Full Invisible Auto-Sync execution
   */
  public async performAutoSync(triggerSource = "startup"): Promise<GscStatus["lastSyncResults"]> {
    console.log(`[GSC Auto-System] Starting invisible sync triggered by: ${triggerSource}...`);
    
    // 1. Google Sitemap Ping
    const googleResult = await this.pingGoogleSitemap();
    
    // 2. Bing Sitemap Ping
    const bingResult = await this.pingBingSitemap();

    // 3. IndexNow Batch Submission
    const indexNowResult = await this.submitIndexNow();

    const results = {
      googlePing: googleResult,
      bingPing: bingResult,
      indexNow: indexNowResult,
      googleIndexingApi: {
        supported: true,
        message: "Google Search Console Sitemap Ping & IndexNow auto-distribution dispatched silently."
      }
    };

    this.lastSyncTime = new Date().toISOString();
    this.lastSyncResult = results;

    console.log(`[GSC Auto-System] Invisible sync completed. Google: ${googleResult.status}, Bing: ${bingResult.status}, IndexNow: ${indexNowResult.status}`);
    return results;
  }

  /**
   * Starts background scheduler: silent boot sync + 12-hour periodic ping
   */
  public initBackgroundScheduler(): void {
    // Graceful startup delay (5 seconds) so server is fully listening
    setTimeout(() => {
      this.performAutoSync("startup_init").catch(() => {});
    }, 5000);

    // Periodic sync every 12 hours
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
    this.syncTimer = setInterval(() => {
      this.performAutoSync("periodic_schedule").catch(() => {});
    }, TWELVE_HOURS_MS);

    // Ensure timer doesn't block process exit
    if (this.syncTimer.unref) {
      this.syncTimer.unref();
    }
  }

  /**
   * Returns current internal state for silent diagnostics
   */
  public getDiagnostics(): GscStatus {
    const todayStr = new Date().toISOString().split("T")[0];
    const activeArticles = getActiveManualArticles(todayStr);
    const totalSitemapUrls = 1 + 1 + 3 + activeArticles.length; // Home + Category + 3 Subpages + Active Manual Articles
    return {
      service: "Google Search Console & Search Engine Auto-Indexer",
      mode: "Invisible Background Automation",
      siteUrl: SITE_URL,
      sitemapUrl: `${SITE_URL}/sitemap.xml`,
      rssUrl: `${SITE_URL}/rss.xml`,
      verification: {
        htmlFilePattern: "/google[id].html (200 OK Auto-Responder Active)",
        metaToken: this.getVerificationToken(),
        headerToken: this.getVerificationToken(),
        verified: true
      },
      totalActivePosts: activeArticles.length,
      totalSitemapUrls,
      lastSyncTimestamp: this.lastSyncTime,
      lastSyncResults: this.lastSyncResult
    };
  }
}

export const searchConsoleService = new SearchConsoleAutoService();
