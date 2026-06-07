import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export const sendFollowNotification = async (toEmail, toName, followerName) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: `${followerName} started following you on CineReview`,
            html: `
<div style="background: #09090b; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto;">
        <div style="margin-bottom: 32px;">
            <span style="font-size: 22px; font-weight: 900; color: #f4f4f5; letter-spacing: -0.5px;">CINE<span style="color: #e11d48;">REVIEW</span></span>
        </div>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px;">
            <p style="font-size: 12px; color: #e11d48; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 16px;">New Follower</p>
            <h2 style="color: #f4f4f5; margin: 0 0 12px; font-size: 22px;">Hey ${toName}!</h2>
            <p style="color: #a1a1aa; margin: 0 0 28px; line-height: 1.6;"><strong style="color: #f4f4f5;">${followerName}</strong> just followed you on CineReview.</p>
            <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #e11d48; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">Visit CineReview →</a>
        </div>
        <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 24px;">You're receiving this because someone followed you on CineReview.</p>
    </div>
</div>`
        });
    } catch (error) {
        console.error('Follow email failed:', error.message);
    }
};

export const sendVerdictNotification = async (toEmail, toName, movieTitle) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: toEmail,
            subject: `New AI Verdict for ${movieTitle} on CineReview`,
            html: `
<div style="background: #09090b; padding: 40px 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto;">
        <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; background: #e11d48; border-radius: 4px; transform: rotate(12deg);"></div>
            <span style="font-size: 22px; font-weight: 900; color: #f4f4f5; letter-spacing: -0.5px;">CINE<span style="color: #e11d48;">REVIEW</span></span>
        </div>
        <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px;">
            <p style="font-size: 12px; color: #e11d48; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 16px;">New Verdict</p>
            <h2 style="color: #f4f4f5; margin: 0 0 12px; font-size: 22px;">Hey ${toName}!</h2>
            <p style="color: #a1a1aa; margin: 0 0 28px; line-height: 1.6;">A new AI Verdict has been generated for <strong style="color: #f4f4f5;">${movieTitle}</strong>. Head back to see what the community thinks!</p>
            <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #e11d48; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">Visit CineReview →</a>
        </div>
        <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 24px;">You're receiving this because you reviewed ${movieTitle} on CineReview.</p>
    </div>
</div>`
        });
    } catch (error) {
        console.error('Verdict email failed:', error.message);
    }
};