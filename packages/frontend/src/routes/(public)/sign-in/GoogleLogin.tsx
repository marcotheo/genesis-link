import { component$, $, useVisibleTask$, useContext } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";

import LoadingOverlay from "~/components/loading-overlay/loading-overlay";
import { useMutate } from "~/hooks/use-mutate/useMutate";
import { useToast } from "~/hooks/use-toast/useToast";
import { GoogleIcon } from "~/components/icons/icons";
import { AuthContext } from "~/providers/auth/auth";
import Button from "~/components/button/button";
import { useSignInParams } from ".";

import {
  cognitoDomain,
  oauthRedirectUrl,
  poolClientId,
} from "~/common/constants";
import { cn } from "~/common/utils";

export default component$(() => {
  const params = useSignInParams();
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const { mutate, state } = useMutate("POST /auth/oauth/callback");

  const getTokens = $(async () => {
    if (!params.value.code) return;

    try {
      const result = await mutate({
        bodyParams: {
          code: params.value.code,
        },
      });

      if (result.result?.data.ExpiresIn) {
        const unixTimestamp = Math.floor(Date.now() / 1000);
        authCtx.ExpiresIn = result.result.data.ExpiresIn + unixTimestamp;

        navigate(
          params.value.mode === "applicant" ? "/" : "/employer/organizations",
        );
      }

      if (result.error) {
        toast.add({
          title: "Login Failed",
          message: result.error,
          type: "destructive",
        });
      }
    } catch (err) {
      console.log("Something went wrong ::", err);

      toast.add({
        title: "Login Failed",
        message: "Something went wrong, Try Again",
        type: "destructive",
      });
    }
  });

  const redirectToGoogleLogin = $(() => {
    const domain = cognitoDomain;
    const clientId = poolClientId; // Replace with your actual app client ID

    const redirectUri = encodeURIComponent(oauthRedirectUrl);
    const state = encodeURIComponent(
      JSON.stringify({ mode: params.value.mode }),
    );

    const loginUrl = `${domain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&identity_provider=Google&scope=email+openid+profile&state=${state}`;

    window.location.href = loginUrl;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (params.value.code) {
      getTokens();
    }
  });

  return (
    <div>
      <LoadingOverlay open={state.loading}>Signing In</LoadingOverlay>
      <Button
        variant="outline"
        class={cn(
          "w-full border-gray-300",
          "flex items-center justify-center gap-1",
        )}
        onClick$={redirectToGoogleLogin}
      >
        <GoogleIcon class="bg-transparent text-gray-500 dark:text-gray-400" />
        <p class="bg-transparent">Google</p>
      </Button>
    </div>
  );
});
