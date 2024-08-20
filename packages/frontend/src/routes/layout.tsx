import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import AuthProvider from "~/components/auth-provider/auth-provider";
import { component$, Slot } from "@builder.io/qwik";
import { qwikFetch } from "~/common/utils";
import Header from "./Header";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export interface RefreshResponse {
  status: string;
  message: string;
  data: {
    ExpiresIn: number;
  };
}

export const useRefreshTokenLoader = routeLoader$(async (requestEvent) => {
  const authSession = requestEvent.cookie.get("authSession");

  const noRefresh = {
    AccessToken: null,
    IdToken: null,
    ExpiresIn: null,
  };

  if (!authSession?.value) return noRefresh;

  try {
    const headers = new Headers();

    headers.append("cookie", `authSession=${authSession.value}`);
    headers.append("Content-Type", "application/json");

    const res = await qwikFetch<RefreshResponse>(
      "/api/v1/users/token/refresh",
      {
        method: "POST",
        headers: headers,
      },
    );

    if (res.data)
      return {
        ...res.data,
      };

    return noRefresh;
  } catch (err: any) {
    console.log("ERROR", err);

    return noRefresh;
  }
});

export default component$(() => {
  return (
    <AuthProvider>
      <div class="h-screen flex flex-col">
        <div class="px-5 sm:px-12 2xl:px-36">
          <Header />
        </div>
        <div class="grow overflow-auto">
          <div class="h-full px-5 sm:px-12 2xl:px-36">
            <Slot />
          </div>
        </div>
      </div>
    </AuthProvider>
  );
});
