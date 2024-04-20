/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import AuthController from '#controllers/auth_controller'
import { middleware } from './kernel.js'
import WearsController from '#controllers/wears_controller'

router.get('/', async ({ auth, view }) => {
  //await auth.authenticate()
  return view.render('pages/home')
})
router.get('/login', [AuthController, 'login'])
router.get('/auth/:provider/redirect', [AuthController, 'redirectToProvider']).where('provider', /github/).as('auth.redirect')
router.get('/auth/:provider/callback', [AuthController, 'callback']).where('provider', /github/)

router.group(() => {
  router.resource("wear", WearsController)
  router.post("/wear/wear", [WearsController, "wear"]).as("wear.wear")
}).use(middleware.auth()).prefix("/app")
