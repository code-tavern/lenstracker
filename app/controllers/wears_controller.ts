import Wear from "#models/wear";
import { createWearValidator, updateWearValidator } from "#validators/wear";
import { HttpContext } from "@adonisjs/core/http";
import { DateTime, Duration } from "luxon";

export default class WearsController {

  async index({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    const wears = await user.related("wears").query()
    const dayDurations: Array<{ date: DateTime, duration: Duration }> = []

    for (const w of wears) {
      const day = w.startDate
      if (dayDurations.find((e) => e.date.hasSame(day, "day"))) {
        console.log("found same date already")
      } else {
        const sameDayDates = wears.filter((e) => day.hasSame(e.startDate, "day") && e.id !== w.id)
        let duration = Duration.fromMillis(sameDayDates.reduce((prev, curr) => {
          return prev + (curr.endDate?.diff(curr.startDate)?.toMillis() ?? 0)
        }, (w?.endDate?.diff(day).toMillis()) ?? 0))
        dayDurations.push({ date: day, duration })
      }
    }
    console.log(dayDurations)
    return view.render("pages/app/wear/index", { wears })
  }
  // show creation page
  async create({ view }: HttpContext) {
    return view.render("pages/app/wear/create")
  }

  async edit({ view, auth, params }: HttpContext) {
    const user = await auth.authenticate()
    const wear = await Wear.findOrFail(params.id)
    if (user.id !== wear.userId) {
      throw new Error("invalid data")
    }
    return view.render("pages/app/wear/edit", { wear: { id: wear.id, startDate: wear.startDate.toFormat("yyyy-LL-dd'T'HH:mm"), endDate: wear.endDate.toFormat("yyyy-LL-dd'T'HH:mm") } })
  }
  async update({ auth, params, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const wear = await Wear.findOrFail(params.id)
    if (user.id !== wear.userId) {
      throw new Error("invalid data")
    }
    const data = request.all()
    const payload = await updateWearValidator.validate(data)
    wear.startDate = DateTime.fromISO(payload.start_date)
    wear.endDate = DateTime.fromISO(payload.end_date)
    await wear.save()
    return response.redirect().toRoute("wear.index")
  }
  async wear({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    let wear = await Wear.query().andWhere("user_id", user.id).andWhereNull("end_date").first()
    const payload = request.all()
    console.log(wear)
    if (!wear) {
      wear = await Wear.create({ userId: user.id, startDate: DateTime.now() })
    } else {
      wear.endDate = payload.endDate ? DateTime.fromISO(payload.endDate) : DateTime.now()
    }
    await wear.save()
    console.log(wear)
    return response.redirect().back()
  }
  // save info to db
  async store({ request, response, auth }: HttpContext) {
    const data = request.all()
    const user = await auth.authenticate()
    const payload = await createWearValidator.validate(data)
    const wear = await Wear.create({ user_id: user.id, startDate: DateTime.fromISO(payload.start_date), endDate: DateTime.fromISO(payload.end_date) })
    return response.redirect().back()
  }
  async destroy({ params, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const instance = await Wear.findOrFail(params.id)
    if (instance.userId !== user.id) {
      throw new Error("invalid wear id")
    }
    await instance.delete()
    return response.redirect().back()
  }
}
