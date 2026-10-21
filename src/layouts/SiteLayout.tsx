import type { ReactNode } from 'react'
import blogConfig from '../../blog.config'

type SiteLayoutProps = {
  children: ReactNode
  dark: boolean
  onToggleTheme: () => void
}

export function SiteLayout({ children, dark, onToggleTheme }: SiteLayoutProps) {
  return (
    <div className={`mx-auto min-h-screen w-[calc(100%-36px)] max-w-[1120px] bg-[#f5f8fc] text-[#172033] transition-colors dark:bg-[#0b1220] dark:text-[#e2e8f0] sm:w-[calc(100%-72px)] ${dark ? 'dark' : ''}`}>
      <header className="relative z-10 flex h-[70px] items-center justify-between border-b border-[#dbe4ef] dark:border-[#263449] sm:h-[84px]">
        <a className="inline-flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.4px] text-inherit no-underline" href={import.meta.env.BASE_URL} aria-label="Ir al inicio">
          <span className="grid size-8 place-items-center rounded-lg bg-[#172033] font-mono text-[11px] font-bold tracking-[-1px] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] dark:bg-[#2563eb]" aria-hidden="true">JS</span>
          <span>{blogConfig.title}</span>
        </a>
        <nav className="ml-auto mr-3 flex h-full items-center gap-3.5 text-md text-[#64748b] sm:mr-[30px] sm:gap-[34px]" aria-label="Navegación principal">
          <a className="relative flex h-full items-center text-[#172033] no-underline after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#2563eb] dark:text-[#f8fafc] dark:after:bg-[#60a5fa]" href="#publicaciones">Blog</a>
          <a className="text-inherit no-underline transition-colors hover:text-[#2563eb] dark:hover:text-white" href="#sobre-mi">Sobre mí</a>
          {blogConfig.githubUrl && <a className="hidden text-inherit no-underline transition-colors hover:text-[#2563eb] dark:hover:text-white sm:inline" href={blogConfig.githubUrl} target="_blank" rel="noreferrer">GitHub <span className="text-[#2563eb] dark:text-[#60a5fa]" aria-hidden="true">↗</span></a>}
        </nav>
        <button
          className="grid size-[30px] shrink-0 place-items-center rounded-full border border-[#dbe4ef] bg-white text-[17px] text-[#172033] transition hover:rotate-[18deg] hover:border-[#2563eb] dark:border-[#263449] dark:bg-[#111c2e] dark:text-[#e2e8f0] dark:hover:border-[#60a5fa] sm:size-[34px]"
          type="button"
          aria-label={`Cambiar a tema ${dark ? 'claro' : 'oscuro'}`}
          onClick={onToggleTheme}
        >
          {dark ? '☼' : '◐'}
        </button>
      </header>

      {children}

      <footer className="flex min-h-[72px] flex-wrap items-center justify-between gap-4 border-t border-[#dbe4ef] py-[17px] dark:border-[#263449]">
        <a className="inline-flex items-center gap-2.5 text-md font-semibold text-inherit no-underline" href={import.meta.env.BASE_URL}>
          <span className="grid size-[23px] place-items-center rounded-md bg-[#172033] font-mono text-[9px] font-bold text-white dark:bg-[#2563eb]">JS</span>
          <span>{blogConfig.title}</span>
        </a>
        <span className="order-1 w-full text-[20px] text-[#64748b] sm:order-none sm:w-auto">Tecnología con impacto. Aprendizaje continuo.</span>
        <a className="text-[20px] text-[#64748b] no-underline transition-colors hover:text-[#172033] dark:hover:text-white" href="#publicaciones">Volver arriba ↑</a>
      </footer>
    </div>
  )
}
