<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Http\Requests\EmployeeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    /**
     * Get all employees with optional filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Employee::with(['user']);

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('department')) {
                $query->where('department', $request->department);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%");
                });
            }

            // Pagination
            if ($request->has('per_page')) {
                $employees = $query->paginate($request->per_page);
            } else {
                $employees = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active employees
     */
    public function getActive(): JsonResponse
    {
        try {
            $employees = Employee::active()
                                ->with(['user'])
                                ->orderBy('first_name')
                                ->get();

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employees by manager
     */
    public function getByManager($managerId): JsonResponse
    {
        try {
            $employees = Employee::byManager($managerId)
                                ->with(['user'])
                                ->get();

            return response()->json([
                'success' => true,
                'data' => $employees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve employees by manager',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show specific employee
     */
    public function show($id): JsonResponse
    {
        try {
            $employee = Employee::with(['user', 'reviews'])
                              ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $employee
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Create new employee
     */
    public function store(EmployeeRequest $request): JsonResponse
    {
        try {
            $employee = Employee::create($request->validated());

            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update employee
     */
    public function update(EmployeeRequest $request, $id): JsonResponse
    {
        try {
            $employee = Employee::findOrFail($id);
            $employee->update($request->validated());

            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete employee (soft delete)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $employee = Employee::findOrFail($id);
            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employee reviews
     */
    public function getReviews($id): JsonResponse
    {
        try {
            $employee = Employee::findOrFail($id);
            $reviews = $employee->reviews()
                               ->with(['reviewer', 'reviewTemplate'])
                               ->orderBy('created_at', 'desc')
                               ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve employee reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}