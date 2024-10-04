import { User } from '../models/user.model.js';
import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Clinic } from '../models/clinic.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateVerificationToken } from '../utils/generateVerificationToken.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail, sendWelcomeEmail , sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/emails.js';

export const signup = async (req, res) => {
    const {email, password, name } = req.body;
    try {
        if(!email || !password || !name){
            throw new Error("All fields are requires");
        }

        const userAlreadyExists = await User.findOne({email:email});
        
        if(userAlreadyExists){
            return res.status(400).json({success:false, message: "User Already Exists"});
        }


        const hashedPassword = await bcrypt.hash(password,10);

        const verificationToken = generateVerificationToken();
        
        const user = new User({
            email:email, 
            password:hashedPassword, 
            name:name,
            verificationToken: verificationToken,
            verificationExpireAt : Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });
        
        await user.save();
        
        //jwt
        
        generateTokenAndSetCookie(res,user._id);
        
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success:true,
            message:"User created successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
        })

    } catch (error) {
        res.status(400).json({success:false, message:error.message});
    }
}

export const verifyEmail = async (req, res) =>{
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code, 
            verificationExpireAt: {$gt: Date.now()}}
        )

        if(!user){
            return res.status(400).json({success:false, message: "Invalid or expired verification code"})
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpireAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success:true,
            message:"User verified successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
        });

    } catch (error) {
        res.status(500).json({success:false, message:"Server error"});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        
        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success:true,
            message:"User logged in successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
        });

    } catch ( error ){
        console.log("Error in login:" , error);
        res.status(400).json({success:false, message: error.message});
    }

}

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success:true, message:"Logged out successfully"});
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false, message:"Email not found"});
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 //1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpireAt = resetTokenExpiresAt;

        await user.save();

        //send email

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({
            success:true,
            message:"Reset password link sent successfully",
        });

    } catch (error) {
        console.log("Error in forgot password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        const user = await User.findOne({
            resetPasswordToken:token, 
            resetPasswordExpireAt:{$gt:Date.now()}
            });
        if(!user){
            return res.status(400).json({success:false, message:"Invalid token or expired"});
        }

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpireAt = undefined;
        await user.save();


        //send email

        await sendResetSuccessEmail(user.email);

        res.status(200).json({
            success:true,
            message:"Password changed successfully",
        });

    } catch (error) {
        console.log("Error in reset password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const checkAuth = async (req, res) =>{
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(400).json({success:false, message:"User not found"});
        }
        res.status(200).json({ success:true, user});
    } catch (error) {
        console.log("Error in check auth:", error);
        res.status(400).json({success:false, message:error.message});
    }
}



//patient

export const patientRegister = async (req, res) => {
    const {email, password, name } = req.body;
    try {
        if(!email || !password || !name){
            throw new Error("All fields are requires");
        }

        var patient = await Patient.findOne({email:email});
        
        if(patient && patient.isVerified == true){
            return res.status(400).json({success:false, message: "Patient Already Exists"});
        }


        const hashedPassword = await bcrypt.hash(password,10);

        const verificationToken = generateVerificationToken();
        if(!patient){
            patient = new Patient({
                email:email, 
                password:hashedPassword, 
                name:name,
                verificationToken: verificationToken,
                verificationExpireAt : Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });
        } else {
            patient.password = hashedPassword;
            patient.name = name;
            patient.verificationToken = verificationToken;
            patient.verificationExpireAt = Date.now() + 24 * 60 * 60 // 24 hours
        }
        
        await patient.save();
        
        //jwt
        
        generateTokenAndSetCookie(res,patient._id, "patientToken");
        
        await sendVerificationEmail(patient.email, verificationToken);

        res.status(201).json({
            success:true,
            message:"User created successfully",
            user:{
                ...patient._doc,
                password:undefined,
            }
        })

    } catch (error) {
        res.status(400).json({success:false, message:error.message});
    }
}

export const verifyPatientEmail = async (req, res) =>{
    const {code} = req.body;
    try {
        const patient = await Patient.findOne({
            verificationToken: code, 
            verificationExpireAt: {$gt: Date.now()}}
        )

        if(!patient){
            return res.status(400).json({success:false, message: "Invalid or expired verification code"})
        }

        patient.isVerified = true;
        patient.verificationToken = undefined;
        patient.verificationExpireAt = undefined;

        await patient.save();

        await sendWelcomeEmail(patient.email, patient.name);

        res.status(200).json({
            success:true,
            message:"User verified successfully",
            user:{
                ...patient._doc,
                password:undefined,
            }
        });

    } catch (error) {
        res.status(500).json({success:false, message:"Server error"});
    }
}

export const patientLogin = async (req, res) => {
    const {email, password} = req.body;
    try {
        const patient = await Patient.findOne({email});
        if (!patient) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        const isValidPassword = await bcrypt.compare(password, patient.password);
        if (!isValidPassword) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        
        generateTokenAndSetCookie(res, patient._id, "patientToken");

        patient.lastLogin = new Date();
        await patient.save();

        res.status(200).json({
            success:true,
            message:"User logged in successfully",
            user:{
                ...patient._doc,
                password:undefined,
            }
        });

    } catch ( error ){
        console.log("Error in login:" , error);
        res.status(400).json({success:false, message: error.message});
    }

}

export const patientForgot = async (req, res) => {
    const {email} = req.body;
    try {
        const patient = await Patient.findOne({email});
        if(!patient){
            return res.status(400).json({success:false, message:"Email not found"});
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 //1 hour

        patient.resetPasswordToken = resetToken;
        patient.resetPasswordExpireAt = resetTokenExpiresAt;

        await patient.save();

        //send email

        await sendPasswordResetEmail(patient.email, `${process.env.CLIENT_URL}/patient-reset/${resetToken}`);

        res.status(200).json({
            success:true,
            message:"Reset password link sent successfully",
        });

    } catch (error) {
        console.log("Error in forgot password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const patientReset = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        const patient = await Patient.findOne({
            resetPasswordToken:token, 
            resetPasswordExpireAt:{$gt:Date.now()}
            });
        if(!patient){
            return res.status(400).json({success:false, message:"Invalid token or expired"});
        }

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        patient.password = hashedPassword;
        patient.resetPasswordToken = undefined;
        patient.resetPasswordExpireAt = undefined;
        await patient.save();


        //send email

        await sendResetSuccessEmail(patient.email);

        res.status(200).json({
            success:true,
            message:"Password changed successfully",
        });

    } catch (error) {
        console.log("Error in reset password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const patientLogout = async (req, res) => {
    res.clearCookie("patientToken");
    res.status(200).json({success:true, message:"Logged out successfully"});
}

export const authPatient = async (req, res) =>{
    try {
        const patient = await Patient.findById(req.userId).select("-password");
        if(!patient){
            return res.status(400).json({success:false, message:"Patient not found"});
        }
        res.status(200).json({ success:true, patient});
    } catch (error) {
        console.log("Error in check auth:", error);
        res.status(400).json({success:false, message:error.message});
    }
}



//doctor

export const doctorRegister = async (req, res) => {
    const {email, password, name, specialty } = req.body;
    try {
        if(!email || !password || !name || !specialty){
            throw new Error("All fields are requires");
        }

        var doctor = await Doctor.findOne({email:email});
        
        if(doctor && doctor.isVerified == true){
            return res.status(400).json({success:false, message: "Doctor Already Exists"});
        }


        const hashedPassword = await bcrypt.hash(password,10);

        const verificationToken = generateVerificationToken();
        if(!doctor){
            doctor = new Doctor({
                email:email, 
                password:hashedPassword, 
                name:name,
                specialty:specialty,
                verificationToken: verificationToken,
                verificationExpireAt : Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });
        } else {
            doctor.password = hashedPassword;
            doctor.name = name;
            doctor.specialty = specialty;
            doctor.verificationToken = verificationToken;
            doctor.verificationExpireAt = Date.now() + 24 * 60 * 60 // 24 hours
        }
        
        await doctor.save();
        
        //jwt
        
        generateTokenAndSetCookie(res,doctor._id, "doctorToken");
        
        await sendVerificationEmail(doctor.email, verificationToken);

        res.status(201).json({
            success:true,
            message:"Doctor created successfully",
            user:{
                ...doctor._doc,
                password:undefined,
            }
        })

    } catch (error) {
        console.log("Error creating doctor : ", error)
        res.status(400).json({success:false, message:error.message});
    }
}

export const verifyDoctorEmail = async (req, res) =>{
    const {code} = req.body;
    try {
        const doctor = await Doctor.findOne({
            verificationToken: code, 
            verificationExpireAt: {$gt: Date.now()}}
        )

        if(!doctor){
            return res.status(400).json({success:false, message: "Invalid or expired verification code"})
        }

        doctor.isVerified = true;
        doctor.verificationToken = undefined;
        doctor.verificationExpireAt = undefined;

        await doctor.save();

        await sendWelcomeEmail(doctor.email, doctor.name);

        res.status(200).json({
            success:true,
            message:"Doctor verified successfully",
            user:{
                ...doctor._doc,
                password:undefined,
            }
        });

    } catch (error) {
        res.status(500).json({success:false, message:"Server error"});
    }
}

export const doctorLogin = async (req, res) => {
    const {email, password} = req.body;
    try {
        const doctor = await Doctor.findOne({email});
        if (!doctor) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        const isValidPassword = await bcrypt.compare(password, doctor.password);
        if (!isValidPassword) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        
        generateTokenAndSetCookie(res, doctor._id, "doctorToken");

        doctor.lastLogin = new Date();
        await doctor.save();

        res.status(200).json({
            success:true,
            message:"Doctor logged in successfully",
            user:{
                ...doctor._doc,
                password:undefined,
            }
        });

    } catch ( error ){
        console.log("Error in login:" , error);
        res.status(400).json({success:false, message: error.message});
    }

}

export const doctorForgot = async (req, res) => {
    const {email} = req.body;
    try {
        const doctor = await Doctor.findOne({email});
        if(!doctor){
            return res.status(400).json({success:false, message:"Email not found"});
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 //1 hour

        doctor.resetPasswordToken = resetToken;
        doctor.resetPasswordExpireAt = resetTokenExpiresAt;

        await doctor.save();

        //send email

        await sendPasswordResetEmail(doctor.email, `${process.env.CLIENT_URL}/doctor-reset/${resetToken}`);

        res.status(200).json({
            success:true,
            message:"Reset password link sent successfully",
        });

    } catch (error) {
        console.log("Error in forgot password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const doctorReset = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        const doctor = await Doctor.findOne({
            resetPasswordToken:token, 
            resetPasswordExpireAt:{$gt:Date.now()}
            });
        if(!doctor){
            return res.status(400).json({success:false, message:"Invalid token or expired"});
        }

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        doctor.password = hashedPassword;
        doctor.resetPasswordToken = undefined;
        doctor.resetPasswordExpireAt = undefined;
        await doctor.save();


        //send email

        await sendResetSuccessEmail(doctor.email);

        res.status(200).json({
            success:true,
            message:"Password changed successfully",
        });

    } catch (error) {
        console.log("Error in reset password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const doctorLogout = async (req, res) => {
    res.clearCookie("doctorToken");
    res.status(200).json({success:true, message:"Logged out successfully"});
}

export const authDoctor = async (req, res) =>{
    try {
        const doctor = await Doctor.findById(req.userId).select("-password");
        if(!doctor){
            return res.status(400).json({success:false, message:"Doctor not found"});
        }
        res.status(200).json({ success:true, doctor});
    } catch (error) {
        console.log("Error in check auth:", error);
        res.status(400).json({success:false, message:error.message});
    }
}




//clinic

export const clinicRegister = async (req, res) => {
    const {email, password, clinicName, contactNumber } = req.body;
    try {
        if(!email || !password || !clinicName || !contactNumber){
            throw new Error("All fields are requires");
        }

        var clinic = await Clinic.findOne({email:email});
        
        if(clinic && clinic.isVerified == true){
            return res.status(400).json({success:false, message: "Doctor Already Exists"});
        }


        const hashedPassword = await bcrypt.hash(password,10);

        const verificationToken = generateVerificationToken();
        if(!clinic){
            clinic = new Clinic({
                email:email, 
                password:hashedPassword, 
                name:clinicName,
                contactNumber:contactNumber,
                verificationToken: verificationToken,
                verificationExpireAt : Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });
        } else {
            clinic.password = hashedPassword;
            clinic.name = name;
            clinic.contactNumber = contactNumber;
            clinic.verificationToken = verificationToken;
            clinic.verificationExpireAt = Date.now() + 24 * 60 * 60 // 24 hours
        }
        
        await clinic.save();
        
        //jwt
        
        generateTokenAndSetCookie(res,clinic._id,"clinicToken");
        
        await sendVerificationEmail(clinic.email, verificationToken);

        res.status(201).json({
            success:true,
            message:"Clinic created successfully",
            user:{
                ...clinic._doc,
                password:undefined,
            }
        })

    } catch (error) {
        console.log("Error creating clinic : ", error)
        res.status(400).json({success:false, message:error.message});
    }
}

export const verifyClinicEmail = async (req, res) =>{
    const {code} = req.body;
    try {
        const clinic = await Clinic.findOne({
            verificationToken: code, 
            verificationExpireAt: {$gt: Date.now()}}
        )

        if(!clinic){
            return res.status(400).json({success:false, message: "Invalid or expired verification code"})
        }

        clinic.isVerified = true;
        clinic.verificationToken = undefined;
        clinic.verificationExpireAt = undefined;

        await clinic.save();

        await sendWelcomeEmail(clinic.email, clinic.name);

        res.status(200).json({
            success:true,
            message:"Doctor verified successfully",
            user:{
                ...clinic._doc,
                password:undefined,
            }
        });

    } catch (error) {
        res.status(500).json({success:false, message:"Server error"});
    }
}

export const clinicLogin = async (req, res) => {
    const {email, password} = req.body;
    try {
        const clinic = await Clinic.findOne({email});
        if (!clinic) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        const isValidPassword = await bcrypt.compare(password, clinic.password);
        if (!isValidPassword) {
            return res.status(400).json({success: false, message: "Invalid email or password"});
        }
        
        generateTokenAndSetCookie(res, clinic._id, "clinicToken");

        clinic.lastLogin = new Date();
        await clinic.save();

        res.status(200).json({
            success:true,
            message:"Doctor logged in successfully",
            user:{
                ...clinic._doc,
                password:undefined,
            }
        });

    } catch ( error ){
        console.log("Error in login:" , error);
        res.status(400).json({success:false, message: error.message});
    }

}

export const clinicForgot = async (req, res) => {
    const {email} = req.body;
    try {
        const clinic = await Clinic.findOne({email});
        if(!clinic){
            return res.status(400).json({success:false, message:"Email not found"});
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 //1 hour

        clinic.resetPasswordToken = resetToken;
        clinic.resetPasswordExpireAt = resetTokenExpiresAt;

        await clinic.save();

        //send email

        await sendPasswordResetEmail(clinic.email, `${process.env.CLIENT_URL}/clinic-reset/${resetToken}`);

        res.status(200).json({
            success:true,
            message:"Reset password link sent successfully",
        });

    } catch (error) {
        console.log("Error in forgot password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const clinicReset = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        const clinic = await Clinic.findOne({
            resetPasswordToken:token, 
            resetPasswordExpireAt:{$gt:Date.now()}
            });
        if(!clinic){
            return res.status(400).json({success:false, message:"Invalid token or expired"});
        }

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        clinic.password = hashedPassword;
        clinic.resetPasswordToken = undefined;
        clinic.resetPasswordExpireAt = undefined;
        await clinic.save();


        //send email

        await sendResetSuccessEmail(clinic.email);

        res.status(200).json({
            success:true,
            message:"Password changed successfully",
        });

    } catch (error) {
        console.log("Error in reset password:", error);
        res.status(400).json({success:false, message:error.message});
    }
}

export const clinicLogout = async (req, res) => {
    res.clearCookie("clinicToken");
    res.status(200).json({success:true, message:"Logged out successfully"});
}

export const authClinic = async (req, res) =>{
    try {
        const clinic = await Clinic.findById(req.userId).select("-password");
        if(!clinic){
            return res.status(400).json({success:false, message:"Clinic not found"});
        }
        res.status(200).json({ success:true, clinic});
    } catch (error) {
        console.log("Error in check auth:", error);
        res.status(400).json({success:false, message:error.message});
    }
}
