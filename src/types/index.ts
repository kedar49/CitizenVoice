export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'citizen' | 'mp_staff' | 'admin';
};

export type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

export type Question = {
  id: number;
  title: string;
  description: string | null;
  category_id: number;
  user_id: string;
  status: 'open' | 'under_review' | 'merged' | 'closed' | 'implemented';
  vote_count: number;
  priority_score: number;
  created_at: string;
  categories?: Category; // Joined
  my_vote?: number; // Virtual field for current user
};
