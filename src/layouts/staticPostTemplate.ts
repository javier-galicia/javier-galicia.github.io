import blogConfig from '../../blog.config.ts'

export type StaticPostTemplateData = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: number
  html: string
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

function getCanonicalUrl(siteUrl: string, pathname: string) {
  return siteUrl ? new URL(pathname, `${siteUrl}/`).toString() : ''
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export function renderStaticPostTemplate(
  post: StaticPostTemplateData,
  cssHrefs: string[],
  homeHref: string,
  siteUrl: string,
) {
  const postDate = post.date
    ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time><span class="meta-dot">·</span>`
    : ''
  const tags = post.tags.map((tag) => `<span class="rounded-[3px] bg-[#eff6ff] px-[9px] py-[5px] font-mono text-[9px] text-[#2563eb] dark:bg-[#1e293b] dark:text-[#93c5fd]">${escapeHtml(tag)}</span>`).join('')
  const styles = cssHrefs.map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`).join('\n    ')
  const description = post.description || blogConfig.description
  const pageUrl = siteUrl ? getCanonicalUrl(siteUrl, `${homeHref}posts/${post.slug}/`) : ''
  const postStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    inLanguage: 'es',
    ...(pageUrl ? { url: pageUrl } : {}),
    ...(post.date ? { datePublished: post.date } : {}),
    author: {
      '@type': 'Person',
      name: blogConfig.author,
    },
    isPartOf: {
      '@type': 'Blog',
      name: blogConfig.title,
      ...(siteUrl ? { url: getCanonicalUrl(siteUrl, homeHref) } : {}),
    },
  }
  const gitHubLink = blogConfig.githubUrl
    ? `<a class="hidden text-inherit no-underline transition-colors hover:text-[#2563eb] sm:inline" href="${escapeHtml(blogConfig.githubUrl)}" target="_blank" rel="noreferrer">GitHub ↗</a>`
    : ''

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#f5f8fc">
    <title>${escapeHtml(post.title)} — ${escapeHtml(blogConfig.title)}</title>
    ${pageUrl ? `<link rel="canonical" href="${escapeHtml(pageUrl)}">\n    <meta property="og:url" content="${escapeHtml(pageUrl)}">` : ''}
    <meta property="og:site_name" content="${escapeHtml(blogConfig.title)}">
    <meta property="og:title" content="${escapeHtml(post.title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary">
    <script type="application/ld+json">${JSON.stringify(postStructuredData).replace(/</g, '\\u003c')}</script>
    <script>if (localStorage.getItem('blog-theme') === 'dark') document.documentElement.classList.add('dark')</script>
    ${styles}
  </head>
  <body>
    <div class="mx-auto min-h-screen w-[calc(100%-36px)] max-w-[1120px] bg-[#f5f8fc] text-[#172033] dark:bg-[#0b1220] dark:text-[#e2e8f0] sm:w-[calc(100%-72px)]">
      <header class="relative z-10 flex h-[70px] items-center justify-between border-b border-[#dbe4ef] dark:border-[#263449] sm:h-[84px]">
        <a class="inline-flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.4px] text-inherit no-underline" href="${escapeHtml(homeHref)}"><span class="grid size-8 place-items-center rounded-lg bg-[#172033] font-mono text-[11px] font-bold tracking-[-1px] text-white dark:bg-[#2563eb]">JS</span><span>${escapeHtml(blogConfig.title)}</span></a>
        <nav class="ml-auto mr-3 flex h-full items-center gap-3.5 text-md text-[#64748b] dark:text-[#94a3b8] sm:mr-[18px] sm:gap-[24px]" aria-label="Navegación principal">
          <a class="relative flex h-full items-center text-[#172033] no-underline after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#2563eb] dark:text-[#f8fafc] dark:after:bg-[#60a5fa]" href="${escapeHtml(homeHref)}#publicaciones">Blog</a>
          ${gitHubLink}
        </nav>
        <button class="grid size-[30px] shrink-0 place-items-center rounded-full border border-[#dbe4ef] bg-white text-[17px] text-[#172033] transition hover:border-[#2563eb] dark:border-[#263449] dark:bg-[#111c2e] dark:text-[#e2e8f0] dark:hover:border-[#60a5fa] sm:size-[34px]" type="button" aria-label="Cambiar a tema oscuro" data-theme-toggle>◐</button>
      </header>
      <main class="mx-auto w-full max-w-[700px] px-0 py-10 sm:px-5 sm:py-[60px]">
        <a class="text-md text-[#2563eb] no-underline dark:text-[#60a5fa]" href="${escapeHtml(homeHref)}">← Todos los artículos</a>
        <article>
          <header class="border-b border-[#dbe4ef] py-[34px] dark:border-[#263449]">
            <div class="mb-[14px] flex flex-wrap items-center gap-[9px] font-mono text-[20px] text-[#64748b] dark:text-[#94a3b8]">${postDate}<span>${post.readingTime} min de lectura</span></div>
            <h1 class="m-0 font-serif text-[clamp(36px,6vw,52px)] font-medium leading-[1.13] tracking-[-1.4px]">${escapeHtml(post.title)}</h1>
            ${description ? `<p class="mt-[14px] max-w-[570px] text-[20px] leading-[1.75] text-[#64748b] dark:text-[#94a3b8]">${escapeHtml(description)}</p>` : ''}
            ${tags ? `<div class="mt-[18px] flex flex-wrap gap-[7px]">${tags}</div>` : ''}
          </header>
          <div class="prose pt-[30px]">${post.html}</div>
        </article>
        <footer class="mt-[45px] border-t border-[#dbe4ef] pt-[18px] text-[11px] text-[#64748b] dark:border-[#263449] dark:text-[#94a3b8]">Escrito por ${escapeHtml(blogConfig.author)} · <a class="text-[#2563eb] dark:text-[#60a5fa]" href="${escapeHtml(homeHref)}">${escapeHtml(blogConfig.title)}</a></footer>
      </main>
    </div>
    <script>
      const themeToggle = document.querySelector('[data-theme-toggle]');
      const updateThemeButton = () => {
        const isDark = document.documentElement.classList.contains('dark');
        themeToggle.textContent = isDark ? '☼' : '◐';
        themeToggle.setAttribute('aria-label', 'Cambiar a tema ' + (isDark ? 'claro' : 'oscuro'));
      };
      updateThemeButton();
      themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('blog-theme', isDark ? 'dark' : 'light');
        updateThemeButton();
      });
    </script>
  </body>
</html>`
}
