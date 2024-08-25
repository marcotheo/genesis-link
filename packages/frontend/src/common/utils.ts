import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { baseApiUrl } from "./constants";
import { $ } from "@builder.io/qwik";

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

// Define a helper function for fetch requests
export const qwikFetch = async <T>(
  url?: string,
  options?: RequestInit,
): Promise<T> => {
  let requestUrl: string = baseApiUrl;

  if (url && url.includes("http")) {
    requestUrl = url;
  } else {
    requestUrl = requestUrl + url;
  }

  const response = await fetch(requestUrl, options);

  if (!response.ok) {
    const err = await response.text();
    const errorMessage = JSON.parse(err) as { message: string };
    throw { status: response.status, message: errorMessage.message };
  }

  const data: T = await response.json();
  return data;
};

// Define a helper function for fetch requests
export const rawFetch = async <T>(
  url?: string,
  options?: RequestInit,
): Promise<{
  result: T;
  response: Response;
}> => {
  let requestUrl: string = baseApiUrl;

  if (url && url.includes("http")) {
    requestUrl = url;
  } else {
    requestUrl = requestUrl + url;
  }

  const response = await fetch(requestUrl, options);

  if (!response.ok) {
    const err = await response.text();
    const errorMessage = JSON.parse(err) as { message: string };
    throw { status: response.status, message: errorMessage.message };
  }

  const data: T = await response.json();
  return {
    result: data,
    response,
  };
};

export const setCookie = $((name: string, value: string, expiresIn: number) => {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  const tenMinutesFromNow = now + expiresIn;

  // Convert the Unix timestamp to a date string in the GMT format
  const expiryDate = new Date(tenMinutesFromNow * 1000).toUTCString();

  // Set the cookie with the calculated expiration time
  document.cookie = `${name}=${value}; expires=${expiryDate}; path=/;`;
});
