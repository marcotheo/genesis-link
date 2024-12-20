import {
  component$,
  InputHTMLAttributes,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { TbList, TbListNumbers } from "@qwikest/icons/tablericons";
import Quill from "quill";

import InputError from "../input-error/input-error";
import { cn } from "~/common/utils";
import "quill/dist/quill.core.css";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errorMsg?: string;
  label?: string;
  placeholder?: string;
  value?: string;
}

export default component$(
  ({ label, placeholder, errorMsg, ...props }: Props) => {
    const inputValue = useSignal(props.value ?? "");
    const inputRef = useSignal<HTMLInputElement>();

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
      const options = {
        placeholder: placeholder ?? "Write Content Here ...",

        modules: {
          toolbar: "#toolbar",
        },
      };

      const quill = new Quill("#editor", options as any);

      if (!!inputValue.value)
        quill.clipboard.dangerouslyPasteHTML(inputValue.value as any);

      // Listen to Quill's 'text-change' event
      quill.on("text-change", () => {
        const htmlContent = quill.root.innerHTML as any;
        if (!inputRef.value) return;
        inputValue.value = htmlContent;
        inputRef.value.value = htmlContent;
        inputRef.value.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });

    return (
      <div>
        <input
          {...props}
          class="hidden"
          ref={inputRef}
          value={inputValue.value}
        />

        <div class="space-y-3">
          {label ? <p class="font-semibold">{label}</p> : null}

          <div
            id="toolbar"
            class={cn(
              "flex items-center gap-3 p-1",
              "border border-soft rounded-sm",
            )}
          >
            <select class="ql-size rounded-md p-3">
              <option selected>normal</option>
              <option value="huge">huge</option>
              <option value="large">large</option>
              <option value="small">small</option>
            </select>

            <div class="flex items-center">
              <button
                class={cn(
                  "ql-bold w-7",
                  "text-xl text-text hover:text-primary",
                )}
              >
                B
              </button>
              <button
                class={cn(
                  "ql-italic w-7",
                  "text-xl text-text hover:text-primary",
                  "font-serif italic",
                )}
              >
                I
              </button>
              <button
                class={cn(
                  "ql-underline w-7",
                  "text-xl text-text hover:text-primary",
                  "underline",
                )}
              >
                U
              </button>
              <button
                class={cn(
                  "ql-strike w-7",
                  "text-xl text-text hover:text-primary",
                  "line-through",
                )}
              >
                S
              </button>
            </div>

            <div class="flex items-center">
              <button
                class={cn(
                  "ql-list w-7",
                  "text-2xl text-text hover:text-primary",
                )}
                value="ordered"
              >
                <TbListNumbers />
              </button>
              <button
                class={cn(
                  "ql-list w-7",
                  "text-2xl text-text hover:text-primary",
                )}
                value="bullet"
              >
                <TbList />
              </button>
            </div>
          </div>

          <div
            id="editor"
            class={cn(
              "w-full border border-soft",
              "focus-within:ring-2 focus-within:ring-primary",
              "duration-300",
            )}
          ></div>

          <InputError errorMsg={errorMsg} />
        </div>
      </div>
    );
  },
);
