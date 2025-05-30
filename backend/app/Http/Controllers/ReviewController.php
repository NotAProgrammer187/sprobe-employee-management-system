<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\ReviewCriteria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    // Get all reviews
    public function index(Request $request)
    {
        try {
            $query = Review::with(['employee', 'reviewer', 'reviewTemplate']);

            // Apply filters if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Pagination
            if ($request->has('per_page')) {
                $reviews = $query->paginate($request->per_page);
            } else {
                $reviews = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get upcoming reviews
    public function upcoming()
    {
        try {
            $reviews = Review::where('status', 'pending')
                            ->orWhere('status', 'draft')
                            ->orderBy('review_period_end', 'asc')
                            ->limit(10)
                            ->with(['employee', 'reviewer'])
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve upcoming reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get completed reviews
    public function completed()
    {
        try {
            $reviews = Review::whereIn('status', ['completed', 'approved'])
                            ->with(['employee', 'reviewer'])
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve completed reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get reviews by reviewer
    public function getByReviewer($reviewerId)
    {
        try {
            $reviews = Review::where('reviewer_id', $reviewerId)
                            ->with(['employee', 'reviewTemplate'])
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reviews by reviewer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Show specific review
    public function show($id)
    {
        try {
            $review = Review::with(['employee', 'reviewer', 'reviewTemplate', 'reviewCriteria'])
                           ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    // Create review
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'employee_id' => 'required|exists:employees,id',
                'review_template_id' => 'required|exists:review_templates,id',
                'reviewer_id' => 'nullable|exists:employees,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'review_period_start' => 'nullable|date',
                'review_period_end' => 'nullable|date',
                'review_date' => 'required|date',
                'status' => 'required|in:draft,pending,completed,approved,rejected',
                'overall_comments' => 'nullable|string',
                'criteria' => 'nullable|array',
                'criteria.*.criteria_name' => 'required|string',
                'criteria.*.criteria_description' => 'nullable|string',
                'criteria.*.weight' => 'nullable|numeric',
                'criteria.*.score' => 'nullable|numeric',
                'criteria.*.comments' => 'nullable|string',
                'criteria.*.sort_order' => 'nullable|integer'
            ]);

            DB::beginTransaction();

            // Create the review
            $review = Review::create($validatedData);

            // Create criteria if provided
            if (!empty($validatedData['criteria'])) {
                foreach ($validatedData['criteria'] as $criteriaData) {
                    ReviewCriteria::create([
                        'review_id' => $review->id,
                        'review_template_id' => $review->review_template_id,
                        'criteria_name' => $criteriaData['criteria_name'],
                        'criteria_description' => $criteriaData['criteria_description'] ?? null,
                        'weight' => $criteriaData['weight'] ?? 0,
                        'score' => $criteriaData['score'] ?? 0,
                        'comments' => $criteriaData['comments'] ?? null,
                        'sort_order' => $criteriaData['sort_order'] ?? 0
                    ]);
                }
            }

            DB::commit();

            // Load the review with relationships
            $review = Review::with(['employee', 'reviewer', 'reviewTemplate', 'reviewCriteria'])->find($review->id);

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update review
    public function update(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);

            $validatedData = $request->validate([
                'employee_id' => 'sometimes|required|exists:employees,id',
                'review_template_id' => 'sometimes|required|exists:review_templates,id',
                'reviewer_id' => 'nullable|exists:employees,id',
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'review_period_start' => 'nullable|date',
                'review_period_end' => 'nullable|date',
                'review_date' => 'sometimes|required|date',
                'status' => 'sometimes|required|in:draft,pending,completed,approved,rejected',
                'overall_score' => 'nullable|numeric|min:0|max:5',
                'overall_comments' => 'nullable|string',
                'criteria' => 'nullable|array',
                'criteria.*.criteria_name' => 'required|string',
                'criteria.*.criteria_description' => 'nullable|string',
                'criteria.*.weight' => 'nullable|numeric',
                'criteria.*.score' => 'nullable|numeric',
                'criteria.*.comments' => 'nullable|string',
                'criteria.*.sort_order' => 'nullable|integer'
            ]);

            DB::beginTransaction();

            // Update the review
            $review->update($validatedData);

            // Update criteria if provided
            if (isset($validatedData['criteria'])) {
                // Delete existing criteria
                ReviewCriteria::where('review_id', $review->id)->delete();
                
                // Create new criteria
                foreach ($validatedData['criteria'] as $criteriaData) {
                    ReviewCriteria::create([
                        'review_id' => $review->id,
                        'review_template_id' => $review->review_template_id,
                        'criteria_name' => $criteriaData['criteria_name'],
                        'criteria_description' => $criteriaData['criteria_description'] ?? null,
                        'weight' => $criteriaData['weight'] ?? 0,
                        'score' => $criteriaData['score'] ?? 0,
                        'comments' => $criteriaData['comments'] ?? null,
                        'sort_order' => $criteriaData['sort_order'] ?? 0
                    ]);
                }
            }

            DB::commit();

            // Load the updated review with relationships
            $review = Review::with(['employee', 'reviewer', 'reviewTemplate', 'reviewCriteria'])->find($review->id);

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete review
    public function destroy($id)
    {
        try {
            $review = Review::findOrFail($id);
            
            DB::beginTransaction();
            
            // Delete associated criteria
            ReviewCriteria::where('review_id', $review->id)->delete();
            
            // Delete the review
            $review->delete();
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Submit review
    public function submit(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);
            
            // Validate that review has criteria with scores
            $criteria = ReviewCriteria::where('review_id', $id)->get();
            if ($criteria->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot submit review without criteria'
                ], 400);
            }

            // Check if all criteria have scores
            $unscored = $criteria->where('score', 0)->count();
            if ($unscored > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'All criteria must be scored before submitting'
                ], 400);
            }

            $review->update(['status' => 'completed']);

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review submitted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Approve review
    public function approve($id)
    {
        try {
            $review = Review::findOrFail($id);
            $review->update(['status' => 'approved']);

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review approved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Reject review
    public function reject(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);
            
            $validatedData = $request->validate([
                'reason' => 'required|string'
            ]);
            
            $review->update([
                'status' => 'rejected',
                'overall_comments' => $review->overall_comments . "\n\nRejection Reason: " . $validatedData['reason']
            ]);

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review rejected successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject review',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}