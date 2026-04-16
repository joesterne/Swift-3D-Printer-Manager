export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  bio?: string;
  location?: string;
  createdAt?: string;
}

export interface PrinterProfile {
  id: string;
  userId?: string;
  name: string;
  nozzleSize: number;
  bedTemp: number;
  fanSpeed: number;
}

export interface QueueItem {
  id: string;
  userId?: string;
  name: string;
  time: string;
  filament: string;
  status: 'queued' | 'printing' | 'completed' | 'failed';
  createdAt?: string;
}

export interface Model {
  id: number;
  name: string;
  author: string;
  source: string;
  downloads: string;
  likes: string;
  image: string;
  images: string[];
  description: string;
  comments: Comment[];
  url: string;
}

export interface Comment {
  user: string;
  text: string;
  date: string;
}

export interface PrintLog {
  id: number;
  name: string;
  date: string;
  time: string;
  filament: string;
  cost: string;
  status: "Success" | "Failed";
}
