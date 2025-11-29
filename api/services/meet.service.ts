import { db } from "../firebase";
import { v4 as uuid } from "uuid";

/**
 * MeetService
 * 
 * Business logic layer for meeting operations.
 * Handles all database interactions for meeting management including
 * creation, joining, ending, and retrieving meeting data.
 * 
 * @class MeetService
 */
export class MeetService {
    /**
   * Maximum number of participants allowed per meeting.
   * Can be configured via MAX_PARTICIPANTS environment variable.
   * Defaults to 50 if not specified.
   * 
   * @private
   * @readonly
   * @type {number}
   */
  private readonly maxParticipants = parseInt(process.env.MAX_PARTICIPANTS || "50");

  async createMeeting(hostId: string, title: string) {
    const meetingId = uuid().slice(0, 8);
    /**
   * Creates a new meeting in the database.
   * Generates a unique 8-character meeting ID and initializes
   * the meeting with the host as the first participant.
   * 
   * @async
   * @param {string} hostId - Unique identifier of the meeting host
   * @param {string} title - Title/name of the meeting
   * @returns {Promise<Object>} Created meeting object containing:
   *   - meetingId: Unique 8-character identifier
   *   - title: Meeting title
   *   - hostId: ID of the meeting host
   *   - participants: Array containing hostId
   *   - createdAt: Timestamp of creation
   *   - status: 'active' by default
   *   - maxParticipants: Maximum allowed participants
   * @throws {Error} If database write operation fails
   * 
   * @example
   * const meeting = await meetService.createMeeting('user123', 'Team Standup');
   * // Returns: { meetingId: 'a1b2c3d4', title: 'Team Standup', ... }
   */
    const data = {
      meetingId,
      title,
      hostId,
      participants: [hostId],
      createdAt: new Date(),
      status: "active",
      maxParticipants: this.maxParticipants,
    };

    await db.collection("meetings").doc(meetingId).set(data);
    return data;
  }
  /**
   * Adds a user to an existing meeting.
   * Validates meeting existence, status, and participant limit before adding.
   * Uses Set to prevent duplicate participants.
   * 
   * @async
   * @param {string} meetingId - Unique identifier of the meeting
   * @param {string} userId - Unique identifier of the user joining
   * @returns {Promise<string[]>} Updated array of participant user IDs
   * @throws {Error} "Meeting no existe" - If meeting is not found
   * @throws {Error} "La reunión ha finalizado" - If meeting status is not 'active'
   * @throws {Error} "La reunión está llena" - If meeting has reached max participants
   * 
   * @example
   * const participants = await meetService.joinMeeting('a1b2c3d4', 'user456');
   * // Returns: ['user123', 'user456']
   */
  async joinMeeting(meetingId: string, userId: string) {
    const ref = db.collection("meetings").doc(meetingId);
    const doc = await ref.get();

    if (!doc.exists) throw new Error("Meeting no existe");

    const meeting = doc.data()!;
    
    if (meeting.status !== "active") {
      throw new Error("La reunión ha finalizado");
    }

    // Verificar límite de participantes
    if (meeting.participants.length >= this.maxParticipants) {
      throw new Error("La reunión está llena");
    }

    const updatedParticipants = [...new Set([...meeting.participants, userId])];
    await ref.update({ participants: updatedParticipants });

    return updatedParticipants;
  }

  /**
   * Ends an active meeting by changing its status to 'finished'.
   * This prevents new users from joining the meeting.
   * 
   * @async
   * @param {string} meetingId - Unique identifier of the meeting to end
   * @returns {Promise<boolean>} Always returns true on success
   * @throws {Error} If database update operation fails
   * 
   * @example
   * await meetService.endMeeting('a1b2c3d4');
   * // Meeting status changed to 'finished'
   */
  async endMeeting(meetingId: string) {
    await db.collection("meetings").doc(meetingId).update({
      status: "finished",
    });

    return true;
  }

  /**
   * Retrieves complete meeting data from the database.
   * 
   * @async
   * @param {string} meetingId - Unique identifier of the meeting
   * @returns {Promise<Object>} Complete meeting object from Firestore
   * @throws {Error} "Meeting no existe" - If meeting is not found in database
   * 
   * @example
   * const meeting = await meetService.getMeeting('a1b2c3d4');
   * // Returns: { meetingId: 'a1b2c3d4', title: '...', participants: [...], ... }
   */
  async getMeeting(meetingId: string) {
    const doc = await db.collection("meetings").doc(meetingId).get();
    if (!doc.exists) throw new Error("Meeting no existe");
    return doc.data();
  }
}
