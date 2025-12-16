import { User } from '../users/entities/user.entity.js';
import { DashboardService, OwnerStats, SystemStats } from './dashboard.service.js';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSystemStats(): Promise<SystemStats>;
    getOwnerStats(user: User): Promise<OwnerStats>;
}
