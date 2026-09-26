import { NextRequest, NextResponse } from "next/server";
import scenariosData from "@/data/scenarios.json";
import { adminDb } from "@/lib/firebase-admin";
import type { Scenario } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    // 1. Base scenarios from local JSON
    const baseScenarios: Scenario[] = (scenariosData.scenarios || []) as Scenario[];

    // 2. Fetch AI-generated scenarios stored in Firebase Firestore
    let firestoreScenarios: Scenario[] = [];
    try {
      const snapshot = await adminDb
        .collection("scenarios")
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      firestoreScenarios = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Scenario;
      });
    } catch (err) {
      console.warn("Could not fetch scenarios from Firestore, using base:", err);
    }

    // Merge base scenarios and Firestore scenarios (avoid duplicates by id)
    const seenIds = new Set<string>();
    const allScenarios: Scenario[] = [];

    for (const sc of [...firestoreScenarios, ...baseScenarios]) {
      if (!seenIds.has(sc.id)) {
        seenIds.add(sc.id);
        allScenarios.push(sc);
      }
    }

    return NextResponse.json({
      success: true,
      scenarios: allScenarios,
    });
  } catch (error) {
    console.error("Scenarios GET error:", error);
    return NextResponse.json({
      success: true,
      scenarios: scenariosData.scenarios as Scenario[],
    });
  }
}
