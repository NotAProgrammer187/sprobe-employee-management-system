<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Employee;
use App\Models\ReviewTemplate;
use App\Models\ReviewCriteria;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Display a listing of reviews
     */
    public function index(Request $request)
    {
        $query = Review::with(['employee', 'reviewTemplate']);

        // Filter by employee
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by review period
        if ($request->has('review_period')) {
            $query->where('review_period', $request->review_period);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('review_date', [$request->start_date, $request->end_date]);
        }

        $reviews = $query->orderBy('review_date', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($reviews);
    }

    /**
     * Store a newly created review
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'review_template_id' => 'required|exists:review_templates,id',
            'review_period' => 'required|string|max:100',
            'review_date' => 'required|date',
            'reviewer_name' => 'required|string|max:255',
            'reviewer_email' => 'required|email|max:255',
            'comments' => 'nullable|string',
            'status' => 'required|in:draft,pending,completed,approved',
        ]);

        $review = DB::transaction(function () use ($validated) {
            // Create the review
            $review = Review::create($validated);

            // Create review criteria based on template
            $template = ReviewTemplate::with('reviewCriteria')->find($validated['review_template_id']);
            
            foreach ($template->reviewCriteria as $templateCriteria) {
                ReviewCriteria::create([
                    'review_id' => $review->id,
                    'criteria_name' => $templateCriteria->criteria_name,
                    'criteria_description' => $templateCriteria->criteria_description,
                    'weight' => $templateCriteria->weight,
                    'max_score' => $templateCriteria->max_score,
                    'score' => 0, // Default score
                    'comments' => null,
                    'order' => $templateCriteria->order,
                ]);
            }

            return $review->load(['employee', 'reviewTemplate', 'reviewCriteria']);
        });

        return response()->json([
            'message' => 'Review created successfully',
            'data' => $review
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified review
     */
    public function show(Review $review)
    {
        return response()->json([
            'data' => $review->load(['employee', 'reviewTemplate', 'reviewCriteria'])
        ]);
    }

    /**
     * Update the specified review
     */
    public function update(Request $request, Review $review)
    {
        $validated = $request->validate([
            'review_period' => 'sometimes|required|string|max:100',
            'review_date' => 'sometimes|required|date',
            'reviewer_name' => 'sometimes|required|string|max:255',
            'reviewer_email' => 'sometimes|required|email|max:255',
            'comments' => 'nullable|string',
            'status' => 'sometimes|required|in:draft,pending,completed,approved',
        ]);

        // Prevent updating if review is already approved
        if ($review->status === 'approved' && !$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Cannot update approved review'
            ], Response::HTTP_FORBIDDEN);
        }

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'data' => $review->load(['employee', 'reviewTemplate', 'reviewCriteria'])
        ]);
    }

    /**
     * Remove the specified review
     */
    public function destroy(Review $review)
    {
        // Prevent deletion if review is approved
        if ($review->status === 'approved') {
            return response()->json([
                'message' => 'Cannot delete approved review'
            ], Response::HTTP_FORBIDDEN);
        }

        DB::transaction(function () use ($review) {
            // Delete associated criteria
            $review->reviewCriteria()->delete();
            $review->delete();
        });

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Get review criteria
     */
    public function criteria(Review $review)
    {
        $criteria = $review->reviewCriteria()
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'data' => $criteria
        ]);
    }

    /**
     * Submit review for approval
     */
    public function submit(Review $review)
    {
        if ($review->status !== 'draft' && $review->status !== 'pending') {
            return response()->json([
                'message' => 'Review cannot be submitted in current status'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Check if all criteria have scores
        $unscored = $review->reviewCriteria()->where('score', 0)->count();
        if ($unscored > 0) {
            return response()->json([
                'message' => 'All criteria must be scored before submission'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Calculate total score
        $totalScore = $review->reviewCriteria()
            ->selectRaw('SUM(score * weight / 100) as weighted_score')
            ->first()
            ->weighted_score;

        $review->update([
            'status' => 'completed',
            'total_score' => $totalScore,
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'data' => $review->load(['employee', 'reviewTemplate', 'reviewCriteria'])
        ]);
    }

    /**
     * Approve review
     */
    public function approve(Review $review)
    {
        if ($review->status !== 'completed') {
            return response()->json([
                'message' => 'Only completed reviews can be approved'
            ], Response::HTTP_BAD_REQUEST);
        }

        $review->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->user()->name,
        ]);

        return response()->json([
            'message' => 'Review approved successfully',
            'data' => $review->load(['employee', 'reviewTemplate', 'reviewCriteria'])
        ]);
    }

    /**
     * Search reviews
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $reviews = Review::with(['employee', 'reviewTemplate'])
            ->whereHas('employee', function($query) use ($request) {
                $query->where('first_name', 'like', "%{$request->q}%")
                      ->orWhere('last_name', 'like', "%{$request->q}%");
            })
            ->orWhere('review_period', 'like', "%{$request->q}%")
            ->orWhere('reviewer_name', 'like', "%{$request->q}%")
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $reviews
        ]);
    }
}