import {
  component$,
  createContextId,
  Slot,
  useContextProvider,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

import { RefreshResponse, useRefreshTokenLoader } from "~/routes/layout";
import { useMutate } from "~/hooks/use-mutate/useMutate";

interface AuthState {
  ExpiresIn: number | null;
}

export const AuthContext = createContextId<AuthState>("auth.context");

export default component$(() => {
  const result = useRefreshTokenLoader();

  const authState = useStore<AuthState>({ ...result.value });

  const { mutate } = useMutate<RefreshResponse>("/api/v1/users/token/refresh");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup, track }) => {
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

        const timeLeft = expiresIn - unixTimestamp;

        localStorage.setItem("tokenExpire", `${expiresIn}`);

        timeoutId = setTimeout(
          refreshTokenJob,
          (timeLeft - timeTrigger) * 1000,
        );
      }

      if (response.error) {
        localStorage.removeItem("tokenExpire");
        return;
      }
    };

    const expiresIn = newExpiresIn || localStorage.getItem("tokenExpire");

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
