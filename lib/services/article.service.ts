import { db } from '@/lib/db'
import { ArticleKind } from '@prisma/client'

export async function getArticles(params?: { kind?: ArticleKind }) {
    const { kind } = params ?? {}

    return db.article.findMany({
        where: {
            published: true,
            ...(kind ? { kind } : {}),
        },
        orderBy: { title: 'asc' },
    })
}

export async function getArticleBySlug(slug: string) {
    return db.article.findUnique({
        where: { slug, published: true },
    })
}

export async function getArticleTags(articleId: string) {
    const taggables = await db.taggable.findMany({
        where: { entityType: 'article', entityId: articleId },
        include: { tag: true },
    })
    return taggables.map((t) => t.tag)
}