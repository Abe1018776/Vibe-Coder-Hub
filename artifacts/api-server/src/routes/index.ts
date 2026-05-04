import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import gigsRouter from "./gigs";
import freelancersRouter from "./freelancers";
import availabilityRouter from "./availability";
import showcaseRouter from "./showcase";
import tagsRouter from "./tags";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(gigsRouter);
router.use(freelancersRouter);
router.use(availabilityRouter);
router.use(showcaseRouter);
router.use(tagsRouter);
router.use(statsRouter);

export default router;
