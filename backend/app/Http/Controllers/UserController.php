<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Get dashboard stats (Admin only)
     */
    public function getDashboardStats(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'admins' => User::where('role', 'admin')->count(),
                'managers' => User::where('role', 'manager')->count(),
                'employees' => User::where('role', 'employee')->count(),
                'recent_users' => User::orderBy('created_at', 'desc')->take(5)->get(),
            ];

            return response()->json([
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching dashboard stats',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all users (Admin only)
     */
    public function index(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        try {
            $query = User::query();

            // Filter by role if provided
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            // Filter by status if provided
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by name or email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching users',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Show specific user (Admin only)
     */
    public function show(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        try {
            $user = User::findOrFail($id);
            return response()->json([
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'User not found',
                'error' => $e->getMessage()
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Create new user (Admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role' => 'required|in:admin,manager,employee',
                'is_active' => 'boolean',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_active' => $request->boolean('is_active', true), // Default to true
                'email_verified_at' => now(),
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user,
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating user',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update user (Admin only)
     */
    public function update(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        try {
            $user = User::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->id),
                ],
                'role' => 'required|in:admin,manager,employee',
                'password' => 'nullable|string|min:8',
                'is_active' => 'boolean',
            ]);

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role,
                'is_active' => $request->boolean('is_active', $user->is_active),
            ];

            // Update password if provided
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating user',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete user (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        try {
            $user = User::findOrFail($id);

            // Prevent admin from deleting themselves
            if ($user->id === $request->user()->id) {
                return response()->json([
                    'message' => 'You cannot delete your own account'
                ], Response::HTTP_FORBIDDEN);
            }

            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting user',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Toggle user status (Admin only)
     */
    public function toggleStatus(Request $request, $id)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        try {
            $user = User::findOrFail($id);

            // Prevent admin from deactivating themselves
            if ($user->id === $request->user()->id) {
                return response()->json([
                    'message' => 'You cannot change your own status'
                ], Response::HTTP_FORBIDDEN);
            }

            $user->update(['is_active' => !$user->is_active]);

            return response()->json([
                'message' => 'User status updated successfully',
                'user' => $user->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating user status',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}