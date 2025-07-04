import { BaseService } from './BaseService';


export interface Battery {
  _id: string;
  serialNumber: string;
  model: string;
  numberOfCells: number;
  voltage: number;
  capacityMah: number;
  locationId: string;
  currentFlightId: string | null;
  currentDroneId: string | null;
  flightsCount: number;
  status: 'idle' | 'charging' | 'discharging' | 'maintenance'; // Add other statuses if needed
  chargingPercentage: number;
  createdAt: string; // or Date, depending on how you're using it
  updatedAt: string; // or Date
  __v: number;
};


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
    // Add more drone-related methods here as needed
}

export const batteryService = BatteryService.getInstance(); 