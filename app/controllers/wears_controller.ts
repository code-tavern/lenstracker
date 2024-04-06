import Wear from "#models/wear";
import { createWearValidator, updateWearValidator } from "#validators/wear";
import { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";

export default class WearsController {

  async index({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    const wears = await user.related("wears").query()
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

  // save info to db
  async store({ request, response, auth }: HttpContext) {
    const data = request.all()
    const user = await auth.authenticate()
    const payload = await createWearValidator.validate(data)
    console.log(payload)
    const wear = await Wear.create({ user_id: user.id, startDate: DateTime.fromISO(payload.start_date), endDate: DateTime.fromISO(payload.end_date) })
    console.log(wear.id)
    return response.redirect().back()
  }
  async destroy({ params, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const instance = await Wear.findOrFail(params.id)
    if (instance.userId !== user.id) {
      console.log("err: user does not match wear")
      throw new Error("invalid wear id")
    }
    console.log(instance)
    await instance.delete()
    return response.redirect().back()
  }
}
