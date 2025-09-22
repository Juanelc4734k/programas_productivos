import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
};

export const sendPasswordResetCode = async (email, code, userName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de Recuperación de Contraseña - Plataforma Montebello',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #059669; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Plataforma Montebello</h1>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hola ${userName},</h2>
                    <p style="color: #666; line-height: 1.6;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                    Tu código de verificación es:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                    <span style="background-color: #059669; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; letter-spacing: 3px;">
                        ${code}
                    </span>
                    </div>
                    <p style="color: #666; line-height: 1.6;">
                    Este código expira en 15 minutos por seguridad.
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                    Si no solicitaste este cambio, puedes ignorar este correo.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                    Alcaldía de Montebello - Programas Productivos Rurales
                    </p>
                </div>
                </div>
            `
        };
        const result = await transporter.sendMail(mailOptions);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error enviando el email: ', error);
        throw new Error('Error al enviar el codigo de recuperacion');
    }
} 

export const sendPasswordChangeConfirmation = async (email, userName) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Contraseña Actualizada - Plataforma Montebello',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #059669; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Plataforma Montebello</h1>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hola ${userName},</h2>
                    <p style="color: #666; line-height: 1.6;">
                    Tu contraseña ha sido actualizada exitosamente.
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                    Si no realizaste este cambio, contacta inmediatamente al soporte técnico.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                    Alcaldía de Montebello - Programas Productivos Rurales
                    </p>
                </div>
                </div>
            `
            };
            await transporter.sendMail(mailOptions);
            return { success: true };
    } catch (error) {
        console.error('Error enviando confirmacion: ', error);
        return { success: false };
    }
};


