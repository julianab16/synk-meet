import { Router } from "express";
import { createMeeting, joinMeeting, getMeeting, endMeeting, getParticipants } from "../controllers/meet.controller";

/**
 * Meeting Routes Module
 * 
 * Defines all HTTP endpoints for meeting management operations.
 * Routes are prefixed with /api/meet in the main application.
 * 
 * @module meet.routes
 */

const router = Router();

/**
 * POST /api/meet/create
 * Creates a new meeting session.
 * 
 * @body {string} hostId - ID of the user creating the meeting (required)
 * @body {string} title - Title/name of the meeting (required)
 * 
 * @response 200 - Meeting created successfully with meetingId
 * @response 400 - Missing required fields or creation error
 */
router.post("/create", createMeeting);

/**
 * POST /api/meet/join
 * Adds a user to an existing meeting.
 * 
 * @body {string} meetingId - ID of the meeting to join (required)
 * @body {string} userId - ID of the user joining (required)
 * 
 * @response 200 - User added successfully, returns updated participants list
 * @response 400 - Meeting not found, inactive, full, or user already joined
 */
router.post("/join", joinMeeting);

/**
 * GET /api/meet/:meetingId
 * Retrieves complete details of a specific meeting.
 * 
 * @param {string} meetingId - Unique identifier of the meeting
 * 
 * @response 200 - Returns meeting object with all details
 * @response 404 - Meeting not found
 */
router.get("/:meetingId", getMeeting);

/**
 * GET /api/meet/:meetingId/participants
 * Gets the list of all participants in a meeting.
 * 
 * @param {string} meetingId - Unique identifier of the meeting
 * 
 * @response 200 - Returns array of participant IDs and total count
 * @response 404 - Meeting not found
 */
router.get("/:meetingId/participants", getParticipants);

/**
 * PATCH /api/meet/:meetingId/end
 * Ends an active meeting by changing its status to 'finished'.
 * Only the meeting host should typically call this endpoint.
 * 
 * @param {string} meetingId - Unique identifier of the meeting to end
 * 
 * @response 200 - Meeting ended successfully
 * @response 400 - Error ending the meeting (e.g., already finished)
 */
router.patch("/:meetingId/end", endMeeting);

/**
 * Export the configured router to be mounted in the main Express application.
 * Typically mounted at /api/meet prefix.
 */
export default router;