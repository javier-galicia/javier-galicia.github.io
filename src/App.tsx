import { useMemo, useState } from 'react'
import { posts } from 'virtual:blog-posts'
import blogConfig from '../blog.config'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function App() {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [dark, setDark] = useState(false)

  const tags = [...new Set(posts.flatMap((post) => post.tags))]
  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return posts.filter((post) => {
      const matchesQuery = !normalizedQuery || [
        post.title,
        post.description,
        ...post.tags,
      ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery))
      const matchesTag = !activeTag || post.tags.includes(activeTag)
      return matchesQuery && matchesTag
    })
  }, [activeTag, query])

  return (
    <div className={`mx-auto min-h-screen w-[calc(100%-36px)] max-w-[1120px] bg-[#f5f8fc] text-[#172033] transition-colors dark:bg-[#0b1220] dark:text-[#e2e8f0] sm:w-[calc(100%-72px)] ${dark ? 'dark' : ''}`}>
      <header className="relative z-10 flex h-[70px] items-center justify-between border-b border-[#dbe4ef] dark:border-[#263449] sm:h-[84px]">
        <a className="inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.4px] text-inherit no-underline" href={import.meta.env.BASE_URL} aria-label="Ir al inicio">
          <span className="grid size-8 place-items-center rounded-lg bg-[#172033] font-mono text-[11px] font-bold tracking-[-1px] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] dark:bg-[#2563eb]" aria-hidden="true">JS</span>
          <span>{blogConfig.title}</span>
        </a>
        <nav className="ml-auto mr-3 flex h-full items-center gap-3.5 text-[10px] text-[#64748b] sm:mr-[30px] sm:gap-[34px] sm:text-xs" aria-label="Navegación principal">
          <a className="relative flex h-full items-center text-[#172033] no-underline after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#2563eb] dark:text-[#f8fafc] dark:after:bg-[#60a5fa]" href="#publicaciones">Blog</a>
          <a className="text-inherit no-underline transition-colors hover:text-[#2563eb] dark:hover:text-white" href="#sobre-mi">Sobre mí</a>
          {blogConfig.githubUrl && <a className="hidden text-inherit no-underline transition-colors hover:text-[#2563eb] dark:hover:text-white sm:inline" href={blogConfig.githubUrl} target="_blank" rel="noreferrer">GitHub <span className="text-[#2563eb] dark:text-[#60a5fa]" aria-hidden="true">↗</span></a>}
        </nav>
        <button
          className="grid size-[30px] shrink-0 place-items-center rounded-full border border-[#dbe4ef] bg-white text-[17px] text-[#172033] transition hover:rotate-[18deg] hover:border-[#2563eb] dark:border-[#263449] dark:bg-[#111c2e] dark:text-[#e2e8f0] dark:hover:border-[#60a5fa] sm:size-[34px]"
          type="button"
          aria-label={`Cambiar a tema ${dark ? 'claro' : 'oscuro'}`}
          onClick={() => setDark((value) => !value)}
        >
          {dark ? '☼' : '◐'}
        </button>
      </header>

      <main>
        <section className="relative grid min-h-[380px] grid-cols-1 items-center gap-[31px] border-b border-[#dbe4ef] px-0 py-[54px] dark:border-[#263449] sm:min-h-[410px] sm:grid-cols-[1fr_220px] sm:gap-8 sm:px-[6.2%] sm:py-[66px] sm:pb-[74px] lg:grid-cols-[1fr_280px] lg:gap-[100px]" aria-labelledby="intro-title">
          <div className="relative z-[1]">
            <p className="flex items-center gap-[9px] font-mono text-[10px] tracking-[1.3px] text-[#2563eb] dark:text-[#60a5fa]"><span className="size-1.5 rounded-full bg-[#06b6d4]" /> TECNOLOGÍA · NEGOCIO · INNOVACIÓN</p>
            <h1 id="intro-title" className="my-[23px] text-[clamp(43px,11vw,59px)] leading-[1.06] tracking-[-2.7px] font-serif font-medium sm:text-[clamp(42px,5.2vw,64px)]">
              Notas prácticas para<br />desarrollar lo que <em className="text-[#2563eb] dark:text-[#60a5fa]">viene.</em>
            </h1>
            <p className="max-w-[415px] leading-[1.8] text-[#64748b] text-base font-medium font-stretch-condensed">
              IA, cloud y JavaScript al servicio de empresas que quieren avanzar. Ideas prácticas
              para convertir tecnología en impacto.
            </p>
            <a className="mt-6 inline-flex items-center gap-[13px] text-[11px] font-semibold text-[#172033] no-underline dark:text-[#e2e8f0]" href="#publicaciones">
              Explorar artículos
              <span className="grid size-[23px] place-items-center rounded-full border border-[#dbe4ef] text-[#2563eb] transition-transform hover:translate-y-[3px] dark:border-[#263449] dark:text-[#60a5fa]">↓</span>
            </a>
          </div>
          <aside id="sobre-mi" className="relative z-[1] min-h-[205px] w-full justify-self-end overflow-hidden rounded-xl border border-[#dbe4ef] bg-white p-[17px_20px_18px] shadow-[0_18px_50px_rgba(23,32,51,0.08)] dark:border-[#263449] dark:bg-[#111c2e] sm:min-h-[240px]">
            <span className="font-mono text-[9px] tracking-[1px] text-[#64748b]">01 / STACK TECNOLÓGICO</span>
            <div className="relative mt-2 h-[90px] overflow-hidden rounded-lg bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12),transparent_65%)] sm:h-[112px]" aria-hidden="true">
              <span className="absolute inset-x-[12%] top-1/2 border-t border-dashed border-[#93a9c7] dark:border-[#3c5678]" />
              <span className="absolute left-[18%] top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#06b6d4] shadow-[0_0_0_5px_rgba(6,182,212,0.12)]" />
              <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border border-[#dbeafe] bg-white font-mono text-xs font-bold text-[#2563eb] shadow-[0_5px_20px_rgba(37,99,235,0.13)] dark:border-[#31517c] dark:bg-[#172944] dark:text-[#93c5fd]">JS</span>
              <span className="absolute right-[18%] top-1/2 size-3 -translate-y-1/2 rounded-full bg-[#8b5cf6] shadow-[0_0_0_5px_rgba(139,92,246,0.12)]" />
              <span className="absolute left-[13%] top-2 font-mono text-[8px] tracking-widest text-[#64748b]">CLOUD</span>
              <span className="absolute right-[11%] bottom-2 font-mono text-[8px] tracking-widest text-[#64748b]">AI</span>
            </div>
            <p className="max-w-[240px] font-serif text-[15px] leading-[1.5] text-[#172033] dark:text-[#f8fafc]">Tecnología bien aplicada. Productos mejores, equipos más ágiles, negocios preparados para el cambio.</p>
            <span className="mt-[9px] block font-mono text-[10px] text-[#64748b]">— {blogConfig.author}</span>
          </aside>
          <span className="absolute bottom-[95px] right-[44%] font-mono text-[11px] text-[#06b6d4] sm:bottom-[45px] sm:right-[35%]" aria-hidden="true">{'{ }'}</span>
        </section>

        <section className="px-0 pb-[50px] pt-10 sm:px-[6.2%] sm:pb-[70px] sm:pt-[55px]" id="publicaciones" aria-labelledby="posts-title">
          <div className="mb-5 flex flex-col items-start justify-between gap-[17px] sm:mb-[30px] sm:flex-row sm:items-end sm:gap-6">
            <div>
              <p className="font-mono text-[10px] tracking-[1.3px] text-[#64748b]">IDEAS EN PRODUCCIÓN</p>
              <h2 id="posts-title" className="mt-2 font-serif text-[30px] font-medium leading-[1.15] tracking-[-0.8px] sm:text-[33px]">
                Artículos <span className="ml-1 align-top font-mono text-[11px] text-[#2563eb] dark:text-[#60a5fa]">{posts.length.toString().padStart(2, '0')}</span>
              </h2>
            </div>
            <label className="flex h-[38px] w-full items-center gap-[9px] rounded-[5px] border border-[#dbe4ef] bg-white px-[10px] transition-colors focus-within:border-[#2563eb] dark:border-[#263449] dark:bg-[#111c2e] dark:focus-within:border-[#60a5fa] sm:w-[230px]">
              <svg className="w-[15px] shrink-0 fill-none stroke-[#64748b] stroke-[1.5]" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4 4" /></svg>
              <input
                className="w-full min-w-0 bg-transparent text-[11px] text-[#172033] outline-none placeholder:text-[#64748b] dark:text-[#e2e8f0]"
                aria-label="Buscar publicaciones"
                type="search"
                placeholder="Buscar IA, cloud, JS..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd className="grid size-5 shrink-0 place-items-center rounded-[3px] border border-[#dbe4ef] font-mono text-[10px] text-[#64748b] dark:border-[#263449]">/</kbd>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-9 sm:grid-cols-[minmax(0,1fr)_190px] sm:gap-[30px] lg:grid-cols-[minmax(0,1fr)_228px] lg:gap-[55px]">
            <div aria-live="polite">
              {visiblePosts.map((post, index) => (
                <article className="grid grid-cols-[24px_minmax(0,1fr)_25px] gap-[9px] border-t border-[#dbe4ef] py-[21px] dark:border-[#263449] sm:grid-cols-[34px_minmax(0,1fr)_30px] sm:gap-[15px] sm:py-6 sm:pb-[26px]" key={post.slug}>
                  <div className="pt-[3px] font-mono text-[10px] text-[#aaa99f]">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-[9px] font-mono text-[10px] text-[#64748b]">
                      {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
                      {post.date && <span className="text-[#c5c2b8]">·</span>}
                      <span>{post.readingTime} min de lectura</span>
                    </div>
                    <h3 className="my-[9px] mb-[7px] font-serif text-[21px] font-medium leading-[1.3] tracking-[-0.3px] sm:text-[23px]">
                      <a className="text-inherit no-underline transition-colors hover:text-[#2563eb] dark:hover:text-[#60a5fa]" href={`${import.meta.env.BASE_URL}posts/${post.slug}/`}>{post.title}</a>
                    </h3>
                    <p className="max-w-[570px] text-xs leading-[1.75] text-[#64748b]">{post.description}</p>
                    <div className="mt-[13px] flex flex-wrap gap-[7px]">
                      {post.tags.map((tag) => (
                        <button
                          type="button"
                          className={`rounded-[3px] px-[9px] py-[5px] font-mono text-[9px] transition-colors ${activeTag === tag ? 'bg-[#2563eb] text-white dark:bg-[#60a5fa] dark:text-[#0b1220]' : 'bg-[#eff6ff] text-[#2563eb] hover:bg-[#2563eb] hover:text-white dark:bg-[#1e293b] dark:text-[#93c5fd] dark:hover:bg-[#60a5fa] dark:hover:text-[#0b1220]'}`}
                          key={tag}
                          onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <a className="grid size-7 place-items-center self-start rounded-full border border-[#dbe4ef] text-[13px] text-[#64748b] no-underline transition hover:-translate-y-0.5 hover:translate-x-0.5 hover:border-[#2563eb] hover:text-[#2563eb] dark:border-[#263449] dark:hover:border-[#60a5fa] dark:hover:text-[#60a5fa]" href={`${import.meta.env.BASE_URL}posts/${post.slug}/`} aria-label={`Leer ${post.title}`}>↗</a>
                </article>
              ))}
              {visiblePosts.length === 0 && (
                <div className="border-t border-[#dbe4ef] px-5 py-12 text-center dark:border-[#263449]">
                  <span className="font-mono text-[23px] text-[#06b6d4]">&lt;/&gt;</span>
                  <h3 className="my-3 font-serif text-[21px] font-medium">{posts.length === 0 ? 'La primera página está en blanco.' : 'No encontramos esa idea.'}</h3>
                  <p className="text-xs text-[#64748b]">{posts.length === 0 ? 'Agrega un archivo .md dentro de la carpeta posts/ para publicar.' : 'Prueba con otra búsqueda o quita el filtro seleccionado.'}</p>
                  {(query || activeTag) && <button className="mt-3 rounded border border-[#dbe4ef] px-3 py-2 text-[11px] text-[#2563eb] dark:border-[#263449] dark:text-[#60a5fa]" type="button" onClick={() => { setQuery(''); setActiveTag('') }}>Limpiar filtros</button>}
                </div>
              )}
            </div>

            <aside className="grid grid-cols-2 gap-[18px] pt-0 sm:block sm:pt-5">
              <div className="row-span-2 rounded-xl border border-[#dbe4ef] bg-white p-5 shadow-[0_12px_32px_rgba(23,32,51,0.04)] dark:border-[#263449] dark:bg-[#111c2e] sm:row-span-1">
                <div className="mb-4 grid size-[35px] place-items-center rounded-lg bg-[#dbeafe] font-mono text-sm font-bold text-[#2563eb] dark:bg-[#172944] dark:text-[#93c5fd]">{blogConfig.author.charAt(0).toUpperCase()}</div>
                <p className="font-mono text-[10px] tracking-[1.3px] text-[#64748b]">HOLA, SOY</p>
                <h3 className="my-[7px] mb-[5px] font-serif text-[21px] font-medium">{blogConfig.author}</h3>
                <p className="text-[11px] leading-[1.7] text-[#64748b]">{blogConfig.description}</p>
                <a className="mt-[15px] flex justify-between border-t border-[#dbe4ef] pt-3 text-[10px] text-[#2563eb] no-underline dark:border-[#263449] dark:text-[#60a5fa]" href="#sobre-mi">Sobre este espacio <span>→</span></a>
              </div>
              {tags.length > 0 && (
                <div className="mt-0 sm:mt-[25px]">
                  <p className="font-mono text-[10px] tracking-[1.3px] text-[#64748b]">ÁREAS</p>
                  <div className="mt-[10px] border-t border-[#dbe4ef] dark:border-[#263449]">
                    {tags.map((tag) => (
                      <button
                        className={`flex w-full justify-between border-b border-[#dbe4ef] bg-transparent py-[9px] text-left text-[11px] transition-colors dark:border-[#263449] ${activeTag === tag ? 'text-[#2563eb] dark:text-[#60a5fa]' : 'text-[#64748b] hover:text-[#2563eb] dark:hover:text-[#60a5fa]'}`}
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                      >
                        <span>{tag}</span><span className="font-mono text-[10px] text-[#aaa99f]">{posts.filter((post) => post.tags.includes(tag)).length}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-0 flex items-center gap-3 rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-[13px] dark:border-[#263449] dark:bg-[#111c2e] sm:mt-7">
                <span className="font-mono text-sm font-bold text-[#2563eb] dark:text-[#60a5fa]" aria-hidden="true">&lt;/&gt;</span>
                <p className="font-mono text-[10px] leading-[1.6] text-[#64748b]">BUILD · DEPLOY ·<br />REPEAT</p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer className="flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-t border-[#dbe4ef] py-[17px] dark:border-[#263449]">
        <a className="inline-flex items-center gap-2.5 text-xs font-semibold text-inherit no-underline" href={import.meta.env.BASE_URL}>
          <span className="grid size-[23px] place-items-center rounded-md bg-[#172033] font-mono text-[9px] font-bold text-white dark:bg-[#2563eb]">JS</span>
          <span>{blogConfig.title}</span>
        </a>
        <span className="order-1 w-full text-[10px] text-[#64748b] sm:order-none sm:w-auto">Tecnología con impacto. Aprendizaje continuo.</span>
        <a className="text-[10px] text-[#64748b] no-underline transition-colors hover:text-[#172033] dark:hover:text-white" href="#publicaciones">Volver arriba ↑</a>
      </footer>
    </div>
  )
}

export default App
