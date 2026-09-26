import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const scoreData = {
      sessionId: `session-${Date.now()}`,
      scenarioId: body.scenarioId || "scenario-1",
      studentName: body.studentName || "Investigator",
      userId: body.userId || "",
      school: body.school || "",
      grade: body.grade || "",
      studentIdNumber: body.studentIdNumber || "",
      timestamp: Date.now(),
      highlights: body.highlights || [],
      graphDiscovered: Boolean(body.graphDiscovered),
      searchesPerformed: Number(body.searchesPerformed) || 0,
      sokraticInteractions: Number(body.sokraticInteractions) || 0,
      totalScore: Number(body.totalScore) || 0,
      maxScore: Number(body.maxScore) || 115,
      accuracy: Number(body.accuracy) || 0,
      completionTimeSeconds: Number(body.completionTimeSeconds) || 0,
    };

    // Save to Firebase Firestore collection 'scores'
    const docRef = await adminDb.collection("scores").add(scoreData);

    // If userId is present, also ensure user document has personal data recorded
    if (body.userId) {
      try {
        const userRef = adminDb.collection("users").doc(body.userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          await userRef.set({
            uid: body.userId,
            displayName: scoreData.studentName,
            email: body.email || "",
            school: scoreData.school,
            grade: scoreData.grade,
            studentIdNumber: scoreData.studentIdNumber,
            bio: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        } else if (body.school || body.grade || body.studentName) {
          const updatePayload: Record<string, unknown> = {
            updatedAt: Date.now(),
          };
          if (body.school) updatePayload.school = body.school;
          if (body.grade) updatePayload.grade = body.grade;
          if (body.studentIdNumber)
            updatePayload.studentIdNumber = body.studentIdNumber;
          if (body.studentName) updatePayload.displayName = body.studentName;
          await userRef.update(updatePayload);
        }
      } catch (profileSyncErr) {
        console.warn("Could not sync user personal data:", profileSyncErr);
      }
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      data: {
        id: docRef.id,
        ...scoreData,
      },
    });
  } catch (error) {
    console.error("Score API POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan skor ke Firebase", success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Query by userId without composite index requirements, then sort descending by timestamp in memory
      const snapshot = await adminDb
        .collection("scores")
        .where("userId", "==", userId)
        .get();

      const scores = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort(
          (a: any, b: any) =>
            (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0)
        );

      return NextResponse.json({ scores });
    }

    // If no userId, fetch all scores ordered by timestamp (single field index works automatically)
    const snapshot = await adminDb
      .collection("scores")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const scores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ scores });
  } catch (error) {
    console.error("Score API GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dari Firebase", scores: [] },
      { status: 500 }
    );
  }
}
