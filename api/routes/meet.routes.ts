import { Router } from "express";
import { createMeeting, joinMeeting, getMeeting } from "../controllers/meet.controller";

const router = Router();

router.post("/create", createMeeting);
router.post("/join", joinMeeting);
router.get("/:meetingId", getMeeting);

export default router;
