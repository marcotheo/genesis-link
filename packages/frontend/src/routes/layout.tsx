import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";
import { CognitoJwtVerifier } from "aws-jwt-verify";

import { awsRegion, poolClientId, userPoolId } from "~/common/constants";
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

export const onRequest: RequestHandler = async ({ cookie, json }) => {
  const accessToken = cookie.get("accessToken");
  const refreshToken = cookie.get("refreshToken");
  const tokenExpiresInCookie = cookie.get("tokenExpiresIn");

  if (!accessToken || !refreshToken || !tokenExpiresInCookie) return;

  const unixTimestamp = Math.floor(Date.now() / 1000);
  const expiresIn = parseInt(tokenExpiresInCookie.value, 10);
  const timeLeft = expiresIn - unixTimestamp;

  if (timeLeft > 90) return;

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
  } catch (err: any) {
    console.log("Middleware Error: ", err);
  }

  json(200, { cookie });
};

// Initialize the verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  tokenUse: "access",
  clientId: poolClientId,
  region: awsRegion,
});

export const useAuthCheck = routeLoader$(async ({ cookie }) => {
  const accessToken = cookie.get("accessToken");
  const tokenExpiresIn = cookie.get("tokenExpiresIn");

  if (!accessToken || !tokenExpiresIn) return false;

  try {
    await verifier.verify(accessToken.value);

    return true;
  } catch (err) {
    console.error("Token verification failed:", err);
    return false;
  }
});

export default component$(() => {
  return (
    <QueryProvider>
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
    </QueryProvider>
  );
});
