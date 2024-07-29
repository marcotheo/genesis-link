import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RegexValidations = {
  NumberOnly: /(^[0-9]+$|^$)/,
  NoNumber: /(^[a-zA-Z\s-'.]*$)/,
  MobileNumberNoZero: /^9\d{2}-\d{3}-\d{4}$/,
  Address: /(^[a-zA-Z0-9\s-'#.]*$)/,
  MobileNumber: /^[0-9-]*$/,
  hasNumber: /[0-9]/,
  acceptedNumberWithNine: /\b9+/,
  acceptedNumberWithZero: /\b09+/,
  mobileNumberReg: /^(09|\+639)\d{9}$/,
  hasLowerCase: /[a-z]/,
  hasUpperCase: /[A-Z]/,
  hasSpecialChar: /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/,
};
