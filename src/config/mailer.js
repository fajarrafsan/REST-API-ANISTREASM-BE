import nodemailer from "nodemailer";
import { logger } from "../application/logging.js";

export const mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export function mailEnabled() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail({ to, subject, html, text }) {
    if (!mailEnabled()) {
        logger.warn("[mailer] SMTP belum dikonfigurasi, email tidak dikirim.");
        return null;
    }

    return mailer.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        ...(html ? { html } : { text })
    });
}
