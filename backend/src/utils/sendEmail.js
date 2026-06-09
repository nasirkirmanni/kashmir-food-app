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
