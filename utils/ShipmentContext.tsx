import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Shipment } from '../types/shipment';


const shipmentData: Shipment[] = [
    {
        "governmentId": "NA",
        "cart": [],
        "s_Status": {
            "name": "created",
            "statusCode": 1
        },

        "imageUrls": [],
        "droneTrackLink": null,
        "isNPR": false,
        "isNDR": false,
        "isCanceled": false,
        "cancelationDetails": {
            "reason": "",
            "cancelationCharges": {
                "value": null,
                "currency": "INR"
            }
        },
        "NPRdetails": null,
        "NDRdetails": null,
        "pickUpDetails": {
            "isDone": false,
            "scheduledDate": "2025-01-03T09:34:04.023Z",
            "otpRequired": true,
            "otpVerified": false,
            "current_TS": null,
            "ItemImage": null,
            "statusIdx": 0,
            "Status": "Pending"
        },
        "deliveryDetails": {
            "isDone": false,
            "scheduledDate": "2025-01-07T21:34:04.023Z",
            "otpRequired": true,
            "otpVerified": false,
            "current_TS": null,
            "ItemImage": null,
            "statusIdx": 0,
            "Status": "Pending"
        },
        "products": [
            {
                "SKU": "26565565dsdsd",
                "Price": 500,
                "Quantity": 2,
                "ProductId": "ProductId"
            }
        ],
        "d_Status": [
            {
                "statusCode": 1,
                "lat": "NA",
                "lng": "NA",
                "TS_status": "2025-01-01T13:34:04.018Z",
                "title": "Shipment Entry Created",
                "currentLocation": "NA",
                "remarks": "Shipment Entry Created"
            }
        ],
        "assignedAWBNumbers": "TEL00012804",
        "senderDetails": {
            "email": "sender@techeagle.in",
            "address": {
                "city": "gurgaon",
                "state": "Haryana",
                "addressLine": "sample sender address line",
                "zipCode": "123456"
            },
            "pincode": "123456",
            "phoneNo": "9999999999",
            "altPhoneNo": "9898989898",
            "TS_updated": "2025-01-01T13:34:04.018Z"
        },
        "receiverDetails": {
            "email": "john@gmail.com",
            "address": {
                "city": "mumbai",
                "state": "Maharashtra",
                "addressLine": "sample receiver address line",
                "zipCode": "654321"
            },
            "pincode": "654321",
            "phoneNo": "8888888888",
            "altPhoneNo": "5656565656",
            "TS_updated": "2025-01-01T13:34:04.018Z"
        },
        "shipmentDetails": {
            "weight": 500,
            "dimensions": {
                "length": 50,
                "width": 50,
                "height": 50
            },
            "vWeight": 500,
            "eWayBillNo": "NA",
            "TS_updated": "2025-01-01T13:34:04.018Z"
        },
        "paymentDetails": {
            "isPaymentDone": false,
            "paymentMode": "NA",
            "paymentTransactionId": "NA",
            "amount": 0,
            "TS_updated": "2025-01-01T13:34:04.018Z"
        },
        "userEmail": "john@example.in",
        "TS_created": "2025-01-01T13:34:04.018Z",
        "TS_updated": "2025-01-01T13:34:04.018Z",
        "projectName": "Testing",
        "invoiceDate": "2023-10-06T06:26:39.000Z",
        "invoiceNumber": "Ship15454",
        "isScheduledConfirmed": true
    },
    {
        "governmentId": "NA",
        "cart": [],
        "s_Status": {
            "name": "created",
            "statusCode": 1
        },
        "imageUrls": [],
        "droneTrackLink": null,
        "isNPR": false,
        "isNDR": false,
        "isCanceled": false,
        "cancelationDetails": {
            "reason": "",
            "value": 0,
            "currency": ""
        },
        "NPRdetails": null,
        "NDRdetails": null,
        "pickUpDetails": {
            "isDone": false,
            "scheduledDate": "2025-01-03T19:35:47.576Z",
            "otpRequired": true,
            "otpVerified": false,
            "current_TS": null,
            "ItemImage": null,
            "statusIdx": 0,
            "Status": "Pending"
        },
        "deliveryDetails": {
            "isDone": false,
            "scheduledDate": "2025-01-11T19:35:47.576Z",
            "otpRequired": true,
            "otpVerified": false,
            "current_TS": null,
            "ItemImage": null,
            "statusIdx": 0,
            "Status": "Pending"
        },
        "products": [
            {
                "SKU": "26565565dsdsd",
                "Price": 500,
                "Quantity": 2,
                "ProductId": "ProductId"
            }
        ],
        "d_Status": [
            {
                "statusCode": 1,
                "lat": "NA",
                "lng": "NA",
                "TS_status": "2025-01-01T13:35:47.573Z",
                "title": "Shipment Entry Created",
                "currentLocation": "NA",
                "remarks": "Shipment Entry Created"
            }
        ],
        "assignedAWBNumbers": "TEL00014804",
        "senderDetails": {
            "email": "sender@techeagle.in",
            "address": {
                "city": "gurgaon",
                "state": "Haryana",
                "addressLine": "sample sender address line",
                "zipCode": "123456"
            },
            "pincode": "123456",
            "phoneNo": "9999999999",
            "altPhoneNo": "9898989898",
            "TS_updated": "2025-01-01T13:35:47.573Z"
        },
        "receiverDetails": {
            "email": "john@example.com",
            "address": {
                "city": "mumbai",
                "state": "Maharashtra",
                "addressLine": "sample receiver address line",
                "zipCode": "654321"
            },
            "pincode": "654321",
            "phoneNo": "8888888888",
            "altPhoneNo": "5656565656",
            "TS_updated": "2025-01-01T13:35:47.573Z"
        },
        "shipmentDetails": {
            "weight": 500,
            "dimensions": {
                "length": 50,
                "width": 50,
                "height": 50
            },
            "vWeight": 500,
            "eWayBillNo": "NA",
            "TS_updated": "2025-01-01T13:35:47.573Z"
        },
        "paymentDetails": {
            "isPaymentDone": false,
            "paymentMode": "NA",
            "paymentTransactionId": "NA",
            "amount": 0,
            "TS_updated": "2025-01-01T13:35:47.573Z"
        },
        "userEmail": "john@example.in",
        "TS_created": "2025-01-01T13:35:47.573Z",
        "TS_updated": "2025-01-01T13:35:47.573Z",
        "projectName": "Testing",
        "invoiceDate": "2023-10-06T06:26:39.000Z",
        "invoiceNumber": "Ship15454",
        "isScheduledConfirmed": true
    }
]

// New: Maintenance data and type
export interface Maintenance {
    id: string;
    droneId: string;
    droneName: string;
    scheduledDate: string;
    reason: string;
    comments: string;
    completed: boolean;
    completionDate?: string;
    workDone?: string[];
    technicianComments?: string;
}

const maintenanceData: Maintenance[] = [
    {
        id: 'MTN-2024-0127',
        droneId: 'DRN-2024-0127',
        droneName: 'Vertiplane X3',
        scheduledDate: '2024-01-27',
        reason: 'Routine Maintenance Check',
        comments: 'Regular quarterly inspection and calibration',
        completed: true,
        completionDate: '2024-01-27',
        workDone: [
            'Battery replacement',
            'Propeller alignment',
            'Firmware update',
            'Sensor calibration',
        ],
        technicianComments: 'All systems functioning normally after maintenance. Next scheduled check in 3 months.'
    },
    {
        id: 'MTN-2024-0128',
        droneId: 'DRN-2024-0128',
        droneName: 'Verticopter X5',
        scheduledDate: '2024-02-15',
        reason: 'Propeller Replacement',
        comments: 'Propeller damage detected during pre-flight check',
        completed: false,
    },
    // Add more records as needed
];

interface ShipmentContextProps {
    shipments: Shipment[];
    shipment: Shipment | null;
    setShipment: (shipment: Shipment | null) => void;
    maintenanceRecords: Maintenance[];
    maintenance: Maintenance | null;
    setMaintenance: (maintenance: Maintenance | null) => void;
}

const ShipmentContext = createContext<ShipmentContextProps | undefined>(undefined);

export const ShipmentProvider = ({ children }: { children: ReactNode }) => {
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [shipments] = useState<Shipment[]>(shipmentData);
    const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
    const [maintenanceRecords] = useState<Maintenance[]>(maintenanceData);

    return (
        <ShipmentContext.Provider value={{ shipments, shipment, setShipment, maintenanceRecords, maintenance, setMaintenance }}>
            {children}
        </ShipmentContext.Provider>
    );
};

export const useShipment = () => {
    const context = useContext(ShipmentContext);
    if (!context) throw new Error('useShipment must be used within a ShipmentProvider');
    return context;
}; 