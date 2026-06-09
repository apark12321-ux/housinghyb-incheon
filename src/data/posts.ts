import { Post } from "../types";
import { POSTS_SUB } from "./posts-sub";
import { POSTS_SUB_HEAVY } from "./posts-sub-heavy";
import { POSTS_RENT } from "./posts-rent";
import { POSTS_RENT_HEAVY } from "./posts-rent-heavy";
import { POSTS_MOVE } from "./posts-move";
import { POSTS_FINANCE } from "./posts-finance";

export const POSTS: Post[] = [
  ...POSTS_SUB,
  ...POSTS_SUB_HEAVY,
  ...POSTS_RENT,
  ...POSTS_RENT_HEAVY,
  ...POSTS_MOVE,
  ...POSTS_FINANCE
];

// 카테고리별 편리한 지름길 리스트 지원
export const POSTS_BY_CATEGORY = {
  "청약-분양": POSTS.filter(p => p.category === "청약-분양"),
  "전월세": POSTS.filter(p => p.category === "전월세"),
  "이사-인테리어": POSTS.filter(p => p.category === "이사-인테리어"),
  "대출-금융": POSTS.filter(p => p.category === "대출-금융")
};
