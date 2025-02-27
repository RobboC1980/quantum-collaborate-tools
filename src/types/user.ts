
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role?: string;
}

export const mockUsers: User[] = [
  {
    id: 'user-123',
    email: 'alice@example.com',
    fullName: 'Alice Cooper',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    role: 'Developer'
  },
  {
    id: 'user-456',
    email: 'bob@example.com',
    fullName: 'Bob Johnson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    role: 'Product Manager'
  },
  {
    id: 'user-789',
    email: 'charlie@example.com',
    fullName: 'Charlie Brown',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    role: 'Developer'
  },
  {
    id: 'user-101',
    email: 'diana@example.com',
    fullName: 'Diana Ross',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    role: 'QA Engineer'
  },
  {
    id: 'user-102',
    email: 'edward@example.com',
    fullName: 'Edward Norton',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edward',
    role: 'Designer'
  }
];
