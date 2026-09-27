export interface UserSummary {
  _id: string;
  name: string;
  userName: string;
  imgUrl?: string;
}

export interface TourPost {
  _id: string;
  userId: string;
  imgUrls: string[];
  caption: string;
  location: string;
  tags: string[];
  visibility?: "public" | "private";
  createdAt: string;
}

export type NavTab = "home" | "your-posts";
export type SearchMode = "users" | "places";
