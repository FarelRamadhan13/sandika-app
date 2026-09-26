import { NextRequest, NextResponse } from "next/server";

// Try to use Firebase, but fall back gracefully for demo
let adminDb: FirebaseFirestore.Firestore | null = null;

async function getDb() {
  if (adminDb) return adminDb;
  try {
    const { adminDb: db } = await import("@/lib/firebase-admin");
    adminDb = db;
    return adminDb;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const scoreData = {
      sessionId: `session-${Date.now()}`,
      scenarioId: body.scenarioId,
      studentName: body.studentName || "Anonymous",
      userId: body.userId || "",
      timestamp: Date.now(),
      highlights: body.highlights || [],
      graphDiscovered: body.graphDiscovered || false,
      searchesPerformed: body.searchesPerformed || 0,
      sokraticInteractions: body.sokraticInteractions || 0,
      totalScore: body.totalScore || 0,
      maxScore: body.maxScore || 0,
      accuracy: body.accuracy || 0,
      completionTimeSeconds: body.completionTimeSeconds || 0,
    };

    // Try to save to Firebase
    const db = await getDb();
    if (db) {
      await db.collection("scores").add(scoreData);
    }

    return NextResponse.json({
      success: true,
      data: scoreData,
    });
  } catch (error) {
    console.error("Score API error:", error);
    return NextResponse.json(
      { error: "Failed to save score", success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const db = await getDb();

    if (db) {
      let query: FirebaseFirestore.Query = db
        .collection("scores")
        .orderBy("timestamp", "desc")
        .limit(50);

      // Filter by userId if provided
      if (userId) {
        query = db
          .collection("scores")
          .where("userId", "==", userId)
          .orderBy("timestamp", "desc")
          .limit(50);
      }

      const snapshot = await query.get();

      const scores = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ scores });
    }

    // Return mock data if no Firebase
    const mockScores = getMockScores();
    if (userId) {
      // Filter mock data for the specific user
      return NextResponse.json({
        scores: mockScores.filter((s) => s.userId === userId),
      });
    }

    return NextResponse.json({ scores: mockScores });
  } catch (error) {
    console.error("Score GET error:", error);
    return NextResponse.json({
      scores: getMockScores(),
    });
  }
}

function getMockScores() {
  const names = [
    "Aisyah Putri",
    "Budi Santoso",
    "Citra Dewi",
    "Dimas Prakoso",
    "Eka Saputra",
    "Fitri Handayani",
    "Galih Prasetyo",
    "Hana Safitri",
  ];

  return names.map((name, i) => ({
    id: `mock-${i}`,
    sessionId: `session-mock-${i}`,
    scenarioId: "scenario-1",
    studentName: name,
    userId: `mock-uid-${i}`,
    timestamp: Date.now() - i * 3600000,
    highlights: [],
    graphDiscovered: Math.random() > 0.3,
    searchesPerformed: Math.floor(Math.random() * 8) + 1,
    sokraticInteractions: Math.floor(Math.random() * 6),
    totalScore: Math.floor(Math.random() * 60) + 30,
    maxScore: 105,
    accuracy: Math.floor(Math.random() * 40) + 50,
    completionTimeSeconds: Math.floor(Math.random() * 600) + 180,
  }));
}
