import { RequestHandler } from "@builder.io/qwik-city";
import { component$, Slot } from "@builder.io/qwik";

export const onRequest: RequestHandler = async ({ sharedMap, redirect }) => {
  const isLoggedIn = sharedMap.get("isLoggedIn");
  if (!isLoggedIn) throw redirect(302, "/sign-in");
};

export default component$(() => {
  return <Slot />;
});
