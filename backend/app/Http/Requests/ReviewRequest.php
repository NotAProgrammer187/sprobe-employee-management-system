<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
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
        $rules = [
            'employee_id' => 'required|exists:employees,id',
            'review_template_id' => 'required|exists:review_templates,id',
            'review_period' => 'required|string|max:100',
            'review_date' => 'required|date',
            'reviewer_name' => 'required|string|max:255',
            'reviewer_email' => 'required|email|max:255',
            'comments' => 'nullable|string|max:2000',
            'status' => 'required|in:draft,pending,completed,approved',
        ];

        // For updates, make certain fields optional
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['employee_id'] = 'sometimes|required|exists:employees,id';
            $rules['review_template_id'] = 'sometimes|required|exists:review_templates,id';
            $rules['review_period'] = 'sometimes|required|string|max:100';
            $rules['review_date'] = 'sometimes|required|date';
            $rules['reviewer_name'] = 'sometimes|required|string|max:255';
            $rules['reviewer_email'] = 'sometimes|required|email|max:255';
            $rules['status'] = 'sometimes|required|in:draft,pending,completed,approved';
        }

        return $rules;
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Employee selection is required',
            'employee_id.exists' => 'Selected employee does not exist',
            'review_template_id.required' => 'Review template selection is required',
            'review_template_id.exists' => 'Selected review template does not exist',
            'review_period.required' => 'Review period is required',
            'review_date.required' => 'Review date is required',
            'review_date.date' => 'Please provide a valid review date',
            'reviewer_name.required' => 'Reviewer name is required',
            'reviewer_email.required' => 'Reviewer email is required',
            'reviewer_email.email' => 'Please provide a valid reviewer email',
            'comments.max' => 'Comments cannot exceed 2000 characters',
            'status.required' => 'Status is required',
            'status.in' => 'Status must be draft, pending, completed, or approved',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Custom validation for review date not being too far in the past
            if ($this->review_date && $this->review_date < now()->subYears(2)) {
                $validator->errors()->add('review_date', 'Review date cannot be more than 2 years in the past');
            }

            // Validate that employee is active if creating new review
            if ($this->isMethod('POST') && $this->employee_id) {
                $employee = \App\Models\Employee::find($this->employee_id);
                if ($employee && $employee->status !== 'active') {
                    $validator->errors()->add('employee_id', 'Cannot create review for inactive employee');
                }
            }
        });
    }
}