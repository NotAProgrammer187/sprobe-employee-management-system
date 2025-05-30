<?php

namespace App\Http\Controllers;

use App\Models\ReviewTemplate;
use App\Models\ReviewCriteria;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReviewTemplateController extends Controller
{
    /**
     * Get all review templates
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ReviewTemplate::query();

            // Apply filters if provided
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

            // Add criteria count to each template
            $templates->each(function ($template) {
                $template->criteria_count = ReviewCriteria::where('review_template_id', $template->id)
                                                        ->whereNull('review_id')
                                                        ->count();
            });

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
            $template = ReviewTemplate::findOrFail($id);
            
            // Load template criteria (not review scores)
            $criteria = ReviewCriteria::where('review_template_id', $template->id)
                                    ->whereNull('review_id')
                                    ->orderBy('sort_order')
                                    ->get();
            
            $template->criteria = $criteria;
            $template->criteria_count = $criteria->count();

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
     * Create new review template with criteria
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validate main template data
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'nullable|string|max:100',
                'active' => 'boolean',
                'criteria' => 'required|array|min:1',
                'criteria.*.name' => 'required|string|max:255',
                'criteria.*.description' => 'nullable|string',
                'criteria.*.weight' => 'required|numeric|min:1|max:100',
            ]);

            // Validate total weight equals 100%
            $totalWeight = collect($validatedData['criteria'])->sum('weight');
            if ($totalWeight != 100) {
                return response()->json([
                    'success' => false,
                    'message' => "Total criteria weight must equal 100% (current: {$totalWeight}%)"
                ], 422);
            }

            // Start database transaction
            DB::beginTransaction();

            // Create the template
            $templateData = [
                'name' => $validatedData['name'],
                'description' => $validatedData['description'],
                'type' => $validatedData['type'] ?? 'annual',
                'active' => $validatedData['active'] ?? true,
            ];

            $template = ReviewTemplate::create($templateData);

            // Create criteria for the template
            foreach ($validatedData['criteria'] as $index => $criteriaData) {
                ReviewCriteria::create([
                    'review_template_id' => $template->id,
                    'review_id' => null, // This makes it a template criteria
                    'criteria_name' => $criteriaData['name'],
                    'criteria_description' => $criteriaData['description'],
                    'weight' => $criteriaData['weight'],
                    'sort_order' => $index + 1,
                    'score' => null, // Template criteria don't have scores
                    'comments' => null,
                ]);
            }

            // Commit transaction
            DB::commit();

            // Load the template with its criteria
            $template->load(['reviewCriteria' => function($query) {
                $query->whereNull('review_id')->orderBy('sort_order');
            }]);

            return response()->json([
                'success' => true,
                'data' => $template,
                'message' => 'Review template created successfully'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create review template',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update review template with criteria
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $template = ReviewTemplate::findOrFail($id);

            // Validate data
            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'nullable|string|max:100',
                'active' => 'boolean',
                'criteria' => 'sometimes|required|array|min:1',
                'criteria.*.id' => 'nullable', // For existing criteria
                'criteria.*.name' => 'required|string|max:255',
                'criteria.*.description' => 'nullable|string',
                'criteria.*.weight' => 'required|numeric|min:1|max:100',
            ]);

            // Validate total weight if criteria are provided
            if (isset($validatedData['criteria'])) {
                $totalWeight = collect($validatedData['criteria'])->sum('weight');
                if ($totalWeight != 100) {
                    return response()->json([
                        'success' => false,
                        'message' => "Total criteria weight must equal 100% (current: {$totalWeight}%)"
                    ], 422);
                }
            }

            // Start database transaction
            DB::beginTransaction();

            // Update template basic info
            $templateData = [
                'name' => $validatedData['name'] ?? $template->name,
                'description' => $validatedData['description'] ?? $template->description,
                'type' => $validatedData['type'] ?? $template->type,
                'active' => $validatedData['active'] ?? $template->active,
            ];

            $template->update($templateData);

            // Update criteria if provided
            if (isset($validatedData['criteria'])) {
                // Delete existing template criteria
                ReviewCriteria::where('review_template_id', $template->id)
                             ->whereNull('review_id')
                             ->delete();

                // Create new criteria
                foreach ($validatedData['criteria'] as $index => $criteriaData) {
                    ReviewCriteria::create([
                        'review_template_id' => $template->id,
                        'review_id' => null,
                        'criteria_name' => $criteriaData['name'],
                        'criteria_description' => $criteriaData['description'],
                        'weight' => $criteriaData['weight'],
                        'sort_order' => $index + 1,
                        'score' => null,
                        'comments' => null,
                    ]);
                }
            }

            // Commit transaction
            DB::commit();

            // Load the template with its criteria
            $template->load(['reviewCriteria' => function($query) {
                $query->whereNull('review_id')->orderBy('sort_order');
            }]);

            return response()->json([
                'success' => true,
                'data' => $template,
                'message' => 'Review template updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
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

            // Start transaction
            DB::beginTransaction();

            // Delete associated template criteria
            ReviewCriteria::where('review_template_id', $template->id)
                         ->whereNull('review_id')
                         ->delete();

            // Delete template
            $template->delete();

            // Commit transaction
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Review template deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
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
            
            // Get criteria that belong to this template AND have no review_id (template criteria)
            $criteria = ReviewCriteria::where('review_template_id', $template->id)
                                    ->whereNull('review_id')
                                    ->orderBy('sort_order')
                                    ->get();

            return response()->json([
                'success' => true,
                'data' => $criteria,
                'count' => $criteria->count(),
                'template' => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'type' => $template->type
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve template criteria',
                'error' => $e->getMessage(),
                'template_id' => $id
            ], 500);
        }
    }

    /**
     * Add criteria to existing template
     */
    public function addCriteria(Request $request, $id): JsonResponse
    {
        try {
            $template = ReviewTemplate::findOrFail($id);

            $validatedData = $request->validate([
                'criteria_name' => 'required|string|max:255',
                'criteria_description' => 'nullable|string',
                'weight' => 'required|numeric|min:1|max:100',
            ]);

            // Check if adding this weight would exceed 100%
            $currentWeight = ReviewCriteria::where('review_template_id', $template->id)
                                         ->whereNull('review_id')
                                         ->sum('weight');
            
            if (($currentWeight + $validatedData['weight']) > 100) {
                return response()->json([
                    'success' => false,
                    'message' => 'Adding this criteria would exceed 100% total weight'
                ], 422);
            }

            // Get next sort order
            $nextSortOrder = ReviewCriteria::where('review_template_id', $template->id)
                                         ->whereNull('review_id')
                                         ->max('sort_order') + 1;

            $criteria = ReviewCriteria::create([
                'review_template_id' => $template->id,
                'review_id' => null,
                'criteria_name' => $validatedData['criteria_name'],
                'criteria_description' => $validatedData['criteria_description'],
                'weight' => $validatedData['weight'],
                'sort_order' => $nextSortOrder,
                'score' => null,
                'comments' => null,
            ]);

            return response()->json([
                'success' => true,
                'data' => $criteria,
                'message' => 'Criteria added successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add criteria',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update specific criteria
     */
    public function updateCriteria(Request $request, $templateId, $criteriaId): JsonResponse
    {
        try {
            $template = ReviewTemplate::findOrFail($templateId);
            $criteria = ReviewCriteria::where('id', $criteriaId)
                                    ->where('review_template_id', $templateId)
                                    ->whereNull('review_id')
                                    ->firstOrFail();

            $validatedData = $request->validate([
                'criteria_name' => 'sometimes|required|string|max:255',
                'criteria_description' => 'nullable|string',
                'weight' => 'sometimes|required|numeric|min:1|max:100',
            ]);

            // Check weight constraints if weight is being updated
            if (isset($validatedData['weight'])) {
                $otherCriteriaWeight = ReviewCriteria::where('review_template_id', $templateId)
                                                   ->whereNull('review_id')
                                                   ->where('id', '!=', $criteriaId)
                                                   ->sum('weight');
                
                if (($otherCriteriaWeight + $validatedData['weight']) > 100) {
                    return response()->json([
                        'success' => false,
                        'message' => 'This weight would exceed 100% total weight'
                    ], 422);
                }
            }

            $criteria->update($validatedData);

            return response()->json([
                'success' => true,
                'data' => $criteria,
                'message' => 'Criteria updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update criteria',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete specific criteria
     */
    public function deleteCriteria($templateId, $criteriaId): JsonResponse
    {
        try {
            $template = ReviewTemplate::findOrFail($templateId);
            $criteria = ReviewCriteria::where('id', $criteriaId)
                                    ->where('review_template_id', $templateId)
                                    ->whereNull('review_id')
                                    ->firstOrFail();

            $criteria->delete();

            return response()->json([
                'success' => true,
                'message' => 'Criteria deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete criteria',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}