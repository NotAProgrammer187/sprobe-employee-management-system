<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id;

        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('employees')->ignore($employeeId)
            ],
            'phone' => 'nullable|string|max:20|regex:/^[\+]?[0-9\s\-\(\)]*$/',
            'department' => 'required|string|max:100',
            'position' => 'required|string|max:100',
            'hire_date' => 'required|date|before_or_equal:today',
            'salary' => 'required|numeric|min:0|max:9999999.99',
            'status' => 'required|in:active,inactive,terminated',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email address is already registered',
            'phone.regex' => 'Please provide a valid phone number',
            'department.required' => 'Department is required',
            'position.required' => 'Position is required',
            'hire_date.required' => 'Hire date is required',
            'hire_date.before_or_equal' => 'Hire date cannot be in the future',
            'salary.required' => 'Salary is required',
            'salary.numeric' => 'Salary must be a valid number',
            'salary.min' => 'Salary cannot be negative',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be active, inactive, or terminated',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'hire_date' => 'hire date',
        ];
    }
}