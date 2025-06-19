export interface Address {
  city: string;
  state: string;
  addressLine: string;
  zipCode: string;
}

export interface SenderReceiverDetails {
  email: string;
  address: Address;
  pincode: string;
  phoneNo: string;
  altPhoneNo: string;
  TS_updated: string;
}

export interface Product {
  SKU: string;
  Price: number;
  Quantity: number;
  ProductId: string;
}

export interface DStatus {
  statusCode: number;
  lat: string;
  lng: string;
  TS_status: string;
  title: string;
  currentLocation: string;
  remarks: string;
}

export interface ShipmentDetails {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  vWeight: number;
  eWayBillNo: string;
  TS_updated: string;
}

export interface PaymentDetails {
  isPaymentDone: boolean;
  paymentMode: string;
  paymentTransactionId: string;
  amount: number;
  TS_updated: string;
}

export interface CancelationDetails {
  reason: string;
  cancelationCharges?: {
    value: number | null;
    currency: string;
  };
  value?: number;
  currency?: string;
}

export interface Status {
  name: string;
  statusCode: number;
}

export interface PickUpOrDeliveryDetails {
  isDone: boolean;
  scheduledDate: string;
  otpRequired: boolean;
  otpVerified: boolean;
  current_TS: string | null;
  ItemImage: string | null;
  statusIdx: number;
  Status: string;
}

export interface ShipmentAPIResponse {
  status: string;
  message: string;
  data: Shipment[];
}

export interface Shipment {
  governmentId: string;
  cart: any[];
  s_Status: Status;
  imageUrls: string[];
  droneTrackLink: string | null;
  isNPR: boolean;
  isNDR: boolean;
  isCanceled: boolean;
  cancelationDetails: CancelationDetails;
  NPRdetails: any;
  NDRdetails: any;
  pickUpDetails: PickUpOrDeliveryDetails;
  deliveryDetails: PickUpOrDeliveryDetails;
  products: Product[];
  d_Status: DStatus[];
  assignedAWBNumbers: string;
  senderDetails: SenderReceiverDetails;
  receiverDetails: SenderReceiverDetails;
  shipmentDetails: ShipmentDetails;
  paymentDetails: PaymentDetails;
  userEmail: string;
  TS_created: string;
  TS_updated: string;
  projectName: string;
  invoiceDate: string;
  invoiceNumber: string;
  isScheduledConfirmed: boolean;
} 