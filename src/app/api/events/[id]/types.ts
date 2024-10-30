export interface EventCreateRequest {
  title?: string
  startTimestamp?: Date
  endTimestamp?: Date
  slots?: number
}

export interface EventEditRequest {
  title?: string
  startTimestamp?: number
  endTimestamp?: number
  slots?: number
}
