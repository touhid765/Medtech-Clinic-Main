import { mailtrapClient, sender } from "./mailtrap.config.js";
import {VERIFICATION_EMAIL_TEMPLATE , PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE} from "./emailTemplate.js"

export const sendVerificationEmail = async ( email , verificationToken) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Verify your email',
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}" ,verificationToken),
            category: "Email Verification"
        });

        console.log("Email sent successfully" , response);

    } catch (error) {
        console.error("Error sending verification email", error);
        throw new Error(`Error sending verification email: ${error}`);
                
    }
}

export const sendWelcomeEmail = async ( email , name) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "f98cd38a-2852-466c-ac81-041310992c3f",
            template_variables: {
            "name": name,
            "company_info_name": "Medtech Clinic"
            }
        });

        console.log("Welcome Email sent successfully" , response);

    } catch (error) {
        console.error("Error sending welcome email", error);
        throw new Error(`Error sending welcome email: ${error}`);
                
    }
}

export const sendPasswordResetEmail = async ( email , resetURL) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}" ,resetURL),
            category: "Password Reset"
        });
    } catch (error) {
        console.error("Error sending password reset email", error);
        throw new Error(`Error sending password reset: ${error}`);   
    }
}

export const sendResetSuccessEmail = async ( email ) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset successfull",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        });
    } catch (error) {
        console.error("Error sending password reset success email", error);
        throw new Error(`Error sending password reset success : ${error}`);   
    }
}