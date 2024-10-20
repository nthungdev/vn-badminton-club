import { ApiResponse } from "@/src/lib/apiResponse";
import { HomeViewEvent } from "@/src/firebase/definitions/event";

export type EventsGetResponse = ApiResponse<{ events: HomeViewEvent[] }>

export type EventsJoinResponse = ApiResponse<undefined>
export type EventsLeaveResponse = ApiResponse<undefined>
export type EventsKickResponse = ApiResponse<undefined>