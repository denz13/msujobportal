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
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function job()
    {
        return $this->belongsTo(post_jobs::class, 'post_jobs_id');
    }
}

