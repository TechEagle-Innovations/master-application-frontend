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
    // Add more drone-related methods here as needed
}

export const maintainanceService = MaintainanceService.getInstance(); 