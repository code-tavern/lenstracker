import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  public async redirectToProvider({ ally, params }: HttpContext) {
    const driver = ally.use(params.provider)
    return driver.redirect()
  }
  public login({ view }: HttpContext) {
    return view.render("pages/login")
  }
  public async callback({ ally, auth, params, response }: HttpContext) {
    const driver = ally.use(params.provider)
    const driverUser = await driver.user()
    let user = await User.findBy('email', driverUser.email)
    //TODO if provider id already exists, check if it matches, if not return error
    if (!user) {
      user = new User()
      user.email = driverUser.email
      switch (params.provider) {
        case 'github':
          user.githubId = driverUser.id
          user.fullName = driverUser.original.login
          break
        case 'google':
          user.googleId = driverUser.id
          break
      }
      await user.save()
    }
    await auth.use('web').login(user)
    return response.redirect().toPath('/')
  }
}
