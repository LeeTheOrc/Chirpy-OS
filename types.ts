
export type Role = 'user' | 'model';
export type LinkState = 'online' | 'offline';

export interface Message {
  role: Role;
  text: string;
  linkState?: LinkState;
}
