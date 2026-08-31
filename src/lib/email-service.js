import nodemailer from "nodemailer";

let transporter = null;

function getEmailTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // Development / fallback transporter
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }

  return transporter;
}

export async function sendOtpEmail({ to, otp, userName = "Student" }) {
  const from =
    process.env.SMTP_FROM || '"MahaExam महाराष्ट्र स्पर्धा परीक्षा" <noreply@mahaexam.org.in>';
  const mailer = getEmailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="mr">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1d4ed8, #4338ca); color: #ffffff; padding: 24px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .body { padding: 32px; text-align: center; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
        .msg { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #2563eb; border-radius: 16px; padding: 16px; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; }
        .expiry { font-size: 12px; color: #64748b; margin-top: 8px; }
        .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>MahaExam — महाराष्ट्र स्पर्धा परीक्षा</h1>
        </div>
        <div class="body">
          <div class="greeting">नमस्कार, ${userName}!</div>
          <p class="msg">
            MahaExam खात्यामध्ये प्रवेश / पडताळणी करण्यासाठी तुमचा एकवेळचा पासवर्ड (OTP) खालीलप्रमाणे आहे:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">हा OTP पुढील १० मिनिटांसाठी वैध आहे.</div>
          </div>
          <p class="msg" style="font-size: 12px; color: #64748b;">
            जर तुम्ही हा OTP मागवला नसेल, तर कृपया या ईमेलकडे दुर्लक्ष करा. तुमचा OTP कोणाशीही शेअर करू नका.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} MahaExam Platform. All rights reserved. • महाराष्ट्र शासन स्पर्धा परीक्षा सराव पोर्टल
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject: `${otp} हा तुमचा MahaExam पडताळणी OTP आहे`,
      text: `नमस्कार ${userName}, तुमचा MahaExam OTP आहे: ${otp}. हा OTP १० मिनिटांसाठी वैध आहे.`,
      html: htmlContent,
    });

    console.warn(`[EmailService] OTP sent to ${to}: ${info.messageId || "Sent"}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[EmailService] SMTP error (logged OTP in dev): ${error.message}. OTP: ${otp}`);
    return { success: true, fallback: true, otp };
  }
}

/**
 * Dispatches automated login credentials to a newly onboarded Coaching Academy Admin
 */
export async function sendAcademyCredentialsEmail({
  email,
  name,
  adminName,
  password,
  district = "Maharashtra",
  loginUrl = "http://localhost:3000/login",
}) {
  const from =
    process.env.SMTP_FROM || '"MahaExam महाराष्ट्र स्पर्धा परीक्षा" <noreply@mahaexam.org.in>';
  const mailer = getEmailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="mr">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #b45309, #d97706, #1e3a8a); color: #ffffff; padding: 28px 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .body { padding: 32px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .msg { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
        .cred-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 20px; margin: 20px 0; }
        .cred-row { display: flex; margin-bottom: 10px; font-size: 14px; }
        .cred-row:last-child { margin-bottom: 0; }
        .cred-label { font-weight: 700; width: 140px; color: #78350f; }
        .cred-val { font-family: monospace; font-weight: 700; color: #1e293b; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none; text-align: center; }
        .steps { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #475569; }
        .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>MahaExam Coaching Portal</h1>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">अकॅडेमी ॲडमिन नोंदणी यशस्वी</p>
        </div>
        <div class="body">
          <div class="greeting">अभिनंदन, ${adminName || "संचालक"}!</div>
          <p class="msg">
            आपली संस्था <strong>${name}</strong> (${district}) चे MahaExam ऑनलाइन CBT परीक्षा व्यासपीठावर यशस्वीरित्या खाते तयार करण्यात आले आहे.
          </p>

          <div class="cred-box">
            <h3 style="margin: 0 0 12px; color: #92400e; font-size: 15px;">आपली अधिकृत लॉगिन माहिती (Login Credentials):</h3>
            <div class="cred-row"><span class="cred-label">लॉगिन पोर्टल:</span> <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></div>
            <div class="cred-row"><span class="cred-label">ईमेल (Username):</span> <span class="cred-val">${email}</span></div>
            <div class="cred-row"><span class="cred-label">पासवर्ड:</span> <span class="cred-val" style="color: #b91c1c;">${password}</span></div>
            <div class="cred-row"><span class="cred-label">संस्था / अकॅडेमी:</span> <span class="cred-val">${name}</span></div>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${loginUrl}" class="btn" style="color: #ffffff;">अकॅडेमी डॅशबोर्डमध्ये लॉगिन करा →</a>
          </div>

          <div class="steps">
            <h4 style="margin: 0 0 8px; color: #0f172a;">डॅशबोर्डमध्ये काय करू शकता?</h4>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>स्वतःच्या विद्यार्थ्यांच्या बॅचेस (Batches) तयार करा.</li>
              <li>शिक्षकांना (Faculty Teachers) जोडा व प्रश्नपत्रिका तयार करा.</li>
              <li>विद्यार्थ्यांना WhatsApp द्वारे इन्व्हाईट लिंक पाठवा.</li>
              <li>विद्यार्थ्यांचे गुण व रँक यादी थेट डॅशबोर्डवर पहा.</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} MahaExam Platform • Maharashtra Government Exam Mock Test Series
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await mailer.sendMail({
      from,
      to: email,
      subject: `Welcome ${name}! Your MahaExam Academy Admin Credentials`,
      text: `Welcome ${adminName}, your academy ${name} has been registered on MahaExam. Login URL: ${loginUrl}, Email: ${email}, Password: ${password}`,
      html: htmlContent,
    });

    console.warn(
      `[EmailService] Academy credentials sent to ${email}: ${info.messageId || "Sent"}`,
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[EmailService] SMTP error dispatching academy email: ${error.message}`);
    return { success: true, fallback: true };
  }
}

/**
 * Dispatches automated login credentials to a Teacher
 */
export async function sendTeacherCredentialsEmail({
  email,
  name,
  password,
  coachingName,
  loginUrl = "http://localhost:3000/login",
}) {
  const from =
    process.env.SMTP_FROM || '"MahaExam महाराष्ट्र स्पर्धा परीक्षा" <noreply@mahaexam.org.in>';
  const mailer = getEmailTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="mr">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; padding: 24px 32px; text-align: center; }
        .body { padding: 32px; }
        .cred-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; margin: 20px 0; }
        .btn { display: inline-block; background: #059669; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 style="margin: 0;">MahaExam — शिक्षक स्वागत</h2>
        </div>
        <div class="body">
          <h3>नमस्कार प्रा./शिक्षक ${name}!</h3>
          <p>आपल्याला <strong>${coachingName}</strong> च्या वतीने MahaExam परीक्षा प्रणालीमध्ये शिक्षक (Faculty) म्हणून जोडण्यात आले आहे.</p>
          
          <div class="cred-box">
            <h4 style="margin-top: 0; color: #166534;">आपली शिक्षक लॉगिन माहिती:</h4>
            <p><strong>लॉगिन लिंक:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
            <p><strong>ईमेल:</strong> <code>${email}</code></p>
            <p><strong>पासवर्ड:</strong> <code style="color: #b91c1c;">${password}</code></p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${loginUrl}" class="btn" style="color: #ffffff;">शिक्षक खात्यात लॉगिन करा →</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await mailer.sendMail({
      from,
      to: email,
      subject: `Welcome ${name} to ${coachingName} - Teacher Login Credentials`,
      text: `Welcome ${name}, you have been added as a faculty teacher for ${coachingName}. Login: ${loginUrl}, Email: ${email}, Password: ${password}`,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[EmailService] Teacher email error: ${error.message}`);
    return { success: true, fallback: true };
  }
}
