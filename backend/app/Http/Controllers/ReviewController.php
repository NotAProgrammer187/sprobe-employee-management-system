<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\ReviewCriteria;
use App\Models\ReviewTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    // Show specific review with criteria
    public function show($id)
    {
        try {
            $review = Review::with(['employee', 'reviewer', 'reviewTemplate'])->findOrFail($id);
            
            // Load review criteria
            $criteria = ReviewCriteria::where('review_id', $id)
                                    ->orderBy('sort_order')
                                    ->get();
            
            $review->reviewCriteria = $criteria;

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
                'criteria.*.score' => 'nullable|numeric|min:0|max:5',
                'criteria.*.comments' => 'nullable|string',
                'criteria.*.sort_order' => 'nullable|integer'
            ]);

            DB::beginTransaction();

            // Create the review
            $review = Review::create([
                'employee_id' => $validatedData['employee_id'],
                'review_template_id' => $validatedData['review_template_id'],
                'reviewer_id' => $validatedData['reviewer_id'],
                'title' => $validatedData['title'],
                'description' => $validatedData['description'] ?? '',
                'review_period_start' => $validatedData['review_period_start'],
                'review_period_end' => $validatedData['review_period_end'],
                'review_date' => $validatedData['review_date'],
                'status' => $validatedData['status'],
                'overall_comments' => $validatedData['overall_comments'],
                'overall_score' => 0, // Will be calculated
            ]);

            // Create criteria for the review
            if (!empty($validatedData['criteria'])) {
                // Use provided criteria
                foreach ($validatedData['criteria'] as $index => $criteriaData) {
                    ReviewCriteria::create([
                        'review_id' => $review->id,
                        'review_template_id' => $review->review_template_id,
                        'criteria_name' => $criteriaData['criteria_name'],
                        'criteria_description' => $criteriaData['criteria_description'] ?? '',
                        'weight' => $criteriaData['weight'] ?? 20,
                        'score' => $criteriaData['score'] ?? 0,
                        'comments' => $criteriaData['comments'] ?? '',
                        'sort_order' => $criteriaData['sort_order'] ?? $index
                    ]);
                }
            } else {
                // Load criteria from template if no criteria provided
                $templateCriteria = ReviewCriteria::where('review_template_id', $validatedData['review_template_id'])
                                                 ->whereNull('review_id')
                                                 ->orderBy('sort_order')
                                                 ->get();
                
                if ($templateCriteria->isNotEmpty()) {
                    foreach ($templateCriteria as $templateCriterion) {
                        ReviewCriteria::create([
                            'review_id' => $review->id,
                            'review_template_id' => $review->review_template_id,
                            'criteria_name' => $templateCriterion->criteria_name,
                            'criteria_description' => $templateCriterion->criteria_description,
                            'weight' => $templateCriterion->weight,
                            'score' => 0, // Start with 0 for new review
                            'comments' => '',
                            'sort_order' => $templateCriterion->sort_order
                        ]);
                    }
                }
            }

            // Calculate overall score
            $this->updateOverallScore($review->id);

            DB::commit();

            // Return review with criteria
            $review = Review::with(['employee', 'reviewer', 'reviewTemplate'])
                           ->find($review->id);
            $review->reviewCriteria = ReviewCriteria::where('review_id', $review->id)
                                                  ->orderBy('sort_order')
                                                  ->get();

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
                'overall_comments' => 'nullable|string',
                'criteria' => 'nullable|array',
                'criteria.*.criteria_name' => 'required|string',
                'criteria.*.criteria_description' => 'nullable|string',
                'criteria.*.weight' => 'nullable|numeric',
                'criteria.*.score' => 'nullable|numeric|min:0|max:5',
                'criteria.*.comments' => 'nullable|string',
                'criteria.*.sort_order' => 'nullable|integer'
            ]);

            DB::beginTransaction();

            // Update the review
            $reviewData = collect($validatedData)->except('criteria')->toArray();
            $review->update($reviewData);

            // Update criteria if provided
            if (isset($validatedData['criteria'])) {
                // Delete existing criteria
                ReviewCriteria::where('review_id', $review->id)->delete();
                
                // Create new criteria
                foreach ($validatedData['criteria'] as $index => $criteriaData) {
                    ReviewCriteria::create([
                        'review_id' => $review->id,
                        'review_template_id' => $review->review_template_id,
                        'criteria_name' => $criteriaData['criteria_name'],
                        'criteria_description' => $criteriaData['criteria_description'] ?? '',
                        'weight' => $criteriaData['weight'] ?? 20,
                        'score' => $criteriaData['score'] ?? 0,
                        'comments' => $criteriaData['comments'] ?? '',
                        'sort_order' => $criteriaData['sort_order'] ?? $index
                    ]);
                }
            }

            // Update overall score
            $this->updateOverallScore($review->id);

            DB::commit();

            // Return updated review with criteria
            $review = Review::with(['employee', 'reviewer', 'reviewTemplate'])
                           ->find($review->id);
            $review->reviewCriteria = ReviewCriteria::where('review_id', $review->id)
                                                  ->orderBy('sort_order')
                                                  ->get();

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

    // Submit review
    public function submit(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);
            
            // Check if all criteria have scores
            $criteria = ReviewCriteria::where('review_id', $id)->get();
            if ($criteria->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot submit review without criteria'
                ], 400);
            }

            $unscoredCriteria = $criteria->where('score', '<=', 0)->count();
            if ($unscoredCriteria > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'All criteria must be scored before submitting'
                ], 400);
            }

            // Update status and final score
            $review->update(['status' => 'completed']);
            $this->updateOverallScore($id);

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

    // Calculate and update overall score
    private function updateOverallScore($reviewId)
    {
        $criteria = ReviewCriteria::where('review_id', $reviewId)->get();
        
        if ($criteria->isEmpty()) {
            return;
        }

        $totalWeight = $criteria->sum('weight');
        if ($totalWeight == 0) {
            return;
        }

        // Calculate weighted average
        $weightedScore = 0;
        foreach ($criteria as $criterion) {
            $weightedScore += ($criterion->score * $criterion->weight) / 100;
        }

        // Update the review
        Review::where('id', $reviewId)->update([
            'overall_score' => round($weightedScore, 2)
        ]);
    }

    // Get all reviews (keeping existing method)
    public function index(Request $request)
    {
        try {
            $query = Review::with(['employee', 'reviewer', 'reviewTemplate']);

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

            $reviews = $query->orderBy('created_at', 'desc')->get();

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

    // Delete review
    public function destroy($id)
    {
        try {
            $review = Review::findOrFail($id);
            
            DB::beginTransaction();
            
            // Delete criteria first
            ReviewCriteria::where('review_id', $review->id)->delete();
            
            // Delete review
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

    // Get upcoming reviews
    public function upcoming()
    {
        try {
            $reviews = Review::whereIn('status', ['pending', 'draft'])
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
                            ->orderBy('updated_at', 'desc')
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
                            ->orderBy('created_at', 'desc')
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