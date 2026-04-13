import { useAuth } from '@jsfsi-core/ts-react';
import { User } from '@jsfsi-core/ts-react';

export function DashboardPage() {
  const { currentUser } = useAuth<User>();

  return (
    <div>
      <p>Welcome, {currentUser?.email}</p>
    </div>
  );
}
