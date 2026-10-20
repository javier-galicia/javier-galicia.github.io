# Javier / Tech Notes

Blog de tecnología empresarial, inteligencia artificial, cloud y JavaScript. El sitio usa React para la portada y archivos Markdown como fuente de los artículos. Durante `pnpm build`, Vite crea una página HTML estática por cada archivo en `posts/`.

## Escribir una publicación

Crea un archivo `.md` dentro de `posts/`. El nombre del archivo se convierte en la URL: `mi-publicacion.md` genera `/posts/mi-publicacion/`.

```md
---
title: Título de la publicación
date: 2026-10-19
description: Una breve descripción para la portada y los buscadores.
tags:
  - cloud
  - JavaScript
---

El contenido se escribe en Markdown.
```

`title` es obligatorio. `date`, `description` y `tags` son opcionales; si no escribes una descripción, se genera a partir del primer texto del post. Para guardar un borrador que no se publique, agrega `draft: true` al frontmatter.

Las imágenes pueden guardarse en `public/` y enlazarse desde Markdown, por ejemplo `![Descripción](/images/foto.jpg)`.

## Configurar el sitio

Edita `blog.config.ts` para cambiar el título, el nombre del autor, la descripción y el enlace de GitHub.

La interfaz de React usa Tailwind CSS 4. Los estilos de tipografía Markdown y los estilos base están en `src/index.css`; Vite incluye esa misma hoja de estilos en las páginas estáticas de cada publicación.

## Desarrollo y publicación

- `pnpm dev`: inicia el sitio localmente; los enlaces a publicaciones también funcionan durante el desarrollo.
- `pnpm build`: genera `dist/index.html` y una página HTML independiente en `dist/posts/<slug>/index.html` para cada publicación publicada.
- `pnpm preview`: sirve la salida estática localmente para revisar el resultado.
