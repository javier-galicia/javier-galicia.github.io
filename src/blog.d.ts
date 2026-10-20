declare module 'virtual:blog-posts' {
  export interface BlogPost {
    slug: string
    title: string
    date: string
    description: string
    tags: string[]
    readingTime: number
  }

  export const posts: BlogPost[]
}
