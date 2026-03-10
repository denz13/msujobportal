<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\LogsActivity;

class save_jobs extends Model
{
    //
    use HasFactory, SoftDeletes, LogsActivity;
    protected $table = 'save_jobs';
    protected $primaryKey = 'id';
    protected $fillable = [
        'users_id',
        'post_jobs_id',
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
