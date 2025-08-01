import { BaseService } from './BaseService';


export interface Battery {
    _id: string;
    model: string;
    num_of_cells: number;
    voltage: number;
    current_voltage: number;
    mah: number;
    battery_id: string;
    battery_type: 'li-ion' | 'li-po' | string; 
    image: string;
    charged_status: 'charged' | 'discharged' | 'dicarded' | 'charging' ; 
    locationId: string;
    hubId: string;
    created_by: string;
    cycle_count: number;
    curr_max_vdiff: number;
    history: Array<unknown>; 
    flight_history: Array<unknown>; 
    createdAt: string | Date;
    updatedAt: string | Date;
    current_flight_id: string;
    __v: number;
  }
export interface ConnectBatteryData {
    all_battery: string[];
    flightId: string ;
    droneId: string;
}

class BatteryService extends BaseService {
    private static instance: BatteryService;

    private constructor() {
        super('batteries');
    }

    static getInstance(): BatteryService {
        if (!BatteryService.instance) {
            BatteryService.instance = new BatteryService();
        }
        return BatteryService.instance;
    }

    async getBatteries() {
        return this.get('/');
    }

    async connectBattery(data: ConnectBatteryData) {
        return this.put("/connect", data)
    }
    // Add more drone-related methods here as needed
}

export const batteryService = BatteryService.getInstance(); 