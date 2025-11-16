"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductionView = void 0;
const productionViewService_1 = require("../services/productionViewService");
/**
 * Get production view data
 * GET /api/production-view
 *
 * Query parameters (optional):
 * - start_date: Filter by start date (YYYY-MM-DD)
 * - end_date: Filter by end date (YYYY-MM-DD)
 * - department_id: Filter by specific department
 */
const getProductionView = async (req, res) => {
    try {
        const { start_date, end_date, department_id } = req.query;
        let data;
        // Check if filters are provided
        if (start_date || end_date || department_id) {
            const startDate = start_date ? new Date(start_date) : undefined;
            const endDate = end_date ? new Date(end_date) : undefined;
            const deptId = department_id ? parseInt(department_id) : undefined;
            data = await (0, productionViewService_1.getProductionViewDataWithFilter)(startDate, endDate, deptId);
        }
        else {
            data = await (0, productionViewService_1.getProductionViewData)();
        }
        res.status(200).json({
            success: true,
            message: "Production view data fetched successfully",
            data,
        });
    }
    catch (error) {
        console.error("Error in getProductionView controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch production view data",
            error: error.message,
        });
    }
};
exports.getProductionView = getProductionView;
