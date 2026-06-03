import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: params.slug, isPublished: true },
      include: { category: { select: { name: true, slug: true } } },
    })
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ post })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
