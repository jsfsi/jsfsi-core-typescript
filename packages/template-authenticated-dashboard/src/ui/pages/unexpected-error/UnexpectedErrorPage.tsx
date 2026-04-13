export const UnexpectedErrorPage = ({ error }: { error?: Error | null }) => {
  return <>{error?.message}</>;
};
