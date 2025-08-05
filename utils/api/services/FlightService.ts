import { BaseService } from "./BaseService";

interface ChecklistItem {
  _id: string;
  serial_no: number;
  templateType_name: string;
  active: boolean;
  label: string;
  parameters: any[]; // Can be more specific if parameter structure is known
  confirm: boolean;
  notes: string;
  __v: number;
}

interface FlightStatusTimestamps {
  created: string | null;
  assignedToDrone: string | null;
  started: string | null;
  preCheck: string | null;
  missionStarted: string | null;
  missionCompleted: string | null;
  postCheck: string | null;
  payloadRemoved: string | null;
  flightLogUploaded: string | null;
  aborted: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleDetail {
  date: string;
  doneBy: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleLog extends ScheduleDetail { }

interface MissionDetails {
  takeoffAMSL: number | null;
  landingAMSL: number | null;
  maxAMSL: number | null;
  minAMSL: number | null;
  AMSLdifference: number | null;
  missionFileLink: string | null;
  roadDistance: number | null;
  roadTime: number | null;
  createdAt: string;
  updatedAt: string;
}

interface FlightLog {
  isFlightLogAdded: boolean;
  logFileName: string | null;
  date: string | null;
}

interface FinalStatus {
  status: boolean;
  reason: string | null;
}

export interface Flight {
  _id: string;
  drone_id: string;
  localFlightId: string;
  pilot_id1: string;
  pilot_id2: string;
  order_destination_location: string;
  hub_id: string;
  date_created: string;
  mission_file: string;
  mission_details: MissionDetails;
  time_taken: number;
  start_location: string;
  end_location: string;
  payload: number;
  uploadMissionFile: string | null;
  flight_type: string;
  order_no: string;
  order_type: string;
  isOrderFlight: boolean;
  order_id: string;
  dronebookingId: string;
  isCompleted: boolean;
  isAborted: boolean;
  finalStatus: FinalStatus;
  flightDoneUsing: string;
  flightLog: FlightLog;
  isPreFlightChecklistCompleted: boolean;
  isPostFlightChecklistCompleted: boolean;
  preFlightChecklist: ChecklistItem[];
  postFlightChecklist: ChecklistItem[];
  flightStatus: FlightStatusTimestamps;
  scheduleDetails: ScheduleDetail;
  scheduleLog: ScheduleLog[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface FlightHistoryApiResponse {
  status: string;
  message: string;
  data: Flight[];
}
export interface DeliveryConfirmation {
  deliveredItemImage: (string | null)[];
  AWB: string;
  deliveredTime: Date; // ISO date string
  pocDetails: {
    pocName: string;
    phone_no: string;
  };
}


class FlightService extends BaseService {
  private static instance: FlightService;

  private constructor() {
    super('fleet');
  }

  static getInstance(): FlightService {
    if (!FlightService.instance) {
      FlightService.instance = new FlightService();
    }
    return FlightService.instance;
  }

  async getAllDronesAtHub() {
    return this.get('all-drones-at-hub');
  }

  async getFlightHistory(droneId: string): Promise<Flight[]> {
    // try {
    // const response: FlightHistoryApiResponse = await this.get(`flight-history/${droneId}`);
    return await this.get(`flight-history/${droneId}`);
    //   return response.data;
    // } catch (error) {
    //   this.handleError(error);
    // }
  }

  async getAllLocationBasedFlights(locationId: string) {
    return this.get(`flight-location/${locationId}`);
  }

  async connectDrone(droneId: string) {
    return this.post(`connect-drone?droneId=${droneId}`);
  }

  async getAllShipments() {
    return this.get("my-shipments")
  }

  async getOneShipment(flightId: string) {
    return this.get(`flight-shipments/${flightId}`);
  }

  async getPreFlight(config: any) {
    return this.get('preflight', config)
  }

  async getPostFlight(config: any) {
    return this.get('postflight', config)
  }

  async completePostFlight(data: any, config: any) {
    return this.post('postflight', data, config)
  }

  async completePreFlight(data: any, config: any) {
    return this.post('preflight', data, config)
  }

  async getShipmentForFlight(flightId: string) {
    return this.get(`/flight-shipments/${flightId}`)
  }

  async outForDelivery(awb: string) {
    return this.put(`shipment-ofd/${awb}`, {p:0})
  }

  async delivered(deliveryData: DeliveryConfirmation) {
    return this.put(`shipment-delivery`, deliveryData)
  }
}

export const flightService = FlightService.getInstance();