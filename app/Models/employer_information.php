<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\LogsActivity;

class employer_information extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    protected $table = 'employer_information';
    protected $primaryKey = 'id';
    protected $fillable = [
        'users_id',
        'position',
        'contact_number',
        'business_address',
        'business_permit',
        'tin',
        'type_of_business',
        'status',
    ];

    /**
     * Get the user that owns the employer information.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    /**
     * Check if all required fields are filled.
     */
    public function isComplete(): bool
    {
        $requiredFields = [
            'position',
            'contact_number',
            'business_address',
            'business_permit',
            'tin',
            'type_of_business',
        ];

        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }

        return true;
    }
}
