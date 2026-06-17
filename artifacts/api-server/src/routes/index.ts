import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authOtpRouter from "./authOtp";
import deliveryRouter from "./delivery";
import paymentRouter from "./payments";
import notificationRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authOtpRouter);
router.use(deliveryRouter);
router.use(paymentRouter);
router.use(notificationRouter);

export default router;
