import { Request, Response } from "express";
import { MeetService } from "../services/meet.service";

const meetService = new MeetService();

export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { hostId, title } = req.body;
    
    if (!hostId || !title) {
      return res.status(400).json({ error: "hostId y title son requeridos" });
    }
    
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

export const endMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    await meetService.endMeeting(meetingId);
    res.json({ success: true, message: "Reunión finalizada" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


export const getParticipants = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const meeting = await meetService.getMeeting(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: "Reunión no encontrada" });
    }
    res.json({ 
      participants: meeting.participants,
      count: meeting.participants.length 
    });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

