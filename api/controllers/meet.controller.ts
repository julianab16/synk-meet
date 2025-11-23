import { Request, Response } from "express";
import { MeetService } from "../services/meet.service";

const meetService = new MeetService();

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { hostId, title } = req.body;
    const meeting = await meetService.createMeeting(hostId, title);
    res.json(meeting);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const joinMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId, userId } = req.body;
    const participants = await meetService.joinMeeting(meetingId, userId);
    res.json({ participants });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const meeting = await meetService.getMeeting(meetingId);
    res.json(meeting);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};
