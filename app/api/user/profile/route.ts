import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "UID is required", success: false },
        { status: 400 }
      );
    }

    // Try fetching from Firestore users collection
    const userDoc = await adminDb.collection("users").doc(uid).get();

    if (userDoc.exists) {
      return NextResponse.json({
        success: true,
        profile: {
          uid,
          ...userDoc.data(),
        },
      });
    }

    // If not in Firestore yet, get basic info from Firebase Auth
    let authUser = null;
    try {
      authUser = await adminAuth.getUser(uid);
    } catch (authErr) {
      console.warn("Auth user not found in Firebase Auth:", authErr);
    }

    const defaultProfile = {
      uid,
      displayName: authUser?.displayName || "Investigator",
      email: authUser?.email || "",
      school: "",
      grade: "",
      studentIdNumber: "",
      bio: "",
      createdAt: authUser?.metadata?.creationTime
        ? new Date(authUser.metadata.creationTime).getTime()
        : Date.now(),
      updatedAt: Date.now(),
      isNew: true,
    };

    return NextResponse.json({
      success: true,
      profile: defaultProfile,
    });
  } catch (error) {
    console.error("User profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, displayName, school, grade, studentIdNumber, bio, email } =
      body;

    if (!uid) {
      return NextResponse.json(
        { error: "UID is required", success: false },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const existingDoc = await userRef.get();
    const existingData = existingDoc.exists ? existingDoc.data() : null;

    const profileData = {
      uid,
      displayName: displayName || existingData?.displayName || "Investigator",
      email: email || existingData?.email || "",
      school: school !== undefined ? school : existingData?.school || "",
      grade: grade !== undefined ? grade : existingData?.grade || "",
      studentIdNumber:
        studentIdNumber !== undefined
          ? studentIdNumber
          : existingData?.studentIdNumber || "",
      bio: bio !== undefined ? bio : existingData?.bio || "",
      createdAt: existingData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    // Upsert to Firestore users collection
    await userRef.set(profileData, { merge: true });

    // Sync displayName with Firebase Auth if provided
    if (displayName) {
      try {
        await adminAuth.updateUser(uid, { displayName });
      } catch (authErr) {
        console.warn("Could not sync displayName to Firebase Auth:", authErr);
      }
    }

    // Also update studentName in scores if user has existing scores
    try {
      const scoresSnapshot = await adminDb
        .collection("scores")
        .where("userId", "==", uid)
        .get();

      if (!scoresSnapshot.empty) {
        const batch = adminDb.batch();
        scoresSnapshot.docs.forEach((doc) => {
          batch.update(doc.ref, {
            studentName: profileData.displayName,
            school: profileData.school,
            grade: profileData.grade,
          });
        });
        await batch.commit();
      }
    } catch (scoreUpdateErr) {
      console.warn("Could not sync name/school to past scores:", scoreUpdateErr);
    }

    return NextResponse.json({
      success: true,
      message: "Data pribadi berhasil disimpan",
      profile: profileData,
    });
  } catch (error) {
    console.error("User profile POST error:", error);
    return NextResponse.json(
      { error: "Failed to save user profile", success: false },
      { status: 500 }
    );
  }
}
