import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { component$, noSerialize, Slot } from "@builder.io/qwik";
import { CognitoJwtVerifier } from "aws-jwt-verify";

import { awsRegion, poolClientId, userPoolId } from "~/common/constants";
import ToasterProvider from "~/providers/toaster/toaster";
import QueryProvider from "~/providers/query/query";
import AuthProvider from "~/providers/auth/auth";
import { rawFetch } from "~/common/utils";
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
// Initialize the verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  tokenUse: "access",
  clientId: poolClientId,
  region: awsRegion,
});

const isAuth = async (token: string, sharedMap: Map<string, any>) => {
  try {
    await verifier.verify(token);
    sharedMap.set("isLoggedIn", true);
  } catch (err) {
    console.error("Token verification failed:", err);
    sharedMap.set("isLoggedIn", false);
  }
};

export const onRequest: RequestHandler = async ({
  cookie,
  sharedMap,
  json,
}) => {
  const accessToken = cookie.get("accessToken");
  const refreshToken = cookie.get("refreshToken");
  const tokenExpiresInCookie = cookie.get("tokenExpiresIn");

  if (!accessToken || !refreshToken || !tokenExpiresInCookie) {
    sharedMap.set("isLoggedIn", false);
    return;
  }

  const unixTimestamp = Math.floor(Date.now() / 1000);
  const expiresIn = parseInt(tokenExpiresInCookie.value, 10);
  const timeLeft = expiresIn - unixTimestamp;

  if (timeLeft > 90) {
    await isAuth(accessToken.value, sharedMap);
    return;
  }

  let newAccessToken = accessToken.value;

  try {
    const cookies = `refreshToken=${refreshToken.value}; accessToken=${accessToken.value}`;

    const res = await rawFetch<RefreshResponse>("/api/v1/users/token/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
      credentials: "include",
    });

    res.response.headers.forEach((cookieValue, cookieKey) => {
      if (cookieKey.toLowerCase() === "set-cookie") {
        const [nameValue, ...attributes] = cookieValue.split("; ");
        const [name, value] = nameValue.split("=");

        if (!["accessToken", "tokenExpiresIn"].includes(name)) return;

        if (name === "accessToken") newAccessToken = value;

        // Set the cookies using the Qwik `cookie` parameter
        cookie.set(name, value, {
          path: "/", // Set the path for the cookie
          httpOnly: attributes.includes("HttpOnly"),
          secure: attributes.includes("Secure"),
          sameSite: attributes
            .find((attr) => attr.startsWith("SameSite"))
            ?.split("=")[1] as "Lax" | "Strict" | "None",
          expires: new Date(
            attributes
              .find((attr) => attr.startsWith("Expires"))
              ?.split("=")[1] || "",
          ),
        });
      }
    });

    await isAuth(newAccessToken, sharedMap);
  } catch (err: any) {
    console.log("Middleware Error: ", err);
  }

  json(200, { cookie });
};

export const useAuthCheck = routeLoader$(async ({ sharedMap }) => {
  const isLoggedIn = sharedMap.get("isLoggedIn");
  return !!isLoggedIn;
});

// Helper route loader to build and return headers with accessToken and csrfToken
export const useAuthHeadersLoader = routeLoader$(
  async ({ cookie, resolveValue }) => {
    const accessToken = cookie.get("accessToken");
    const csrfToken = cookie.get("csrfToken");

    if (!accessToken?.value || !csrfToken?.value) return null;

    const isValid = await resolveValue(useAuthCheck);

    if (!isValid) return null;

    // Build headers
    const headers = new Headers();
    headers.append(
      "cookie",
      `accessToken=${accessToken.value}; csrfToken=${csrfToken.value}`,
    );
    headers.append("X-CSRF-Token", csrfToken.value);

    return noSerialize(headers);
  },
);

export default component$(() => {
  return (
    <ToasterProvider>
      <QueryProvider>
        <AuthProvider>
          <div class="h-screen flex flex-col">
            <div class="px-5 sm:px-12 2xl:px-64">
              <Header />
            </div>
            <div class="grow overflow-auto">
              <div class="h-full min-[350px]:px-5 sm:px-12 2xl:px-64">
                <Slot />
              </div>
            </div>
          </div>
        </AuthProvider>
      </QueryProvider>
    </ToasterProvider>
  );
});
