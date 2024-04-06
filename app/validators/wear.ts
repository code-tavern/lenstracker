import vine from '@vinejs/vine'

export const createWearValidator = vine.compile(
  vine.object({
    start_date: vine.string(),
    end_date: vine.string()
  })
)

export const updateWearValidator = vine.compile(
  vine.object({
    start_date: vine.string(),
    end_date: vine.string()
  })
)
