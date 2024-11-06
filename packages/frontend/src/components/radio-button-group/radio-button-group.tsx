import { component$, InputHTMLAttributes } from "@builder.io/qwik";
import InputError from "../input-error/input-error";
import { cn } from "~/common/utils";

type IOption = { value: string; label: string };

const Checker = component$<{
  option: IOption;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
}>(({ option, inputProps }) => {
  return (
    <div
      class={cn(
        "relative w-5 h-5",
        "flex items-center justify-center",
        "rounded-full overflow-hidden",
        "bg-transparent border-2",
        inputProps.value === option.value ? "border-primary" : "border-input",
        "duration-200 ease-out",
        "group-hover:ring-8 ring-soft",
      )}
    >
      <input
        {...inputProps}
        type="radio"
        value={option.value}
        checked={inputProps.value === option.value}
        onChange$={[inputProps.onChange$]}
        class="peer bg-transparent appearance-none"
      />

      <div
        class={cn(
          "w-3 h-3",
          "brightness-125 rounded-full",
          "animate-fade-out-scale",
          "peer-checked:bg-primary",
          "peer-checked:animate-fade-in-scale peer-checked:block",
        )}
      />
    </div>
  );
});

interface RadioButtonGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  options: IOption[];
  label?: string;
  errorMsg?: string;
}

export default component$<RadioButtonGroupProps>(
  ({ options, label, errorMsg, ...props }) => {
    return (
      <div>
        <p>{label ?? ""}</p>
        <div class="flex flex-col gap-2 mt-1">
          {options.map((option) => (
            <label
              class="group flex items-center gap-3 w-fit"
              key={option.value}
            >
              <Checker option={option} inputProps={props} />

              <span class="text-text font-primary">{option.label}</span>
            </label>
          ))}
        </div>

        <InputError errorMsg={errorMsg} />
      </div>
    );
  },
);
