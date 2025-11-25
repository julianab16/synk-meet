import { Router } from "express";
import { createMeeting, joinMeeting, getMeeting, endMeeting, getParticipants } from "../controllers/meet.controller";

const router = Router();

router.post("/create", createMeeting);
router.post("/join", joinMeeting);
router.get("/:meetingId", getMeeting);
router.get("/:meetingId/participants", getParticipants);
router.patch("/:meetingId/end", endMeeting);


export default router;
