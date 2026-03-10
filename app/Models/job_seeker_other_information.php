<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class job_seeker_other_information extends Model
{
    //
    protected $table = 'job_seeker_other_information';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = ['users_id', 'skills','work','status'];
 
    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }
}
