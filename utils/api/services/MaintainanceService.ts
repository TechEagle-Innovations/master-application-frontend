import { BaseService } from './BaseService';


export interface ReportIssue {
    droneId: string,
    reportedBy: string | undefined,
    description: string,
    issueType: string,
    issueSeverity: string,
    userComments: string,
    priority: string
}

// types/droneImagesAI.ts

export type DefectClassName =
  | "crack"
  | "dent"
  | "paint-off"
  | "scratch"
  | "missing-head";

export interface ImagePart {
  url: string;
  defectClassName: DefectClassName;
}

export interface DroneImagesAI {
  _id?: string; 
  droneId: string;
  imageParts: Record<string, ImagePart>; 
  createdAt?: string;
  updatedAt?: string;
}

class MaintainanceService extends BaseService {
    
    private static instance: MaintainanceService;

    private constructor() {
        super('maintainance');
    }

    static getInstance(): MaintainanceService {
        if (!MaintainanceService.instance) {
            MaintainanceService.instance = new MaintainanceService();
        }
        return MaintainanceService.instance;
    }

    async reportIssue(data: ReportIssue) {
        return this.post('report-issue', data);
    }

    async getMaintenanceRecords() {
        return this.get('/');
    }
     
    async droneMaintenanceSurvey(data: DroneImagesAI) {
        return this.post('/drone-images-ai', data);
    }
    // Add more drone-related methods here as needed
}

export const maintainanceService = MaintainanceService.getInstance(); 