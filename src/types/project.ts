export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  image: string | null;
  language: string | null;
  url: string | null;
  private: boolean;
  homepage: string | null;
  updatedAt: string | null;
}
