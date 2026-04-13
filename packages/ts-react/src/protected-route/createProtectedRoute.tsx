import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  loader?: React.ComponentType;
};

export function createProtectedRoute<TUser>(
  useAuth: () => { currentUser: TUser | null; loading: boolean },
) {
  return function ProtectedRoute({
    children,
    redirectTo = '/login',
    loader: Loader,
  }: ProtectedRouteProps) {
    const { currentUser, loading } = useAuth();

    if (loading) {
      return Loader ? <Loader /> : <div>Loading...</div>;
    }

    if (!currentUser) {
      return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
  };
}
