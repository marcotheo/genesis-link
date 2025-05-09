import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

interface Props {
  htmlLink: string;
}

export default component$<Props>(({ htmlLink }) => {
  const htmlContent = useSignal("");

  const setHtmlContent = $(async () => {
    try {
      const DOMPurify = (await import("isomorphic-dompurify")).default;

      const data = await fetch(htmlLink).then((response) => response.text());
      const cleanHTML = DOMPurify.sanitize(data);

      htmlContent.value = cleanHTML;
    } catch (err) {
      console.error("unable to set html content");
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    setHtmlContent();
  });

  return (
    <div>
      <div dangerouslySetInnerHTML={htmlContent.value} />
    </div>
  );
});
