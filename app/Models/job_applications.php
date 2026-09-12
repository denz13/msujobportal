<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class job_applications extends Model
{
    use HasFactory;

    protected $table = 'job_applications';

    protected $fillable = [
        'users_id',
        'post_jobs_id',
        'resume_path',
        'description',
        'remarks',
        'status',
        'interview_date',
        'interview_time',
        'interview_type',
        'interview_location',
        'contact_person',
        'contact_phone',
        'interview_instructions',
    ];

    protected $casts = [
        'interview_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function job()
    {
        return $this->belongsTo(post_jobs::class, 'post_jobs_id');
    }

    public function emailLogs()
    {
        return $this->morphMany(EmailLog::class, 'emailable');
    }
}

