import { ApiResponse } from "@/lib/apiResponse";
import { HomeViewEvent } from "@/lib/firebase/definitions/event";

export type EventsGetResponse = ApiResponse<{ events: HomeViewEvent[] }>