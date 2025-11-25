import { db } from "../firebase";
import { v4 as uuid } from "uuid";

export class MeetService {
  private readonly maxParticipants = parseInt(process.env.MAX_PARTICIPANTS || "50");

  async createMeeting(hostId: string, title: string) {
    const meetingId = uuid().slice(0, 8);

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

  async endMeeting(meetingId: string) {
    await db.collection("meetings").doc(meetingId).update({
      status: "finished",
    });

    return true;
  }

  async getMeeting(meetingId: string) {
    const doc = await db.collection("meetings").doc(meetingId).get();
    if (!doc.exists) throw new Error("Meeting no existe");
    return doc.data();
  }
}
