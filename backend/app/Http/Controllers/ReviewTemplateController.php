<?php

namespace App\Http\Controllers;

use App\Models\ReviewTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewTemplateController extends Controller
{
    /**
     * Get all review templates
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ReviewTemplate::query();

            // Apply filters if provided - Fixed field name from 'is_active' to 'active'
            if ($request->has('active')) {
                $query->where('active', $request->boolean('active'));
            }

            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $templates = $query->orderBy('name')->get();

            return response()->json([
                'success' => true,
                'data' => $templates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve review templates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show specific review template
     */
    public function show($id): JsonResponse
    {
        try {
            $template = ReviewTemplate::with(['reviewCriteria'])
                                    ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $template
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Review template not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new review template
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'nullable|string|max:100',
                'active' => 'boolean', // Fixed field name
                'criteria_structure' => 'nullable|array' // Fixed field name
            ]);

            $template = ReviewTemplate::create($validatedData);

            return response()->json([
                'success' => true,
                'data' => $template,
                'message' => 'Review template created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create review template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update review template
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $template = ReviewTemplate::findOrFail($id);

            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'nullable|string|max:100',
                'active' => 'boolean', // Fixed field name
                'criteria_structure' => 'nullable|array' // Fixed field name
            ]);

            $template->update($validatedData);

            return response()->json([
                'success' => true,
                'data' => $template,
                'message' => 'Review template updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update review template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete review template
     */
    public function destroy($id): JsonResponse
    {
        try {
            $template = ReviewTemplate::findOrFail($id);
            
            // Check if template is being used in any reviews
            if ($template->reviews()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete template that is being used in reviews'
                ], 400);
            }

            $template->delete();

            return response()->json([
                'success' => true,
                'message' => 'Review template deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete review template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get criteria for a specific template
     */
    public function getCriteria($id): JsonResponse
    {
        try {
            $template = ReviewTemplate::findOrFail($id);
            $criteria = $template->reviewCriteria()
                                ->orderBy('sort_order') // Fixed column name from 'order' to 'sort_order'
                                ->get();

            return response()->json([
                'success' => true,
                'data' => $criteria
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve template criteria',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}