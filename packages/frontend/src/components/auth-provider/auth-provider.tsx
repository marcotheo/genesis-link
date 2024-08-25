import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
  $,
} from "@builder.io/qwik";

import { useMutate } from "~/hooks/use-mutate/useMutate";
import { RefreshResponse } from "~/routes/layout";

interface AuthState {
  ExpiresIn: number | null;
}

export const AuthContext = createContextId<AuthState>("auth.context");

export default component$(() => {
  const authState = useStore<AuthState>({ ExpiresIn: null });

  const { mutate } = useMutate<RefreshResponse>("/api/v1/users/token/refresh");

  const getCookie = $((name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  });

  const deleteCookie = $((name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup, track }) => {
    const newExpiresIn = track(() => authState.ExpiresIn);

    const timeTrigger = 90; // seconds
    let timeoutId: NodeJS.Timeout | null = null;

    const refreshTokenJob = async () => {
      console.log("REFRESHING ACCESS TOKEN ...");

      const response = await mutate(undefined, {
        credentials: "include",
      });

      if (response.result) {
        const unixTimestamp = Math.floor(Date.now() / 1000); // time now in seconds
        const expiresIn = response.result.data.ExpiresIn + unixTimestamp;
        authState.ExpiresIn = expiresIn;
      }

      if (response.error) {
        deleteCookie("tokenExpiresIn");
        return;
      }
    };

    const expiresIn = newExpiresIn || (await getCookie("tokenExpiresIn"));

    if (!expiresIn) return;

    const unixTimestamp = Math.floor(Date.now() / 1000); // time now in seconds
    const timeLeft =
      typeof expiresIn === "number"
        ? expiresIn - unixTimestamp
        : parseInt(expiresIn, 10) - unixTimestamp;

    if (timeLeft < timeTrigger) {
      refreshTokenJob();
      return;
    }

    timeoutId = setTimeout(
      async () => {
        await refreshTokenJob();
      },
      (timeLeft - timeTrigger) * 1000,
    );

    cleanup(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });
  });

  useContextProvider(AuthContext, authState);

  return (
    <>
      <Slot />
    </>
  );
});
