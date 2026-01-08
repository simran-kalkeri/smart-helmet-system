/**
 * Email Notification Service
 * Sends email alerts for high-severity accidents using nodemailer
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Send high-severity accident email notification
 * @param {Object} accidentData - Accident details
 * @param {number} accidentData.gForce - G-force magnitude
 * @param {number} accidentData.tilt - Helmet tilt angle
 * @param {Object} accidentData.location - GPS coordinates
 * @param {number} accidentData.timestamp - Timestamp of accident
 */
async function sendAccidentEmail(accidentData) {
    console.log('\n🔍 EMAIL SERVICE CALLED');
    console.log('   Accident data received:', JSON.stringify(accidentData, null, 2));

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    console.log('   EMAIL_USER:', emailUser ? `${emailUser.substring(0, 5)}...` : 'NOT SET');
    console.log('   EMAIL_PASS:', emailPass ? `${emailPass.substring(0, 3)}...` : 'NOT SET');

    if (!emailUser || !emailPass) {
        console.log('❌ Email credentials not configured - skipping email');
        console.log('   Please set EMAIL_USER and EMAIL_PASS in .env file');
        return { success: false, reason: 'No credentials' };
    }


    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const timestamp = new Date(accidentData.timestamp);
        const latitude = accidentData.location?.latitude || 0;
        const longitude = accidentData.location?.longitude || 0;
        const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        // Email content
        const mailOptions = {
            from: '"Smart Helmet System" <noreply@smarthelmet.com>',
            to: '01fe23bci087@kletech.ac.in',
            subject: `🚨 HIGH SEVERITY CRASH: Emergency Alert`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px;">
                    <h2 style="color: #ef4444; margin-top: 0;">
                        🚨 HIGH SEVERITY CRASH DETECTED
                    </h2>
                    <p style="font-size: 16px; color: #333;">
                        The Smart Helmet system has detected a high-impact crash. The rider did not respond to the SOS alert. Immediate action required!
                    </p>
                    
                    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #991b1b;">Rider Information</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Name:</strong></td>
                                <td style="padding: 8px 0; color: #333;">Simran Kalkeri</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Device ID:</strong></td>
                                <td style="padding: 8px 0; color: #333;">SH-2024-001</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Status:</strong></td>
                                <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">
                                    NO RESPONSE - NEEDS HELP
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #92400e;">Sensor Telemetry</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Time:</strong></td>
                                <td style="padding: 8px 0; color: #333;">${timestamp.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'medium'
            })}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Impact Force:</strong></td>
                                <td style="padding: 8px 0; color: #ef4444; font-weight: bold;">${accidentData.gForce.toFixed(2)} G</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Helmet Tilt:</strong></td>
                                <td style="padding: 8px 0; color: #333;">${Math.abs(accidentData.tilt).toFixed(1)}°</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Severity:</strong></td>
                                <td style="padding: 8px 0; color: #ef4444; font-weight: bold; text-transform: uppercase;">HIGH</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Detected By:</strong></td>
                                <td style="padding: 8px 0; color: #333; font-weight: 600;">${accidentData.source === 'ESP32' ? '🪖 Smart Helmet (ESP32)' : '📱 Mobile App'}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #065f46;">GPS Location</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Latitude:</strong></td>
                                <td style="padding: 8px 0; color: #333;">${latitude.toFixed(6)}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #666;"><strong>Longitude:</strong></td>
                                <td style="padding: 8px 0; color: #333;">${longitude.toFixed(6)}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin-top: 30px; padding: 20px; background: #fef2f2; border-radius: 8px;">
                        <p style="margin: 0 0 15px 0; color: #991b1b; font-weight: bold; font-size: 16px;">
                            ⚠️ URGENT Action Required:
                        </p>
                        <p style="margin: 0 0 15px 0; color: #333;">
                            The rider did not respond to the SOS alert. Please contact them immediately or dispatch emergency services.
                        </p>
                        <a href="${mapLink}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">📍 View Location on Google Maps</a>
                    </div>

                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                        <p style="margin: 5px 0;">This is an automated alert from the Smart Helmet Safety System.</p>
                        <p style="margin: 5px 0;">Sent from Mobile App</p>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', mailOptions.to);
        console.log('📍 Location:', `${latitude}, ${longitude}`);
        console.log('⏰ Time:', timestamp.toLocaleString());

        return { success: true };
    } catch (error) {
        console.error('❌ Email send failed:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendAccidentEmail
};
