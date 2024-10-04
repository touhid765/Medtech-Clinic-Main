import { Bill } from "../models/bill.model.js";
import { Appointment } from '../models/appointment.model.js';

// Controller for fetching doctors
export const createBill = async (req, res) => {
    const {appointmentId, date, amount, notes} = req.body;

    
    // Validation for required fields
    if (!appointmentId || !amount || !date) {
        return res.status(400).json({ 
            success: false, 
            message: 'Appointment ID, date and amount are required.' 
        });
    }

    try {
        // Fetch doctors from the database
        const appointment = await Appointment.findOne({appointmentId:appointmentId})
            .populate('patient')
            .populate('doctor')
            .exec();

        if (!appointment) {
            return res.status(400).json({ message: 'Appointment not found' });
        }
        const { patient , doctor } = appointment;
        
        const newBill = new Bill({
            patient: patient._id,
            doctor: doctor._id,
            appointment: appointment._id,
            billDate: new Date(date),
            amount: amount,
            notes: notes || '' 
        })
        // Save the new bill to the database
        await newBill.save();

        // Return success response with the saved bill
        return res.status(201).json({
            success: true,
            message: 'Bill created successfully.',
            bill: newBill
        });

    } catch (error) {
        console.error('Error creating bill:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating bill.'
        });
    }
};

// Controller for fetching doctors
export const fetchBills = async (req, res) => {
    try {
        // Fetch doctors from the database
        const bills = await Bill.find()
            .populate('patient','name patientId')
            .populate('doctor' , 'name doctorId')
            .populate('appointment', 'appointmentId')
            .exec();

        if (!bills.length) {
            return res.status(400).json({ message: 'bills not found' });
        }

        // Return success response with the saved bill
        return res.status(201).json({
            success: true,
            bills: bills
        });

    } catch (error) {
        console.error('Error fetching bills:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching bill.'
        });
    }
};

// Controller for fetching doctors
export const updateBillStatus = async (req, res) => {
    const { billId, status} = req.body;

    if( !billId || !status){
        return res.status(400).json({ 
            success: false, 
            message: 'Bill ID, status are required.' 
        });
    }

    try {
        // Fetch doctors from the database
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(400).json({ message: 'bill not found' });
        }

        bill.status = status;
        await bill.save();

        // Return success response with the saved bill
        return res.status(201).json({
            success: true,
            bill: bill
        });

    } catch (error) {
        console.error('Error fetching bill:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching bill.'
        });
    }
};