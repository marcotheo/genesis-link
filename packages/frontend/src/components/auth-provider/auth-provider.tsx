import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";

interface AuthState {
  accessToken: string | null;
}

export const AuthContext = createContextId<AuthState>("auth.context");

export default component$(() => {
  const authState = useStore<AuthState>({ accessToken: null });

  useContextProvider(AuthContext, authState);

  return (
    <>
      <Slot />
    </>
  );
});
