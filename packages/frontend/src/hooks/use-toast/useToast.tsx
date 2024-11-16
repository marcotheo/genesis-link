import { ToasterContext } from "~/providers/toaster/toaster";
import { useContext } from "@builder.io/qwik";

export const useToast = () => {
  const toasterCtx = useContext(ToasterContext);

  return {
    add: toasterCtx.addToast,
  };
};
