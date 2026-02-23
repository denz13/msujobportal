<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * LogsActivity Trait
 * 
 * Automatically logs model activities (created, updated, deleted, restored).
 * 
 * Usage:
 * 
 * Add the trait to any model:
 * 
 * ```php
 * use App\Traits\LogsActivity;
 * 
 * class YourModel extends Model
 * {
 *     use LogsActivity;
 * }
 * ```
 * 
 * The trait will automatically log:
 * - When a model is created
 * - When a model is updated (with old/new values and changed fields)
 * - When a model is deleted
 * - When a model is restored (if using SoftDeletes)
 * 
 * Access logs:
 * ```php
 * $user->activityLogs; // Get all logs
 * $user->latestActivityLog; // Get latest log
 * 
 * // Query logs
 * ActivityLog::forModel(User::class)->get();
 * ActivityLog::event('created')->get();
 * ActivityLog::byUser($userId)->get();
 * ```
 */
trait LogsActivity
{
    /**
     * Boot the trait.
     */
    protected static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            $model->logActivity('created');
        });

        static::updated(function (Model $model) {
            $model->logActivity('updated');
        });

        static::deleted(function (Model $model) {
            $model->logActivity('deleted');
        });

        // For soft deletes
        if (method_exists(static::class, 'restored')) {
            static::restored(function (Model $model) {
                $model->logActivity('restored');
            });
        }
    }

    /**
     * Log the activity.
     */
    protected function logActivity(string $event): void
    {
        $oldValues = null;
        $newValues = null;
        $changedFields = null;

        if ($event === 'updated') {
            $oldValues = $this->getOriginal();
            $newValues = $this->getAttributes();
            $changedFields = $this->getChangedFields($oldValues, $newValues);
        } elseif ($event === 'created') {
            $newValues = $this->getAttributes();
        } elseif ($event === 'deleted') {
            $oldValues = $this->getAttributes();
        }

        // Remove sensitive fields from logging
        $hiddenFields = $this->getHiddenFields();
        $oldValues = $this->removeHiddenFields($oldValues, $hiddenFields);
        $newValues = $this->removeHiddenFields($newValues, $hiddenFields);

        ActivityLog::create([
            'loggable_type' => get_class($this),
            'loggable_id' => $this->getKey(),
            'event' => $event,
            'user_id' => Auth::id(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'changed_fields' => $changedFields,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'description' => $this->getActivityDescription($event),
        ]);
    }

    /**
     * Get fields that changed.
     */
    protected function getChangedFields(?array $oldValues, ?array $newValues): ?array
    {
        if (!$oldValues || !$newValues) {
            return null;
        }

        $changed = [];
        foreach ($newValues as $key => $value) {
            if (!array_key_exists($key, $oldValues) || $oldValues[$key] !== $value) {
                $changed[] = $key;
            }
        }

        return !empty($changed) ? $changed : null;
    }

    /**
     * Get fields that should be hidden from logs.
     */
    protected function getHiddenFields(): array
    {
        $defaultHidden = ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'];
        
        // Merge with model's hidden fields
        return array_merge($defaultHidden, $this->getHidden());
    }

    /**
     * Remove hidden fields from values.
     */
    protected function removeHiddenFields(?array $values, array $hiddenFields): ?array
    {
        if (!$values) {
            return null;
        }

        foreach ($hiddenFields as $field) {
            unset($values[$field]);
        }

        return $values;
    }

    /**
     * Get activity description.
     */
    protected function getActivityDescription(string $event): ?string
    {
        $modelName = class_basename($this);
        
        return match($event) {
            'created' => "{$modelName} created",
            'updated' => "{$modelName} updated",
            'deleted' => "{$modelName} deleted",
            'restored' => "{$modelName} restored",
            default => null,
        };
    }

    /**
     * Get all activity logs for this model.
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }

    /**
     * Get latest activity log.
     */
    public function latestActivityLog()
    {
        return $this->morphOne(ActivityLog::class, 'loggable')->latestOfMany();
    }
}
