import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import listingsRouter from "./listings";
import favoritesRouter from "./favorites";
import statsRouter from "./stats";
import authRouter from "./auth";
import messagesRouter from "./messages";
import storageRouter from "./storage";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(usersRouter);
router.use(listingsRouter);
router.use(favoritesRouter);
router.use(statsRouter);
router.use(messagesRouter);
router.use(storageRouter);
router.use(adminRouter);

export default router;
