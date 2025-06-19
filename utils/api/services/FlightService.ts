import { BaseService } from "./BaseService";

export interface FlightHistoryItem {
    _id: string;
    drone_id: string;
    localFlightId: string;
    pilot_id1: string;
    pilot_id2: string;
    order_destination_location: string;
    hub_id: string;
    date_created: string;
    mission_file: string;
    mission_details: any;
    time_taken: number;
    start_location: string;
    end_location: string;
    payload: number;
    uploadMissionFile: any;
    flight_type: string;
    order_no: string;
    order_type: string;
    isOrderFlight: boolean;
    order_id: string;
    dronebookingId: string;
    isCompleted: boolean;
    isAborted: boolean;
    finalStatus: any;
    flightDoneUsing: string;
    flightLog: any;
    isPreFlightChecklistCompleted: boolean;
    isPostFlightChecklistCompleted: boolean;
    preFlightChecklist: any[];
    postFlightChecklist: any[];
    flightStatus: any;
    scheduleDetails: any;
    scheduleLog: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  interface FlightHistoryApiResponse {
    status: string;
    message: string;
    data: FlightHistoryItem[];
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
  
    async getFlightHistory(droneId: string): Promise<FlightHistoryItem[]> {
      try {
        const response: FlightHistoryApiResponse = await this.get(`flight-history/${droneId}`);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  
    // Add more drone-related methods here as needed
  }
  
  export const flightService = FlightService.getInstance(); 