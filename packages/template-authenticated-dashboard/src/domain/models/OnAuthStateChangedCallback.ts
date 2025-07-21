import { User } from './User';

export type OnAuthStateChangedCallback = (user: User | null) => void;
