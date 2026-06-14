import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, email, notes, tripDetails } = body;

    // Simulate sending email notification to the team
    console.log("\n\n==========================================");
    console.log(`✉️ EMAIL SIMULATION: New Trip Booking Request`);
    console.log("==========================================");
    console.log(`To: wazwanway-team@example.com`);
    console.log(`From: system@wazwanway.com`);
    console.log(`Subject: New Trip Booking Request — ${name} | ${tripDetails?.duration || "TBD"}`);
    console.log(`\n-- CONTACT INFO --`);
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Email: ${email}`);
    if (notes) console.log(`Notes: ${notes}`);
    console.log(`\n-- TRIP DETAILS --`);
    console.log(`Group Size: ${tripDetails?.people}`);
    console.log(`Dates: ${tripDetails?.duration}`);
    console.log(`Vibe: ${tripDetails?.vibe}`);
    console.log(`Budget: ${tripDetails?.budget}`);
    console.log(`Extras: ${tripDetails?.extras?.join(', ') || 'None'}`);
    console.log(`\nRequest Timestamp: ${new Date().toISOString()}`);
    console.log("==========================================\n\n");

    return NextResponse.json({ success: true, message: "Booking received" });
  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
