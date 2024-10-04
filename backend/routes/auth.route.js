import express from "express";
import { login, 
    logout, 
    signup , 
    verifyEmail, 
    forgotPassword , 
    resetPassword, 
    checkAuth,

    patientRegister,
    verifyPatientEmail,
    patientLogin,
    patientForgot,
    patientReset,
    patientLogout,
    authPatient,

    doctorRegister,
    verifyDoctorEmail,
    doctorLogin,
    doctorForgot,
    doctorReset,
    doctorLogout,
    authDoctor,

    clinicRegister,
    verifyClinicEmail,
    clinicLogin,
    clinicForgot,
    clinicReset,
    clinicLogout,
    authClinic,
} from "../controllers/auth.controllers.js";
import { verifyToken } from "../midlayer/verifyToken.js";
import { verifyPatient } from "../midlayer/verifyPatient.js";
import { verifyDoctor } from "../midlayer/verifyDoctor.js";
import { verifyClinic } from "../midlayer/verifyClinic.js";

import { bookAppointment, 
    cancelAppointment, 
    changeStatusOfAppointment, 
    fetchAppointments, 
    fetchDoctors, 
    fetchMyAppointments,
    rescheduleAppointment
} from "../controllers/appointment.controller.js";
import { 
    createPrescription, 
    fetchMyPrescriptions,
    fetchPrescriptions
} from "../controllers/prescription.controller.js";
import { 
    createTestResult,
    downloadTestResult,
    fetchTestResult,
    uploadTestResult
} from "../controllers/test.controller.js";
import {
    fetchAllDoctors
} from "../controllers/doctor.controller.js";
import { 
    createBill, 
    fetchBills, 
    updateBillStatus 
} from "../controllers/bill.controller.js";
import { updateClinicDetails } from "../controllers/clinic.controller.js";

const router = express.Router();

router.get("/check-auth",verifyToken,checkAuth);

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/patient-register", patientRegister);
router.post("/patient-verify", verifyPatientEmail);
router.post("/patient-login", patientLogin);
router.post("/patient-forgot", patientForgot);
router.post("/patient-reset/:token", patientReset);
router.post("/patient-logout", patientLogout);
router.get("/patient-auth", verifyPatient,authPatient);

router.post("/doctor-register", doctorRegister);
router.post("/doctor-verify", verifyDoctorEmail);
router.post("/doctor-login", doctorLogin);
router.post("/doctor-forgot", doctorForgot);
router.post("/doctor-reset/:token", doctorReset);
router.post("/doctor-logout", doctorLogout);
router.get("/doctor-auth", verifyDoctor,authDoctor);

router.post("/clinic-register", clinicRegister);
router.post("/clinic-verify", verifyClinicEmail);
router.post("/clinic-login", clinicLogin);
router.post("/clinic-forgot", clinicForgot);
router.post("/clinic-reset/:token", clinicReset);
router.post("/clinic-logout", clinicLogout);
router.get("/clinic-auth", verifyClinic,authClinic);

router.post("/book-appointment", bookAppointment);
router.post("/fetch-doctors", fetchDoctors);
router.post("/fetch-appointments", fetchAppointments);
router.post("/fetch-my-appointments", fetchMyAppointments);
router.post("/cancel-appointment", cancelAppointment);
router.post("/reschedule-appointment", rescheduleAppointment);
router.post("/change-status-appointment", changeStatusOfAppointment);

router.post("/create-prescription", createPrescription);
router.post("/fetch-my-prescriptions", fetchMyPrescriptions);
router.post("/fetch-prescriptions", fetchPrescriptions);

router.post("/create-test-result", createTestResult);
router.post("/upload-test-result", uploadTestResult);
router.post("/fetch-test-result", fetchTestResult);
router.get('/test-download/:fileId', downloadTestResult);

router.post('/fetch-all-doctors', fetchAllDoctors);

router.post('/create-bill', createBill);
router.post('/fetch-bills', fetchBills);
router.post('/update-bill-status', updateBillStatus);

router.post('/update-clinic', updateClinicDetails);

export default router;