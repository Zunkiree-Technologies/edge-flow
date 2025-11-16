"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowAction = exports.DepartmentStage = void 0;
var DepartmentStage;
(function (DepartmentStage) {
    DepartmentStage["NEW_ARRIVAL"] = "NEW_ARRIVAL";
    DepartmentStage["IN_PROGRESS"] = "IN_PROGRESS";
    DepartmentStage["COMPLETED"] = "COMPLETED";
})(DepartmentStage || (exports.DepartmentStage = DepartmentStage = {}));
var WorkflowAction;
(function (WorkflowAction) {
    WorkflowAction["ADVANCE"] = "ADVANCE";
    WorkflowAction["REJECT"] = "REJECT";
    WorkflowAction["ALTER"] = "ALTER";
})(WorkflowAction || (exports.WorkflowAction = WorkflowAction = {}));
