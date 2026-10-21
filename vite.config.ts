import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, join, resolve, sep } from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import blogConfig from './blog.config.ts'
import tailwindcss from '@tailwindcss/vite'
import { renderStaticPostTemplate } from './src/layouts/staticPostTemplate.ts'
import { renderStaticHomeTemplate } from './src/layouts/staticHomeTemplate.ts'

const virtualModuleId = 'virtual:blog-posts'
const resolvedVirtualModuleId = `\0${virtualModuleId}`
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true })

type BlogPost = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: number
  html: string
}

type BlogPostSummary = Omit<BlogPost, 'html'>

function toPostSummary(post: BlogPost): BlogPostSummary {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    description: post.description,
    tags: post.tags,
    readingTime: post.readingTime,
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}

function normalizeSlug(filename: string) {
  const slug = basename(filename, extname(filename))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug) {
    throw new Error(`Cannot create a URL slug from post filename "${filename}".`)
  }

  return slug
}

function getPostDate(value: unknown, filename: string) {
  if (value === undefined) return ''

  const date = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : typeof value === 'string'
      ? value
      : ''

  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00.000Z`)
    : null

  if (!parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid "date" in ${filename}. Use a date in YYYY-MM-DD format.`)
  }

  return date
}

function createDescription(content: string) {
  const plainText = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return plainText.length > 180 ? `${plainText.slice(0, 177).trimEnd()}...` : plainText
}

function readPosts(postsDirectory: string): BlogPost[] {
  const files = readdirSync(postsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === '.md')
    .map((entry) => entry.name)
  const slugs = new Set<string>()

  const posts = files.flatMap((filename) => {
    const source = readFileSync(join(postsDirectory, filename), 'utf8')
    const parsed = matter(source)
    const metadata: Record<string, unknown> = parsed.data

    if (metadata.draft === true) return []

    const slug = normalizeSlug(filename)
    if (slugs.has(slug)) {
      throw new Error(`More than one Markdown file resolves to the post URL "${slug}".`)
    }
    slugs.add(slug)

    if (typeof metadata.title !== 'string' || !metadata.title.trim()) {
      throw new Error(`Missing required "title" in ${filename}.`)
    }

    if (metadata.tags !== undefined && (!Array.isArray(metadata.tags) || !metadata.tags.every((tag) => typeof tag === 'string'))) {
      throw new Error(`The "tags" field in ${filename} must be a list of strings.`)
    }

    const content = parsed.content.trim()
    const description = typeof metadata.description === 'string'
      ? metadata.description.trim()
      : createDescription(content)
    const wordCount = content.split(/\s+/).filter(Boolean).length

    return [{
      slug,
      title: metadata.title.trim(),
      date: getPostDate(metadata.date, filename),
      description,
      tags: (metadata.tags as string[] | undefined) ?? [],
      readingTime: Math.max(1, Math.ceil(wordCount / 200)),
      html: markdown.render(content),
    }]
  })

  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

function getSiteUrl() {
  if (!blogConfig.siteUrl) return ''

  let url: URL
  try {
    url = new URL(blogConfig.siteUrl)
  } catch {
    throw new Error('Set "siteUrl" in blog.config.ts to a valid public URL.')
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('"siteUrl" in blog.config.ts must use HTTP or HTTPS.')
  }

  return url.toString().replace(/\/$/, '')
}

function getCanonicalUrl(siteUrl: string, pathname: string) {
  return siteUrl ? new URL(pathname, `${siteUrl}/`).toString() : ''
}

function renderSeoHead(posts: BlogPost[], base: string, siteUrl: string) {
  const title = `${blogConfig.title} — Tecnología, IA, cloud y JavaScript`
  const canonicalUrl = getCanonicalUrl(siteUrl, base)
  const meta = [
    `<meta name="description" content="${escapeHtml(blogConfig.description)}">`,
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    `<meta property="og:site_name" content="${escapeHtml(blogConfig.title)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(blogConfig.description)}">`,
    '<meta property="og:type" content="website">',
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(blogConfig.description)}">`,
    canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : '',
    canonicalUrl ? `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">` : '',
  ].filter(Boolean).join('\n    ')
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: blogConfig.title,
    description: blogConfig.description,
    ...(canonicalUrl ? { url: canonicalUrl } : {}),
    inLanguage: 'es',
    author: {
      '@type': 'Person',
      name: blogConfig.author,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      ...(siteUrl ? { url: getCanonicalUrl(siteUrl, `${base}posts/${post.slug}/`) } : {}),
      ...(post.date ? { datePublished: post.date } : {}),
      author: {
        '@type': 'Person',
        name: blogConfig.author,
      },
    })),
  }
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`

  return `<title>${escapeHtml(title)}</title>\n    ${meta}\n    ${jsonLd}`
}

function blogPlugin(): Plugin {
  let config: ResolvedConfig
  let postsDirectory = ''
  let siteUrl = ''

  return {
    name: 'personal-blog-static-posts',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      postsDirectory = resolve(config.root, 'posts')
      siteUrl = getSiteUrl()
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const base = config.base.endsWith('/') ? config.base : `${config.base}/`
        const posts = readPosts(postsDirectory)
        const seoHead = renderSeoHead(posts, base, siteUrl)
        const fallback = renderStaticHomeTemplate(posts, base)

        return html
          .replace(/<title>[\s\S]*?<\/title>/, seoHead)
          .replace('<div id="root"></div>', fallback)
      },
    },
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return

      const summaries = readPosts(postsDirectory).map(toPostSummary)
      return `export const posts = ${JSON.stringify(summaries)}`
    },
    configureServer(server) {
      server.watcher.add(postsDirectory)
      server.middlewares.use((request, response, next) => {
        if (request.method !== 'GET' || !request.url) return next()

        const pathname = new URL(request.url, 'http://localhost').pathname
        const match = pathname.match(/\/posts\/([a-z0-9-]+)(?:\/index\.html)?\/?$/)
        if (!match) return next()

        const post = readPosts(postsDirectory).find((item) => item.slug === match[1])
        if (!post) {
          response.statusCode = 404
          response.end('Post not found')
          return
        }

        const base = config.base.endsWith('/') ? config.base : `${config.base}/`
        const page = renderStaticPostTemplate(
          post,
          [`${base}src/index.css`],
          base,
          siteUrl,
        )
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(page)
      })
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(`${postsDirectory}${sep}`)) return

      const virtualModule = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
      if (virtualModule) server.moduleGraph.invalidateModule(virtualModule)
      server.ws.send({ type: 'full-reload' })
      return []
    },
    generateBundle(_options, bundle) {
      const cssAssets = Object.values(bundle)
        .filter((output) => output.type === 'asset' && output.fileName.endsWith('.css'))
      const posts = readPosts(postsDirectory)
      const homeHref = config.base.startsWith('.')
        ? '../../'
        : config.base
      const cssHrefs = config.base.startsWith('.')
        ? cssAssets.map((asset) => `../../${asset.fileName}`)
        : cssAssets.map((asset) => `${config.base}${asset.fileName}`)

      if (posts.length > 0 && cssHrefs.length === 0) {
        throw new Error('Could not find the generated CSS bundle for static blog posts.')
      }

      const base = config.base.endsWith('/') ? config.base : `${config.base}/`
      const homeUrl = getCanonicalUrl(siteUrl, base)
      const sitemap = siteUrl
        ? [
            { url: homeUrl, date: '' },
            ...posts.map((post) => ({
              url: getCanonicalUrl(siteUrl, `${base}posts/${post.slug}/`),
              date: post.date,
            })),
          ].map(({ url, date }) => `  <url><loc>${escapeHtml(url)}</loc>${date ? `<lastmod>${escapeHtml(date)}</lastmod>` : ''}</url>`).join('\n')
        : ''

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${getCanonicalUrl(siteUrl, `${base}sitemap.xml`)}\n` : ''}`,
      })

      if (siteUrl) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`,
        })
      }

      for (const post of posts) {
        this.emitFile({
          type: 'asset',
          fileName: `posts/${post.slug}/index.html`,
          source: renderStaticPostTemplate(post, cssHrefs, homeHref, siteUrl),
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), blogPlugin(), tailwindcss()],
})
