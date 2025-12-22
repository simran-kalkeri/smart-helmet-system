import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { addAccident } from '@/lib/accidents-store';

export async function POST(request: Request) {
  try {
    // Get location and severity from request body if provided
    let latitude = 15.3647; // Default: Hubballi
    let longitude = 75.1240;
    let severity: "high" | "low" = "high"; // Default to high

    try {
      const body = await request.json();
      if (body.latitude && body.longitude) {
        latitude = body.latitude;
        longitude = body.longitude;
      }
      if (body.severity) {
        severity = body.severity;
      }
    } catch (e) {
      // No body or invalid JSON, use defaults
    }

    // Generate realistic sensor telemetry (Gyroscope + Accelerometer)
    const timestamp = new Date();

    // Realistic sensor values based on gyroscope and accelerometer
    const telemetry = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      riderName: "Rahul Kumar",
      helmetId: "SH-2024-001",
      timestamp: timestamp.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium'
      }),
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      location: `${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E`,
      severity: severity,

      // Gyroscope data (angular velocity in degrees/second)
      gyroX: severity === "high" ? "245.3" : "45.2",  // Pitch rotation
      gyroY: severity === "high" ? "189.7" : "32.1",  // Roll rotation
      gyroZ: severity === "high" ? "156.4" : "28.5",  // Yaw rotation

      // Accelerometer data (G-force)
      accelX: severity === "high" ? "8.5" : "2.1",   // Forward/backward
      accelY: severity === "high" ? "6.2" : "1.8",   // Left/right
      accelZ: severity === "high" ? "12.3" : "3.2",  // Up/down

      // Calculated values
      tiltAngle: severity === "high" ? "78°" : "35°",  // Helmet tilt from gyroscope
      impactForce: severity === "high" ? "15.8 G" : "4.2 G",  // Total acceleration magnitude

      isCancelled: severity === "low",
    };

    // Setup Email Transporter
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const subject = severity === "high"
      ? `🚨 HIGH SEVERITY CRASH: ${telemetry.riderName}`
      : `⚠️ Low Severity Alert: ${telemetry.riderName}`;
    const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // Construct Email with realistic sensor telemetry
    const mailOptions = {
      from: '"Smart Helmet System" <noreply@smarthelmet.com>',
      to: "01fe23bci087@kletech.ac.in",
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
          <h2 style="color: ${severity === "high" ? "#ef4444" : "#f59e0b"}; margin-top: 0;">
            ${severity === "high" ? "🚨 HIGH SEVERITY CRASH DETECTED" : "⚠️ LOW SEVERITY ALERT"}
          </h2>
          <p style="font-size: 16px; color: #333;">
            ${severity === "high"
          ? "The Smart Helmet system has detected a high-impact crash. Immediate action required!"
          : "The Smart Helmet detected an impact, but the rider cancelled the SOS alert."}
          </p>
          
          <div style="background: ${severity === "high" ? "#fef2f2" : "#fffbeb"}; border-left: 4px solid ${severity === "high" ? "#ef4444" : "#f59e0b"}; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: ${severity === "high" ? "#991b1b" : "#92400e"};">Rider Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.riderName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Device ID:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.helmetId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                <td style="padding: 8px 0; color: ${severity === "high" ? "#ef4444" : "#10b981"}; font-weight: bold;">
                  ${severity === "high" ? "NO RESPONSE - NEEDS HELP" : "RESPONDED - FALSE ALARM"}
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">Sensor Telemetry</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Time:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.timestamp}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Impact Force:</strong></td>
                <td style="padding: 8px 0; color: ${severity === "high" ? "#ef4444" : "#f59e0b"}; font-weight: bold;">${telemetry.impactForce}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Helmet Tilt:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.tiltAngle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Severity:</strong></td>
                <td style="padding: 8px 0; color: ${severity === "high" ? "#ef4444" : "#f59e0b"}; font-weight: bold; text-transform: uppercase;">${telemetry.severity}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #065f46;">Gyroscope Data (°/s)</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Pitch (X-axis):</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.gyroX}°/s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Roll (Y-axis):</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.gyroY}°/s</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Yaw (Z-axis):</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.gyroZ}°/s</td>
              </tr>
            </table>
          </div>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Accelerometer Data (G-force)</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>X-axis:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.accelX} G</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Y-axis:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.accelY} G</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Z-axis:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.accelZ} G</td>
              </tr>
            </table>
          </div>

          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">GPS Location</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Coordinates:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Latitude:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.latitude}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Longitude:</strong></td>
                <td style="padding: 8px 0; color: #333;">${telemetry.longitude}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: ${severity === "high" ? "#fef2f2" : "#fffbeb"}; border-radius: 8px;">
            <p style="margin: 0 0 15px 0; color: ${severity === "high" ? "#991b1b" : "#92400e"}; font-weight: bold; font-size: 16px;">
              ${severity === "high" ? "⚠️ URGENT Action Required:" : "ℹ️ For Your Information:"}
            </p>
            <p style="margin: 0 0 15px 0; color: #333;">
              ${severity === "high"
          ? "The rider did not respond to the SOS alert. Please contact them immediately or dispatch emergency services."
          : "The rider cancelled the SOS alert, indicating they are okay. This may have been a minor bump or false alarm."}
            </p>
            <a href="${mapLink}" style="display: inline-block; background: ${severity === "high" ? "#ef4444" : "#3b82f6"}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">📍 View Location on Google Maps</a>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p style="margin: 5px 0;">This is an automated alert from the Smart Helmet Safety System.</p>
            <p style="margin: 5px 0;">Event ID: ${telemetry.id}</p>
          </div>
        </div>
      `
    };

    // Send Email
    let emailStatus = "pending";
    try {
      if (emailUser && emailPass) {
        await transporter.sendMail(mailOptions);
        emailStatus = "sent";
        console.log("✅ Email sent successfully to:", mailOptions.to);
        console.log("📍 Location:", telemetry.location);
        console.log("⏰ Time:", telemetry.timestamp);
        console.log("⚠️ Severity:", severity.toUpperCase());
      } else {
        console.log("---------------------------------------------------");
        console.log("SIMULATION MODE: No SMTP credentials found in .env");
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Location: ${telemetry.location}`);
        console.log(`Time: ${telemetry.timestamp}`);
        console.log(`Severity: ${severity.toUpperCase()}`);
        console.log("---------------------------------------------------");
        emailStatus = "simulated_sent";
      }
    } catch (emailError: any) {
      console.error("❌ Email send failed:", emailError);
      emailStatus = "failed";

      // Return specific auth error for frontend handling
      if (emailError.code === 'EAUTH') {
        return NextResponse.json({
          success: false,
          error: "SMTP Auth Failed. Check .env.local credentials.",
          details: "Gmail requires an App Password if 2FA is on.",
          emailStatus
        }, { status: 401 });
      }
    }

    // Save accident to store
    addAccident({
      id: telemetry.id,
      riderName: telemetry.riderName,
      helmetId: telemetry.helmetId,
      timestamp: telemetry.timestamp,
      timestampDate: timestamp,
      location: telemetry.location,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      severity: severity,
      gyroX: telemetry.gyroX,
      gyroY: telemetry.gyroY,
      gyroZ: telemetry.gyroZ,
      accelX: telemetry.accelX,
      accelY: telemetry.accelY,
      accelZ: telemetry.accelZ,
      tiltAngle: telemetry.tiltAngle,
      impactForce: telemetry.impactForce,
      isCancelled: telemetry.isCancelled
    });

    // Return success response to frontend
    return NextResponse.json({
      success: emailStatus !== 'failed',
      message: emailStatus === 'sent' ? "Alert & Email Sent!" : "Simulation Logged (Email Failed)",
      data: telemetry,
      emailStatus
    });

  } catch (error) {
    console.error("Simulation route error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
