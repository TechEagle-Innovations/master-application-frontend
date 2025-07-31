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

export interface addBattery
{
 "model": string,
  "num_of_cells": number,
  "voltage": number,
  "mah": number,
  "battery_type": "li-ion" | "li-po",
  "image": string,
  "current_voltage": number,
  "curr_max_vdiff": number
}

interface stopChargingData {
    
  "charge_start_time": string,
  "charge_end_time": string,
  "cell_voltage": Record<string, number>,
  "maxVdiff": number,
  "voltage_before_charge": number,
  "voltage_after_charge": number,
  "remark": string,
  "monitor_by": string | undefined

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
    // Add more drone-related methods here as needed

    async addBattery(battery: addBattery) {
        return this.post('/', battery);
    }

    async startCharging(batteryId: string) {
        console.log('Starting charging for battery:', batteryId);
        return this.put(`/start-charge//${batteryId}`, {});
    }

    async stopCharging(batteryId: string, data: stopChargingData) {
        console.log('Stopping charging for battery:', batteryId);
        return this.post(`/charge-history/${batteryId}`, data);
    }

    async discardBattery(batteryId: string) {
        console.log('Discarding battery:', batteryId);
        return this.put(`discard/${batteryId}`, {});
    }
}

export const batteryService = BatteryService.getInstance(); 