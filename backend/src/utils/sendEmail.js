import { Resend } from "resend";

export const sendOtpEmail = async (to, otp) => {
  // We'll log it for local dev since credentials might not be set up yet
  console.log(`\n============================`);
  console.log(`[DEV MODE] OTP generated for ${to}: ${otp}`);
  console.log(`============================\n`);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Wazwan Way <nasirkirmani@wazwanway.com>", // Make sure to use your verified domain
      to: [to],
      subject: "Verify Your Wazwan Way Account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Wazwan Way</h2>
          <p>Hello!</p>
          <p>Thank you for joining Wazwan Way. To complete your registration, please enter the following 6-digit verification code:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      console.log("Email sent successfully via Resend:", data);
    }
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

export const sendPasswordResetEmail = async (to, otp) => {
  console.log(`\n============================`);
  console.log(`[DEV MODE] Password Reset OTP generated for ${to}: ${otp}`);
  console.log(`============================\n`);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Wazwan Way <nasirkirmani@wazwanway.com>", 
      to: [to],
      subject: "Password Reset Request - Wazwan Way",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Wazwan Way</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your Wazwan Way account. Please enter the following 6-digit verification code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      console.log("Password reset email sent successfully via Resend:", data);
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

export const sendTripQueryEmail = async (queryData) => {
  const {
    userName,
    userPhone,
    userEmail,
    duration,
    travelParty,
    travelSeason,
    budgetTier,
    selectedInterests,
    adultsCount,
    childrenCount,
    seniorsCount,
    arrivalDate,
    leavingDate,
    itinerarySummary
  } = queryData;

  const to = "nasirkirmani@wazwanway.com";

  console.log(`\n============================`);
  console.log(`[DEV MODE] Trip Query received from ${userName} (${userEmail})`);
  console.log(`============================\n`);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Wazwan Way Concierge <nasirkirmani@wazwanway.com>",
      to: [to],
      subject: `New Trip Query from ${userName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">New Trip Planner Query</h2>
          <p><strong>Contact Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Phone:</strong> ${userPhone}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
          </ul>
          <p><strong>Trip Parameters:</strong></p>
          <ul>
            <li><strong>Duration:</strong> ${duration} Days</li>
            <li><strong>Travel Party:</strong> ${travelParty} (${adultsCount} Adults, ${childrenCount} Children, ${seniorsCount} Seniors)</li>
            <li><strong>Season:</strong> ${travelSeason}</li>
            <li><strong>Dates:</strong> ${arrivalDate ? new Date(arrivalDate).toLocaleDateString('en-IN') : 'N/A'} - ${leavingDate ? new Date(leavingDate).toLocaleDateString('en-IN') : 'N/A'}</li>
            <li><strong>Budget Tier:</strong> ${budgetTier}</li>
            <li><strong>Culinary Interests:</strong> ${selectedInterests ? selectedInterests.join(', ') : 'None'}</li>
          </ul>
          ${itinerarySummary ? `
          <p><strong>Proposed Itinerary Summary:</strong></p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #D4AF37; border-radius: 4px;">
            <p><strong>Title:</strong> ${itinerarySummary.title || 'N/A'}</p>
            <p><strong>Estimated Cost:</strong> ${itinerarySummary.summary?.totalEstCost || 'N/A'}</p>
            <p><strong>Key Dining Stops:</strong> ${itinerarySummary.spots ? itinerarySummary.spots.join(', ') : 'N/A'}</p>
          </div>
          ` : ''}
          <p style="font-size: 11px; color: #888; margin-top: 30px;">Sent programmatically via Wazwan Way Concierge</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      console.log("Trip query email sent successfully via Resend:", data);
    }
  } catch (err) {
    console.error("Error sending trip query email:", err);
  }
};

export const sendRestaurantLeadEmail = async (leadData) => {
  const {
    restaurantName,
    ownerName,
    phoneNumber,
    location,
    description
  } = leadData;

  const to = "nasirkirmani@wazwanway.com";

  console.log(`\n============================`);
  console.log(`[DEV MODE] Partner listing request received for ${restaurantName}`);
  console.log(`============================\n`);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Wazwan Way Partners <nasirkirmani@wazwanway.com>",
      to: [to],
      subject: `New Restaurant Listing Request: ${restaurantName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">New Restaurant Listing Request</h2>
          <p>A new restaurant partner listing request has been submitted on Wazwan Way. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 180px;">Restaurant Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${restaurantName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Owner Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Contact Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${phoneNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Location / Address:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${location}</td>
            </tr>
            ${description ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Description:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${description}</td>
            </tr>
            ` : ""}
          </table>
          <p style="margin-top: 25px;">You can review and manage this request in the <a href="https://wazwanway.com/admin" style="color: #D4AF37; text-decoration: none; font-weight: bold;">Wazwan Way Admin Panel</a>.</p>
          <p style="font-size: 11px; color: #888; margin-top: 30px;">Sent programmatically via Wazwan Way Partners Notification System</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
    } else {
      console.log("Restaurant lead email sent successfully via Resend:", data);
    }
  } catch (err) {
    console.error("Error sending restaurant lead email:", err);
  }
};
