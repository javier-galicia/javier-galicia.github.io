import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, join, resolve, sep } from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import blogConfig from './blog.config.ts'
import tailwindcss from '@tailwindcss/vite'

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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function renderPostPage(post: BlogPost, cssHrefs: string[], homeHref: string) {
  const postDate = post.date
    ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time><span class="meta-dot">·</span>`
    : ''
  const tags = post.tags.map((tag) => `<span class="rounded-[3px] bg-[#eff6ff] px-[9px] py-[5px] font-mono text-[9px] text-[#2563eb]">${escapeHtml(tag)}</span>`).join('')
  const styles = cssHrefs.map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`).join('\n    ')
  const description = post.description || blogConfig.description
  const gitHubLink = blogConfig.githubUrl
    ? `<a class="hidden text-inherit no-underline transition-colors hover:text-[#2563eb] sm:inline" href="${escapeHtml(blogConfig.githubUrl)}" target="_blank" rel="noreferrer">GitHub ↗</a>`
    : ''

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="theme-color" content="#f5f8fc">
    <title>${escapeHtml(post.title)} — ${escapeHtml(blogConfig.title)}</title>
    ${styles}
  </head>
  <body>
    <div class="mx-auto min-h-screen w-[calc(100%-36px)] max-w-[1120px] bg-[#f5f8fc] text-[#172033] sm:w-[calc(100%-72px)]">
      <header class="relative z-10 flex h-[70px] items-center justify-between border-b border-[#dbe4ef] sm:h-[84px]">
        <a class="inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.4px] text-inherit no-underline" href="${escapeHtml(homeHref)}"><span class="grid size-8 place-items-center rounded-lg bg-[#172033] font-mono text-[11px] font-bold tracking-[-1px] text-white">JS</span><span>${escapeHtml(blogConfig.title)}</span></a>
        <nav class="ml-auto mr-3 flex h-full items-center gap-3.5 text-[10px] text-[#64748b] sm:mr-[30px] sm:gap-[34px] sm:text-xs" aria-label="Navegación principal">
          <a class="relative flex h-full items-center text-[#172033] no-underline after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#2563eb]" href="${escapeHtml(homeHref)}#publicaciones">Blog</a>
          ${gitHubLink}
        </nav>
      </header>
      <main class="mx-auto w-full max-w-[700px] px-0 py-10 sm:px-5 sm:py-[60px]">
        <a class="text-xs text-[#2563eb] no-underline" href="${escapeHtml(homeHref)}">← Todos los artículos</a>
        <article>
          <header class="border-b border-[#dbe4ef] py-[34px]">
            <div class="mb-[14px] flex flex-wrap items-center gap-[9px] font-mono text-[10px] text-[#64748b]">${postDate}<span>${post.readingTime} min de lectura</span></div>
            <h1 class="m-0 font-serif text-[clamp(36px,6vw,52px)] font-medium leading-[1.13] tracking-[-1.4px]">${escapeHtml(post.title)}</h1>
            ${description ? `<p class="mt-[14px] max-w-[570px] text-[15px] leading-[1.75] text-[#64748b]">${escapeHtml(description)}</p>` : ''}
            ${tags ? `<div class="mt-[18px] flex flex-wrap gap-[7px]">${tags}</div>` : ''}
          </header>
          <div class="prose pt-[30px]">${post.html}</div>
        </article>
        <footer class="mt-[45px] border-t border-[#dbe4ef] pt-[18px] text-[11px] text-[#64748b]">Escrito por ${escapeHtml(blogConfig.author)} · <a class="text-[#2563eb]" href="${escapeHtml(homeHref)}">${escapeHtml(blogConfig.title)}</a></footer>
      </main>
    </div>
  </body>
</html>`
}

function blogPlugin(): Plugin {
  let config: ResolvedConfig
  let postsDirectory = ''

  return {
    name: 'personal-blog-static-posts',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      postsDirectory = resolve(config.root, 'posts')
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
        const page = renderPostPage(
          post,
          [`${base}src/index.css`],
          base,
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

      for (const post of posts) {
        this.emitFile({
          type: 'asset',
          fileName: `posts/${post.slug}/index.html`,
          source: renderPostPage(post, cssHrefs, homeHref),
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), blogPlugin(), tailwindcss()],
})
