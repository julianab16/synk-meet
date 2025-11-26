import { Request, Response } from "express";
import { MeetService } from "../services/meet.service";

const meetService = new MeetService();

/**
 * Meeting Controller
 * 
 * Handles HTTP requests for meeting management operations.
 * Each function validates input, calls the corresponding service method,
 * and returns appropriate HTTP responses.
 */

/**
 * Creates a new meeting.
 * 
 * @route POST /api/meet/create
 * @param {Request} req - Express request object
 * @param {Request.body.hostId} string - ID of the meeting host (required)
 * @param {Request.body.title} string - Title of the meeting (required)
 * @param {Response} res - Express response object
 * @returns {Object} Meeting object with meetingId, title, hostId, participants, etc.
 * @throws {400} Missing required fields or creation error
 */
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { hostId, title } = req.body;
    
    // Validate required fields
    if (!hostId || !title) {
      return res.status(400).json({ error: "hostId y title son requeridos" });
    }
    
    const meeting = await meetService.createMeeting(hostId, title);
    res.json(meeting);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Adds a user to an existing meeting.
 * 
 * @route POST /api/meet/join
 * @param {Request} req - Express request object
 * @param {Request.body.meetingId} string - ID of the meeting to join (required)
 * @param {Request.body.userId} string - ID of the user joining (required)
 * @param {Response} res - Express response object
 * @returns {Object} Object containing updated participants array
 * @throws {400} Meeting not found, inactive, full, or other errors
 */
export const joinMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId, userId } = req.body;
    const participants = await meetService.joinMeeting(meetingId, userId);
    res.json({ participants });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Retrieves meeting details by ID.
 * 
 * @route GET /api/meet/:meetingId
 * @param {Request} req - Express request object
 * @param {Request.params.meetingId} string - ID of the meeting (required)
 * @param {Response} res - Express response object
 * @returns {Object} Complete meeting object from database
 * @throws {404} Meeting not found
 */
export const getMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const meeting = await meetService.getMeeting(meetingId);
    res.json(meeting);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * Ends an active meeting by updating its status to 'finished'.
 * 
 * @route DELETE /api/meet/:meetingId
 * @param {Request} req - Express request object
 * @param {Request.params.meetingId} string - ID of the meeting to end (required)
 * @param {Response} res - Express response object
 * @returns {Object} Success confirmation message
 * @throws {400} Error ending the meeting
 */
export const endMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    await meetService.endMeeting(meetingId);
    res.json({ success: true, message: "Reunión finalizada" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Gets the list of participants in a meeting.
 * 
 * @route GET /api/meet/:meetingId/participants
 * @param {Request} req - Express request object
 * @param {Request.params.meetingId} string - ID of the meeting (required)
 * @param {Response} res - Express response object
 * @returns {Object} Object with participants array and count
 * @returns {Object.participants} string[] - Array of participant user IDs
 * @returns {Object.count} number - Total number of participants
 * @throws {404} Meeting not found
 */
export const getParticipants = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const meeting = await meetService.getMeeting(meetingId);
    
    // Additional validation for meeting existence
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