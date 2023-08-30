

import {Router} from 'express'
import { adminAuth } from '../middlewares/auth.js'
import {registerAdmin,logInAdmin,logOutAdmin,
        logOutFromAllDevices,deleteAdminAccount,
        getAdminDetails,updateAdminDetails,
        updateAdminPassword} from '../controllers/adminController.js'

const adminRouter = Router()


adminRouter.route("/admin/register").post(registerAdmin)

adminRouter.route("/admin/login").post(logInAdmin)

adminRouter.route("/admin/logout").get(adminAuth,logOutAdmin)

adminRouter.route("/admin/logoutall").get(adminAuth,logOutFromAllDevices)

adminRouter.route("/admin").get(adminAuth,getAdminDetails)
                         .patch(adminAuth,updateAdminDetails)
                         .delete(adminAuth,deleteAdminAccount)

adminRouter.route("/admin/password").post(adminAuth,updateAdminPassword)



export default adminRouter
