import Category from '../models/Category.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

// Predefined categories for news portal
const DEFAULT_CATEGORIES = [
    { name: 'Politics', description: 'Political news and analysis' },
    { name: 'Business', description: 'Business and economic news' },
    { name: 'Technology', description: 'Latest technology and innovation news' },
    { name: 'Sports', description: 'Sports news and updates' },
    { name: 'Entertainment', description: 'Entertainment and celebrity news' },
    { name: 'Health', description: 'Health and medical news' },
    { name: 'Science', description: 'Science and research discoveries' },
    { name: 'World', description: 'International news and global events' },
    { name: 'National', description: 'National and domestic news' },
    { name: 'Education', description: 'Education and academic news' },
    { name: 'Environment', description: 'Environmental and climate news' },
    { name: 'Crime', description: 'Crime and legal news' },
    { name: 'Lifestyle', description: 'Lifestyle and living tips' },
    { name: 'Opinion', description: 'Opinion pieces and editorials' },
    { name: 'Breaking News', description: 'Urgent and breaking news' }
];

// Initialize default categories if they don't exist
async function initializeDefaultCategories() {
    try {
        for (const categoryData of DEFAULT_CATEGORIES) {
            const existingCategory = await Category.findOne({ name: categoryData.name });
            if (!existingCategory) {
                const category = new Category(categoryData);
                await category.save();
                console.log(`Created default category: ${categoryData.name}`);
            }
        }
    } catch (error) {
        console.error('Error initializing default categories:', error);
    }
}

// Initialization will be called after DB connection

// Create a new category
async function createCategory(req, res) {
    try {
        const { name, description } = req.body;
        const category = new Category({ name, description });
        await category.save();
        return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Category with this name already exists' });
        }
        return res.status(500).json({ error: 'Failed to create category' });
    }
}

// Get list of categories
async function getCategories(req, res) {
    try {
        // Initialize default categories if none exist
        await initializeDefaultCategories();

        const categories = await Category.find();
        return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch categories' });
    }
}

// Get a single category by id
async function getCategoryById(req, res) {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        return res.status(200).json(new ApiResponse(200, category, "Category fetched successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch category' });
    }
}

// Update a category by id
async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;
        const category = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ error: 'Category not found' });
        return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update category' });
    }
}

// Delete a category by id
async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        return res.status(200).json(new ApiResponse(200, {}, "Category deleted successfully"));
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete category' });
    }
}

export {
    initializeDefaultCategories,
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
