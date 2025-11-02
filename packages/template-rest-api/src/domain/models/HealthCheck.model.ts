import { User } from './User.model';

export type HealthCheck = {
  status: 'OK';
  version: string;
  user?: User;
};
