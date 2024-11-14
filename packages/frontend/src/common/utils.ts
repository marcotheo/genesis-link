import { type ClassValue, clsx } from "clsx";
import { Signal } from "@builder.io/qwik";
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

export const PHpeso = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PHP",
});

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

  // Check if there’s a body to parse
  const contentLength = response.headers.get("Content-Length");
  if (response.status === 204 || contentLength === "0") {
    return null as T;
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

export const qwikFetchWithProgress = async <T>(
  url: string,
  options: RequestInit,
  progressSignal: Signal<number | null>,
): Promise<T | null> => {
  return new Promise<T | null>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(options.method || "GET", url);

    // Set request headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value as string);
      });
    }

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        progressSignal.value = percentComplete;
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (xhr.responseText) {
          resolve(JSON.parse(xhr.responseText) as T);
        } else {
          resolve(null);
        }
      } else {
        reject({
          status: xhr.status,
          message: xhr.statusText || "Upload failed",
        });
      }
    };

    xhr.onerror = () =>
      reject({ status: xhr.status, message: "Network error" });

    xhr.send(options.body as any);
  });
};

export const setCookie = $((name: string, value: string, expiresIn: number) => {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
  const tenMinutesFromNow = now + expiresIn;

  // Convert the Unix timestamp to a date string in the GMT format
  const expiryDate = new Date(tenMinutesFromNow * 1000).toUTCString();

  // Set the cookie with the calculated expiration time
  document.cookie = `${name}=${value}; expires=${expiryDate}; path=/;`;
});
