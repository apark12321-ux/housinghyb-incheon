export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "청약-분양" | "전월세" | "이사-인테리어" | "대출-금융";
  author: string;
  date: string;
  image: string;
  readTime: string;
  views?: number;
  likes?: number;
  hashtags?: string[];
}

export type Category = Post["category"];

export function slugify(title: string): string {
  if (!title) return "";
  return title
    .trim()
    .toLowerCase()
    .replace(/[\s_:\-\+·\.\?,\!\[\]\(\)"']/g, "-")
    .replace(/[^\w\uAC00-\uD7A3\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
