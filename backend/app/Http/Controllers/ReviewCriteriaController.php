<?php

namespace App\Http\Controllers;

use App\Models\ReviewCriteria;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReviewCriteriaController extends Controller
{
    /**
     * Display a listing of review criteria
     */
    public function index(Request $request)
    {
        $query = ReviewCriteria::with(['review.employee']);

        // Filter by review
        if ($request->has('review_id')) {
            $query->where('review_id', $request->review_id);
        }

        $criteria = $query->orderBy('order', 'asc')
            ->paginate($request->per_page ?? 15);

        return response()->json($criteria);
    }

    /**
     * Store a newly created review criteria
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'review_id' => 'required|exists:reviews,id',
            'criteria_name' => 'required|string|max:255',
            'criteria_description' => 'nullable|string',
            'weight' => 'required|numeric|min:0|max:100',
            'max_score' => 'required|numeric|min:1',
            'score' => 'required|numeric|min:0',
            'comments' => 'nullable|string',
            'order' => 'required|integer|min:0',
        ]);

        // Validate score doesn't exceed max_score
        if ($validated['score'] > $validated['max_score']) {
            return response()->json([
                'message' => 'Score cannot exceed maximum score'
            ], Response::HTTP_BAD_REQUEST);
        }

        $criteria = ReviewCriteria::create($validated);

        return response()->json([
            'message' => 'Review criteria created successfully',
            'data' => $criteria->load('review.employee')
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified review criteria
     */
    public function show(ReviewCriteria $reviewCriteria)
    {
        return response()->json([
            'data' => $reviewCriteria->load('review.employee')
        ]);
    }

    /**
     * Update the specified review criteria
     */
    public function update(Request $request, ReviewCriteria $reviewCriteria)
    {
        // Check if review is approved
        if ($reviewCriteria->review->status === 'approved') {
            return response()->json([
                'message' => 'Cannot update criteria for approved review'
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'criteria_name' => 'sometimes|required|string|max:255',
            'criteria_description' => 'nullable|string',
            'weight' => 'sometimes|required|numeric|min:0|max:100',
            'max_score' => 'sometimes|required|numeric|min:1',
            'score' => 'sometimes|required|numeric|min:0',
            'comments' => 'nullable|string',
            'order' => 'sometimes|required|integer|min:0',
        ]);

        // Validate score doesn't exceed max_score
        $maxScore = $validated['max_score'] ?? $reviewCriteria->max_score;
        $score = $validated['score'] ?? $reviewCriteria->score;
        
        if ($score > $maxScore) {
            return response()->json([
                'message' => 'Score cannot exceed maximum score'
            ], Response::HTTP_BAD_REQUEST);
        }

        $reviewCriteria->update($validated);

        // Recalculate review total score if score was updated
        if (isset($validated['score']) || isset($validated['weight'])) {
            $this->recalculateReviewScore($reviewCriteria->review);
        }

        return response()->json([
            'message' => 'Review criteria updated successfully',
            'data' => $reviewCriteria->load('review.employee')
        ]);
    }

    /**
     * Remove the specified review criteria
     */
    public function destroy(ReviewCriteria $reviewCriteria)
    {
        // Check if review is approved
        if ($reviewCriteria->review->status === 'approved') {
            return response()->json([
                'message' => 'Cannot delete criteria for approved review'
            ], Response::HTTP_FORBIDDEN);
        }

        $review = $reviewCriteria->review;
        $reviewCriteria->delete();

        // Recalculate review total score
        $this->recalculateReviewScore($review);

        return response()->json([
            'message' => 'Review criteria deleted successfully'
        ]);
    }

    /**
     * Update score for specific criteria
     */
    public function updateScore(Request $request, ReviewCriteria $reviewCriteria)
    {
        // Check if review is approved
        if ($reviewCriteria->review->status === 'approved') {
            return response()->json([
                'message' => 'Cannot update score for approved review'
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:' . $reviewCriteria->max_score,
            'comments' => 'nullable|string',
        ]);

        $reviewCriteria->update($validated);

        // Recalculate review total score
        $this->recalculateReviewScore($reviewCriteria->review);

        return response()->json([
            'message' => 'Score updated successfully',
            'data' => $reviewCriteria->load('review.employee')
        ]);
    }

    /**
     * Recalculate total score for a review
     */
    private function recalculateReviewScore($review)
    {
        $totalScore = $review->reviewCriteria()
            ->selectRaw('SUM(score * weight / 100) as weighted_score')
            ->first()
            ->weighted_score;

        $review->update(['total_score' => $totalScore]);
    }
}