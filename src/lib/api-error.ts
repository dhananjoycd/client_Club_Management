import axios from "axios";

const isGenericClientMessage = (message: string) => {
  const normalized = message.trim().toLowerCase();

  return [
    "network error",
    "request failed",
    "something went wrong",
    "internal server error",
    "failed to fetch",
    "cancelederror",
    "canceled",
  ].some((item) => normalized.includes(item));
};

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (
      typeof responseMessage === "string" &&
      responseMessage.trim() &&
      !isGenericClientMessage(responseMessage)
    ) {
      return responseMessage;
    }

    if (
      typeof error.message === "string" &&
      error.message.trim() &&
      !isGenericClientMessage(error.message)
    ) {
      return error.message;
    }
  }

  if (
    error instanceof Error &&
    error.message.trim() &&
    !isGenericClientMessage(error.message)
  ) {
    return error.message;
  }

  return fallback;
}
