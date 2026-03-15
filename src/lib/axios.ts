import axios from "axios";
import { joinUrl } from "@/lib/utils";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
  ? joinUrl(process.env.NEXT_PUBLIC_API_URL, "")
  : undefined;

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
