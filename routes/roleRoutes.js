

import { Router } from 'express'
import { authRole } from '../middlewares/auth.js'

const roleRouter = Router()

roleRouter.route('/authrole').get(authRole)

export default roleRouter