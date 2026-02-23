<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\LogsActivity;

class post_jobs extends Model
{
    //
    use HasFactory, SoftDeletes, LogsActivity;
    protected $table = 'post_jobs';
    protected $primaryKey = 'id';
    protected $fillable = [
        'user_id',
        'job_title',
        'job_description',
        'job_category',
        'required_qualifications',
        'location',
        'salary',
        'number_of_vacancies',
        'photo',
        'remarks',
        'status',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
