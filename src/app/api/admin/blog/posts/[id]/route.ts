import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        isPublished: body.isPublished,
        publishedAt: body.isPublished ? new Date() : null,
        categoryId: body.categoryId || null,
      },
    })
    await logActivity({
      userId: session.userId as string,
      action: "UPDATE",
      entity: "BlogPost",
      entityId: post.id,
      details: { title: post.title },
    })
    return NextResponse.json({ post })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    await prisma.blogPost.delete({ where: { id: params.id } })
    await logActivity({
      userId: session.userId as string,
      action: "DELETE",
      entity: "BlogPost",
      entityId: params.id,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
