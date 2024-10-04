import React from 'react';
import { BrowserRouter as Router, Routes, Route , Navigate} from 'react-router-dom';
import LandingPage from './HomePage/LandingPage';
import PatientHome from './Patient/PatientHome';
import DoctorHome from './Doctor/DoctorHome';
import ClinicHome from './Clinic/ClinicHome';

import BookAppointment from './Patient/pages/BookAppointments';
import MyAppointments from './Patient/pages/MyAppointments';
import MyPrescriptions from './Patient/pages/MyPrescriptions';
import TestResults from './Patient/pages/TestResults';
import BillingPayments from './Patient/pages/BillingPayments';
import PatientProfileSettings from './Patient/pages/PatientProfileSettings';

import DoctorDashboard from './Doctor/pages/DoctorDashboard';
import AppointmentManage from './Doctor/pages/AppointmentManage';
import PrescriptionPage from './Doctor/pages/PrescriptionPage';
import TestResultsManagement from './Doctor/pages/TestResultsManagement';
import ConsultationsBilling from './Doctor/pages/ConsultationsBilling';
import DoctorProfileSettings from './Doctor/pages/DoctorProfileSettings'

import ManageAppointments from './Clinic/pages/ManageAppointments';
import PrescriptionLogs from './Clinic/pages/PrescriptionLogs';
import TestResultsManage from './Clinic/pages/TestResultsManage';
import BillingManagement from './Clinic/pages/BillingManagement';
import ClinicProfileSettings from './Clinic/pages/ClinicProfileSettings';
import DoctorList from './Clinic/pages/DoctorList';

import ClinicLogin from './Auth/ClinicLogin';
import ClinicRegister from './Auth/ClinicRegister';
import DoctorLogin from './Auth/DoctorLogin';
import DoctorRegister from './Auth/DoctorRegister';
import PatientLogin from './Auth/PatientLogin';
import PatientRegister from './Auth/PatientRegister';
import PatientResetPassword from './Auth/PatientResetPassword';
import DoctorResetPassword from './Auth/DoctorResetPassword';
import ClinicResetPassword from './Auth/ClinicResetPassword';

import axios from 'axios';

axios.defaults.withCredentials = true;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-register" element={<PatientRegister />} />
        <Route path="/patient-reset/:token" element={<PatientResetPassword />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />
        <Route path="/doctor-reset/:token" element={<DoctorResetPassword />} />
        <Route path="/clinic-login" element={<ClinicLogin />} />
        <Route path="/clinic-register" element={<ClinicRegister />} />
        <Route path="/clinic-reset/:token" element={<ClinicResetPassword />} />

        <Route path="/patient-home" element={<PatientHome />}>
          {/* Default path for Outlet */}
          <Route index element={<Navigate to="my-appointments" />} />

          <Route path="my-appointments" element={<MyAppointments />} />
          <Route path="my-prescriptions" element={<MyPrescriptions />} />
          <Route path="billing-payments" element={<BillingPayments />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="test-result" element={<TestResults />} />
          <Route path="patient-profile-settings" element={<PatientProfileSettings />} />
        </Route>
        <Route path="/doctor-home" element={<DoctorHome />}>
          {/* Default path for Outlet */}{/* Default path for Outlet */}
          <Route index element={<Navigate to="doctor-dashboard" />} />

          <Route path="appointment-manage" element={<AppointmentManage />} />
          <Route path="doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="consultations-billing" element={<ConsultationsBilling />} />
          <Route path="prescription-page" element={<PrescriptionPage />} />
          <Route path="test-results-management" element={<TestResultsManagement />} />
          <Route path="doctor-profile-settings" element={<DoctorProfileSettings />} />
        </Route>
        <Route path="/clinic-home" element={<ClinicHome />}>
          {/* Default path for Outlet */}
          <Route index element={<Navigate to="manage-appointments" />} />

          <Route path="test-results-manage" element={<TestResultsManage />} />
          <Route path="prescription-logs" element={<PrescriptionLogs />} />
          <Route path="manage-appointments" element={<ManageAppointments />} />
          <Route path="billing-management" element={<BillingManagement />} />
          <Route path="clinic-profile-settings" element={<ClinicProfileSettings />} />
          <Route path="doctor-list" element={<DoctorList />} />
        </Route>
        {/* catch all routes */}
				<Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Router>
  );
};

export default App;
