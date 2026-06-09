import nodemailer from "nodemailer";

export const sendOtpEmail = async (to, otp) => {
  // We'll log it for local dev since credentials might not be set up yet
  console.log(`\n============================`);
  console.log(`[DEV MODE] OTP generated for ${to}: ${otp}`);
  console.log(`============================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS not set in .env. Skipping actual email send.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 465,
      secure: process.env.EMAIL_PORT == 465 ? true : false,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Wazwan Way" <${process.env.EMAIL_USER}>`,
      to,
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
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    // Don't throw so that the API call doesn't completely fail if email sending fails.
  }
};
