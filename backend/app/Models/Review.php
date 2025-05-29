<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_id',
        'review_template_id',
        'reviewer_id',
        'title',
        'description',
        'review_period_start',
        'review_period_end',
        'review_date',
        'status',
        'overall_score',
        'overall_comments',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'review_period_start' => 'date',
        'review_period_end' => 'date',
        'review_date' => 'date',
        'overall_score' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(Employee::class, 'reviewer_id');
    }

    public function reviewTemplate()
    {
        return $this->belongsTo(ReviewTemplate::class);
    }


    public function reviewCriteria()
    {
        return $this->hasMany(ReviewCriteria::class);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('review_period_start', [$startDate, $endDate]);
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function getReviewPeriodAttribute()
    {
        return $this->review_period_start->format('M Y') . ' - ' . $this->review_period_end->format('M Y');
    }
}