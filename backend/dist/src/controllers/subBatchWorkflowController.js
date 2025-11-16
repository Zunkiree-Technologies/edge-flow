"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkflowStatus = void 0;
const subBatchWorkflow_1 = require("../services/subBatchWorkflow");
const getWorkflowStatus = async (req, res) => {
    try {
        const { subBatchId } = req.params;
        if (!subBatchId) {
            return res
                .status(400)
                .json({ success: false, message: "subBatchId is required" });
        }
        const workflow = await (0, subBatchWorkflow_1.getSubBatchWorkflowStatus)(Number(subBatchId));
        if (!workflow) {
            return res
                .status(404)
                .json({
                success: false,
                message: "Workflow not found for this sub-batch",
            });
        }
        return res.json({ success: true, data: workflow });
    }
    catch (error) {
        console.error("Error fetching workflow status:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWorkflowStatus = getWorkflowStatus;
