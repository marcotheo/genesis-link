import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { useRefreshTokenLoader } from "~/routes/layout";

interface AuthState {
  AccessToken: string | null;
  IdToken: string | null;
  ExpiresIn: number | null;
}

export const AuthContext = createContextId<AuthState>("auth.context");

export default component$(() => {
  const result = useRefreshTokenLoader();

  const authState = useStore<AuthState>({ ...result.value });

  useContextProvider(AuthContext, authState);

  return (
    <>
      <Slot />
    </>
  );
});
