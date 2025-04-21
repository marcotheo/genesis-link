import relativeTime from "dayjs/plugin/relativeTime";
import { type ClassValue, clsx } from "clsx";
import { Signal } from "@builder.io/qwik";
import { twMerge } from "tailwind-merge";
import { $ } from "@builder.io/qwik";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";

import { baseApiUrl } from "./constants";

dayjs.extend(relativeTime);
dayjs.extend(utc); // Add UTC support

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

export const capitalizeFirstLetter = (input: string) => {
  if (!input) return input; // Handle empty or null strings
  return input.charAt(0).toUpperCase() + input.slice(1);
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
    requestUrl = requestUrl + "/api/v1" + url;
  }

  const response = await fetch(requestUrl, options);

  if (!response.ok) {
    let errorMessage = "An unknown error occurred";
    let raw = "";

    try {
      raw = await response.text(); // ✅ Read once
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object" && parsed.message) {
        errorMessage = parsed.message;
      } else {
        errorMessage = raw;
      }
    } catch {
      errorMessage = raw || "An unknown error occurred";
    }

    throw { status: response.status, message: errorMessage };
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
    requestUrl = requestUrl + "/api/v1" + url;
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

export const generateRandomId = (length = 10) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomId = "";
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return randomId;
};

export const createDashboardPath = (orgId: string, path: string) => {
  return `/employer/organizations/dashboard/${orgId}` + path;
};

export const defaultCountry = "Philippines";

export const timeAgo = (timestamp: number): string => {
  const now = dayjs().startOf("day"); // Start of today (00:00)
  const date = dayjs.unix(timestamp).utc().local(); // Convert to local time
  const startOfDay = date.startOf("day"); // Start of the timestamp’s day
  const diffDays = now.diff(startOfDay, "day"); // Difference in full days

  if (diffDays === 0) return "today"; // Same calendar day
  if (diffDays === 1) return "yesterday"; // Previous calendar day
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`;
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? "s" : ""} ago`;

  return `${Math.floor(diffDays / 365)} year${diffDays >= 730 ? "s" : ""} ago`;
};

export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
