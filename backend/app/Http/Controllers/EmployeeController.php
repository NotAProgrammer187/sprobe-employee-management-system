<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees
     */
    public function index(Request $request)
    {
        $query = Employee::query();

        // Filter by department if provided
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $employees = $query->paginate($request->per_page ?? 15);

        return response()->json($employees);
    }

    /**
     * Store a newly created employee
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees',
            'phone' => 'nullable|string|max:20',
            'department' => 'required|string|max:100',
            'position' => 'required|string|max:100',
            'hire_date' => 'required|date',
            'salary' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,terminated',
        ]);

        $employee = Employee::create($validated);

        return response()->json([
            'message' => 'Employee created successfully',
            'data' => $employee
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified employee
     */
    public function show(Employee $employee)
    {
        return response()->json([
            'data' => $employee->load(['reviews.reviewTemplate'])
        ]);
    }

    /**
     * Update the specified employee
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('employees')->ignore($employee->id)],
            'phone' => 'nullable|string|max:20',
            'department' => 'sometimes|required|string|max:100',
            'position' => 'sometimes|required|string|max:100',
            'hire_date' => 'sometimes|required|date',
            'salary' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:active,inactive,terminated',
        ]);

        $employee->update($validated);

        return response()->json([
            'message' => 'Employee updated successfully',
            'data' => $employee
        ]);
    }

    /**
     * Remove the specified employee
     */
    public function destroy(Employee $employee)
    {
        // Check if employee has reviews
        if ($employee->reviews()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete employee with existing reviews. Please delete reviews first or set employee status to inactive.'
            ], Response::HTTP_CONFLICT);
        }

        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully'
        ]);
    }

    /**
     * Get employee's reviews
     */
    public function reviews(Employee $employee)
    {
        $reviews = $employee->reviews()
            ->with(['reviewTemplate', 'reviewCriteria'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $reviews
        ]);
    }

    /**
     * Search employees
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $employees = Employee::where('first_name', 'like', "%{$request->q}%")
            ->orWhere('last_name', 'like', "%{$request->q}%")
            ->orWhere('email', 'like', "%{$request->q}%")
            ->orWhere('department', 'like', "%{$request->q}%")
            ->orWhere('position', 'like', "%{$request->q}%")
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $employees
        ]);
    }
}