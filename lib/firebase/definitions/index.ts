export interface RolePostRequest {
  uid?: string
  role?: string
}

export enum Role {
  // Admin = 'admin',
  Mod = 'mod',
  Member = 'member',
}