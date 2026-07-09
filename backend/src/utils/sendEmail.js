
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
      from: "Wazwan Way <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com", // Make sure to use your verified domain
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
      from: "Wazwan Way <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
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

  const to = "wazwanway@gmail.com";

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
      from: "Wazwan Way Concierge <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
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

  const to = "wazwanway@gmail.com";

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
      from: "Wazwan Way Partners <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
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

export const sendTravelAgencyLeadEmail = async (agencyData) => {
  const { agencyName, ownerName, contactNumber, email, description } = agencyData;
  const to = "wazwanway@gmail.com";

  console.log(`\n============================`);
  console.log(`[DEV MODE] Travel Agency listing request received for ${agencyName}`);
  console.log(`============================\n`);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Wazwan Way Partners <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
      to: [to],
      subject: `New Travel Agency Listing Request: ${agencyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">New Travel Agency Listing Request</h2>
          <p>A new travel agency partner listing request has been submitted on Wazwan Way. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 180px;">Agency Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agencyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Owner Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Contact Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
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
      console.log("Travel agency lead email sent successfully via Resend:", data);
    }
  } catch (err) {
    console.error("Error sending travel agency lead email:", err);
  }
};

export const sendAgencySubmissionEmail = async (agency) => {
  const to = "wazwanway@gmail.com";

  console.log(`\n============================`);
  console.log(`[DEV MODE] Agency Profile Submitted for Review: ${agency.agencyName}`);
  console.log(`============================\n`);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Wazwan Way Partners <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
      to: [to],
      subject: `New Travel Agency Submitted for Review: ${agency.agencyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">New Agency Submitted for Review</h2>
          <p>A travel agency has completed their profile and submitted it for admin review. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 180px;">Agency Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agency.agencyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Owner Name:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agency.ownerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Contact Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agency.contactNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agency.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">City:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agency.city}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Years in Business:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agency.yearsInBusiness}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Why Choose Us:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${agency.whyChooseUs || 'N/A'}</td>
            </tr>
          </table>
          <p style="margin-top: 25px;">You can review and manage this request in the <a href="https://wazwanway.com/admin" style="color: #D4AF37; text-decoration: none; font-weight: bold;">Wazwan Way Admin Panel</a>.</p>
        </div>
      `,
    });

    if (error) console.error("Resend API Error:", error);
    else console.log("Agency submission email sent successfully.");
  } catch (err) {
    console.error("Error sending agency submission email:", err);
  }
};

export const sendAgencyApprovalEmail = async (email, status, notes) => {
  console.log(`\n============================`);
  console.log(`[DEV MODE] Agency Status Update: ${status} for ${email}`);
  console.log(`============================\n`);

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = status === 'approved'
      ? "Welcome to Wazwan Way! Your Agency is Approved"
      : "Update on Your Wazwan Way Agency Application";

    let messageHtml = '';
    if (status === 'approved') {
      messageHtml = `
        <h2 style="color: #D4AF37;">Congratulations!</h2>
        <p>Your travel agency profile has been <strong>approved</strong> by our team.</p>
        <p>You are now an official Wazwan Way Partner. Your listing is live and travelers can now find you!</p>
        <p>Log in to your dashboard to view your inquiries and manage your profile.</p>
      `;
    } else if (status === 'rejected') {
      messageHtml = `
        <h2 style="color: #c62828;">Application Update</h2>
        <p>Thank you for submitting your travel agency profile. After careful review, your application requires some updates before we can approve it.</p>
        ${notes ? `<p><strong>Feedback from our team:</strong><br/>${notes}</p>` : ''}
        <p>Please log in to your dashboard, make the necessary changes, and resubmit your profile for review.</p>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: "Wazwan Way Partners <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          ${messageHtml}
        </div>
      `,
    });

    if (error) console.error("Resend API Error:", error);
    else console.log("Agency status email sent successfully.");
  } catch (err) {
    console.error("Error sending agency status email:", err);
  }
};

export const sendBookingConfirmationEmails = async (agency, touristDetails) => {
  const adminEmail = "wazwanway@gmail.com";
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // HTML email template
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">New Trip Booking!</h2>
        <p>A new tourist has confirmed a booking with <strong>${agency.agencyName}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 180px;">Tourist Name:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${touristDetails.userName || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${touristDetails.userEmail || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${touristDetails.userPhone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Travel Party:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${touristDetails.travelParty || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Dates / Season:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${touristDetails.seasonText || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Duration:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${touristDetails.duration || 'Not provided'} days</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Budget:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${touristDetails.budget || 'Not provided'}</td>
          </tr>
        </table>
        <p style="margin-top: 25px;">Please contact the tourist to finalize their trip!</p>
      </div>
    `;

    // Send to Admin
    await resend.emails.send({
      from: "Wazwan Way Bookings <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
      to: [adminEmail],
      subject: `New Booking for ${agency.agencyName}`,
      html: htmlContent,
    });

    // Send to Agency
    if (agency.email) {
      await resend.emails.send({
        from: "Wazwan Way Bookings <auth@wazwanway.com>",
      reply_to: "wazwanway@gmail.com",
        to: [agency.email],
        subject: `New Trip Booking - ${touristDetails.userName || 'Tourist'}`,
        html: htmlContent,
      });
    }
    
    console.log("Booking emails sent successfully.");
  } catch (err) {
    console.error("Error sending booking emails:", err);
  }
};
