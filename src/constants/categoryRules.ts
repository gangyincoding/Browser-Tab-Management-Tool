import type { CategoryRule } from "../types/tab";

export const UNCATEGORIZED = "未分类";

export const DEFAULT_CATEGORY_RULES: CategoryRule[] = [
  { name: "开发技术", domainPatterns: ["github.com", "gitlab.com", "stackoverflow.com", "npmjs.com"] },
  { name: "效率工具", domainPatterns: ["notion.so", "figma.com", "trello.com", "slack.com"] },
  { name: "学习课程", domainPatterns: ["coursera.org", "udemy.com", "edx.org", "developer.mozilla.org"] },
  { name: "新闻资讯", domainPatterns: ["nytimes.com", "bbc.com", "theverge.com", "reuters.com"] },
  { name: "社交社区", domainPatterns: ["x.com", "twitter.com", "linkedin.com", "reddit.com"] },
  { name: "视频内容", domainPatterns: ["youtube.com", "bilibili.com", "vimeo.com"] },
  { name: "购物电商", domainPatterns: ["amazon.com", "taobao.com", "jd.com", "ebay.com"] }
];
