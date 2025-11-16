"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const db_1 = __importDefault(require("../config/db"));
const createCategory = async (data) => {
    const categoryName = data.category_name.trim().toLowerCase(); // normalize for case-insensitive check
    // Check if category already exists
    const existing = await db_1.default.categories.findFirst({
        where: { category_name: { equals: categoryName, mode: "insensitive" } }, // case-insensitive
    });
    if (existing) {
        throw new Error("Category already exists");
    }
    return await db_1.default.categories.create({
        data: { category_name: categoryName },
    });
};
exports.createCategory = createCategory;
const getAllCategories = async () => {
    return await db_1.default.categories.findMany();
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (id) => {
    const category = await db_1.default.categories.findUnique({ where: { id } });
    if (!category)
        throw new Error("Category not found");
    return category;
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (id, data) => {
    if (data.category_name) {
        const categoryName = data.category_name.trim().toLowerCase();
        const existing = await db_1.default.categories.findFirst({
            where: {
                category_name: { equals: categoryName, mode: "insensitive" },
                NOT: { id },
            },
        });
        if (existing) {
            throw new Error("Category already exists");
        }
        return await db_1.default.categories.update({
            where: { id },
            data: { category_name: categoryName },
        });
    }
    return await db_1.default.categories.update({
        where: { id },
        data,
    });
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    return await db_1.default.categories.delete({ where: { id } });
};
exports.deleteCategory = deleteCategory;
