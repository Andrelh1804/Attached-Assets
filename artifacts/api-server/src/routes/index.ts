import { Router, type IRouter } from "express";
import { tenantGuard } from "../middlewares/tenantResolver";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import crmRouter from "./crm";
import ticketsRouter from "./tickets";
import hrRouter from "./hr";
import financeRouter from "./finance";
import fieldServiceRouter from "./field-service";
import omnichannelRouter from "./omnichannel";
import aiRouter from "./ai";
import gamificationRouter from "./gamification";
import automationsRouter from "./automations";
import stripeRouter from "./stripe";
import contractsRouter from "./contracts";
import customerSuccessRouter from "./customer-success";
import businessHealthRouter from "./business-health";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(stripeRouter);

const dataRouter: IRouter = Router();
dataRouter.use(tenantGuard);
dataRouter.use(dashboardRouter);
dataRouter.use(businessHealthRouter);
dataRouter.use(contractsRouter);
dataRouter.use(customerSuccessRouter);
dataRouter.use(crmRouter);
dataRouter.use(ticketsRouter);
dataRouter.use(hrRouter);
dataRouter.use(financeRouter);
dataRouter.use(fieldServiceRouter);
dataRouter.use(omnichannelRouter);
dataRouter.use(aiRouter);
dataRouter.use(gamificationRouter);
dataRouter.use(automationsRouter);
router.use(dataRouter);

router.use(adminRouter);

export default router;
