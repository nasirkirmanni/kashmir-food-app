export const sendOtpSms = async (to, otp) => {
  console.log(`\n============================`);
  console.log(`[DEV MODE] SMS OTP generated for ${to}: ${otp}`);
  console.log(`============================\n`);

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("TWILIO credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER) not set in .env. Skipping actual SMS send.");
    return;
  }

  try {
    const authString = `${accountSid}:${authToken}`;
    const base64Auth = Buffer.from(authString).toString("base64");

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${base64Auth}`
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: `Your Wazwan Way verification code is: ${otp}. It will expire in 10 minutes.`
        })
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("SMS sent successfully via Twilio:", data.sid);
    } else {
      console.error("Twilio API Error:", data);
    }
  } catch (error) {
    console.error("Error sending SMS OTP:", error);
  }
};
