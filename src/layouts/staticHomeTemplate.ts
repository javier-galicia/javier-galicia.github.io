import blogConfig from '../../blog.config.ts'

export type HomeTemplatePost = {
  slug: string
  title: string
  date: string
  description: string
  readingTime: number
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

export function renderStaticHomeTemplate(posts: HomeTemplatePost[], base: string) {
  const postLinks = posts.map((post) => {
    const href = `${base}posts/${post.slug}/`
    const date = post.date ? `<time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>` : ''
    return `<li class="border-t border-[#dbe4ef] py-6 dark:border-[#263449]"><article><h3 class="mb-2 text-xl font-semibold"><a class="text-[#2563eb] no-underline dark:text-[#60a5fa]" href="${escapeHtml(href)}">${escapeHtml(post.title)}</a></h3>${date ? `<p class="mb-2 font-mono text-md text-[#64748b]">${date} · ${post.readingTime} min de lectura</p>` : ''}<p class="text-md leading-relaxed text-[#475569] dark:text-[#cbd5e1]">${escapeHtml(post.description)}</p></article></li>`
  }).join('')

  return `<div id="root">
    <div class="mx-auto min-h-screen w-[calc(100%-36px)] max-w-[1120px] bg-[#f5f8fc] text-[#172033] dark:bg-[#0b1220] dark:text-[#e2e8f0] sm:w-[calc(100%-72px)]">
      <header class="flex h-[70px] items-center justify-between border-b border-[#dbe4ef] dark:border-[#263449] sm:h-[84px]">
        <a class="inline-flex items-center gap-2.5 text-[20px] font-semibold text-inherit no-underline" href="${escapeHtml(base)}"><span class="grid size-8 place-items-center rounded-lg bg-[#172033] font-mono text-[11px] font-bold text-white dark:bg-[#2563eb]">JS</span>${escapeHtml(blogConfig.title)}</a>
        <nav class="flex items-center gap-6 text-md text-[#64748b]" aria-label="Navegación principal"><a class="text-inherit no-underline" href="#publicaciones">Blog</a><a class="text-inherit no-underline" href="#sobre-mi">Sobre mí</a></nav>
      </header>
      <main class="mx-auto max-w-[960px] px-0 py-12 sm:px-6">
        <header>
          <p class="font-mono text-md font-semibold tracking-[1.5px] text-[#2563eb]">TECNOLOGÍA · NEGOCIO · INNOVACIÓN</p>
          <h1 class="my-5 max-w-[700px] text-4xl font-bold leading-tight sm:text-5xl">Ideas para construir lo que sigue.</h1>
          <p class="max-w-[620px] text-md leading-[1.7] text-[#475569] dark:text-[#cbd5e1]">${escapeHtml(blogConfig.description)}</p>
        </header>
        <section class="mt-12" id="publicaciones" aria-labelledby="latest-articles">
          <h2 class="mb-5 text-3xl font-semibold" id="latest-articles">Artículos sobre inteligencia artificial, cloud y JavaScript</h2>
          <ul class="m-0 list-none p-0">${postLinks || '<li>Próximamente, nuevos artículos.</li>'}</ul>
        </section>
      </main>
      <footer class="border-t border-[#dbe4ef] py-6 text-md text-[#64748b] dark:border-[#263449]">Tecnología con impacto. Aprendizaje continuo.</footer>
    </div>
  </div>`
}
