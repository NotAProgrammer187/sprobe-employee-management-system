<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReviewCriteria extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'review_id',
        'review_template_id',
        'criteria_name',
        'criteria_description',
        'score',
        'weight',
        'comments',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'weight' => 'decimal:2',
        'score' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function review()
    {
        return $this->belongsTo(Review::class);
    }

    public function reviewTemplate()
    {
        return $this->belongsTo(ReviewTemplate::class);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    public function getWeightedScoreAttribute()
    {
        return round($this->score * ($this->weight / 100), 2);
    }

    public function isScored()
    {
        return !is_null($this->score);
    }
}