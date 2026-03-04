import nodemailer from 'nodemailer';

/**
 * Sends an email using Nodemailer.
 * If SMTP environment variables are missing, it securely falls back to Ethereal 
 * for local testing (giving you a safe URL to preview the email).
 */
const sendEmail = async ({ email, subject, text, html }) => {
    try {
        let transporter;

        // If user didn't provide complete SMTP credentials, fallback to Ethereal Testing
        if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            // Generate test SMTP service account from ethereal.email
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            console.log(`[Email Setup] Using Ethereal Mock SMTP: ${testAccount.user}`);
        } else {
            // Use real SMTP config
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT == 465,
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
        }

        const info = await transporter.sendMail({
            from: `"Eatify Orders" <${process.env.SMTP_EMAIL || 'no-reply@eatify.com'}>`,
            to: email,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Message sent to %s: %s", email, info.messageId);

        if (!process.env.SMTP_HOST) {
            // Preview only available when sending through an Ethereal account
            console.log("Email Preview URL (Click to view): %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        throw error;
    }
};

export default sendEmail;
