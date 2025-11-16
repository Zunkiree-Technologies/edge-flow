"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const categoryService = __importStar(require("../services/categoryService"));
const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.json(category);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.createCategory = createCategory;
const getAllCategories = async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(Number(req.params.id));
        res.json(category);
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(Number(req.params.id), req.body);
        res.json(category);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(Number(req.params.id));
        res.json({ message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
};
exports.deleteCategory = deleteCategory;
