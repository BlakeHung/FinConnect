import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'FINANCE_MANAGER' | 'USER';
    } & DefaultSession['user']
  }
} 