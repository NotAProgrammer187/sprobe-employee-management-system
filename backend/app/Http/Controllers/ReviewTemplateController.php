<?php

namespace App\Http\Controllers;

use App\Models\ReviewTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReviewTemplateController extends Controller
{
    /**
     * Display a listing of review templates
     */
    public function index(Request $request)
    {
        $query = ReviewTemplate::query();

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $templates = $query->withCount('reviewCriteria')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($templates);
    }

    /**
     * Store a newly created review template
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:review_templates',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $template = ReviewTemplate::create($validated);

        return response()->json([
            'message' => 'Review template created successfully',
            'data' => $template
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified review template
     */
    public function show(ReviewTemplate $reviewTemplate)
    {
        return response()->json([
            'data' => $reviewTemplate->load('reviewCriteria')
        ]);
    }

    /**
     * Update the specified review template
     */
    public function update(Request $request, ReviewTemplate $reviewTemplate)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:review_templates,name,' . $reviewTemplate->id,
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        $reviewTemplate->update($validated);

        return response()->json([
            'message' => 'Review template updated successfully',
            'data' => $reviewTemplate
        ]);
    }

    /**
     * Remove the specified review template
     */
    public function destroy(ReviewTemplate $reviewTemplate)
    {
        // Check if template is being used in reviews
        if ($reviewTemplate->reviews()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete template that is being used in reviews. Please set status to inactive instead.'
            ], Response::HTTP_CONFLICT);
        }

        // Delete associated criteria first
        $reviewTemplate->reviewCriteria()->delete();
        $reviewTemplate->delete();

        return response()->json([
            'message' => 'Review template deleted successfully'
        ]);
    }

    /**
     * Get template criteria
     */
    public function criteria(ReviewTemplate $reviewTemplate)
    {
        $criteria = $reviewTemplate->reviewCriteria()
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'data' => $criteria
        ]);
    }
}