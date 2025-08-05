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
    charged_status: 'charged' | 'discharged' | 'discarded' | 'charging' | "Engaged" ; 
    locationId: string;
    hubId: string;
    isDiscarded:boolean;
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
export interface AddBattery
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
interface DisconnectPayload {
    all_Battery: string[];
    batteryVoltages: Record<string, number>; // or { [batteryId: string]: number }
    end_location: string;
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

    async addBattery(battery: AddBattery) {
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

    async disconnectBattery(batteryData: DisconnectPayload) {
        return this.put(`disconnect`, batteryData);
    } 
}

export const batteryService = BatteryService.getInstance(); 