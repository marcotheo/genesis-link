import { component$ } from "@builder.io/qwik";

import Applications from "./Applications";
import PostDetails from "./PostDetails";

export default component$(() => {
  return (
    <div>
      <PostDetails />
      <Applications />
    </div>
  );
});
