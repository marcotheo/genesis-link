import { routeLoader$ } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";

import Applications from "./Applications";
import PostDetails from "./PostDetails";

export const usePostId = routeLoader$(({ params }) => {
  const { postId } = params; // Extract the route parameter

  return {
    postId,
  };
});

export default component$(() => {
  return (
    <div>
      <PostDetails />
      <Applications />
    </div>
  );
});
