import type { Metadata } from "next";

import { getPost, listPosts } from "@/entities/post";
import { PostView } from "@/views/post";

export const dynamic = "force-static";
export const dynamicParams = false;

/** 정적 export 는 빈 배열을 허용하지 않아, 글이 하나도 없을 때는 404 로 렌더되는 자리표시 경로 하나를 둔다. */
const EMPTY_PLACEHOLDER_SLUG = "_";

export function generateStaticParams() {
  const slugs = listPosts().map((post) => ({ slug: post.slug }));
  return slugs.length > 0 ? slugs : [{ slug: EMPTY_PLACEHOLDER_SLUG }];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost((await params).slug);
  return post ? { title: `${post.title} — Dev Digest`, description: post.dek } : {};
}

export default async function PostPage({ params }: PageProps) {
  return <PostView slug={(await params).slug} />;
}
