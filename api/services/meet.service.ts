import { db } from "../firebase";
import { v4 as uuid } from "uuid";

export class MeetService {
  async createMeeting(hostId: string, title: string) {
    const meetingId = uuid().slice(0, 8); // código corto

    const data = {
      meetingId,
      title,
      hostId,
      participants: [hostId],
      createdAt: new Date(),
      status: "active",
    };

    await db.collection("meetings").doc(meetingId).set(data);

    return data;
  }

  async joinMeeting(meetingId: string, userId: string) {
    const ref = db.collection("meetings").doc(meetingId);
    const doc = await ref.get();

    if (!doc.exists) throw new Error("Meeting no existe");

    const meeting = doc.data()!;
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
