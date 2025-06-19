import { BaseService } from './BaseService';



class DroneService extends BaseService {
  private static instance: DroneService;

  private constructor() {
    super('drone');
  }

  static getInstance(): DroneService {
    if (!DroneService.instance) {
      DroneService.instance = new DroneService();
    }
    return DroneService.instance;
  }

  async getAllDronesAtHub() {
    return this.get('all-drones-at-hub');
  }
  // Add more drone-related methods here as needed
}

export const droneService = DroneService.getInstance(); 