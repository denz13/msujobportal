<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailLog extends Model
{
    use HasFactory;

    protected $table = 'email_logs';

    protected $fillable = [
        'user_id',
        'recipient_email',
        'recipient_name',
        'sender_id',
        'emailable_type',
        'emailable_id',
        'mail_type',
        'subject',
        'body',
        'status',
        'error_message',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    /**
     * Recipient user if registered in users table.
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Alias for recipient relation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Sender user (e.g. employer or admin who triggered the email).
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Related model (e.g. job_applications, post_jobs).
     */
    public function emailable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Dynamic helper to send and automatically record an email.
     * Can receive a User model, user ID, or raw email string as recipient.
     *
     * @param User|int|string $recipient User instance, User ID, or email address
     * @param \Illuminate\Mail\Mailable $mailable The mailable instance to send
     * @param array $options Optional attributes (mail_type, subject, emailable, meta, sender_id)
     * @return self
     */
    public static function sendAndLog(
        User|int|string $recipient,
        \Illuminate\Mail\Mailable $mailable,
        array $options = []
    ): self {
        $userId = null;
        $recipientEmail = null;
        $recipientName = null;

        // Resolve recipient from User model or database
        if ($recipient instanceof User) {
            $userId = $recipient->id;
            $recipientEmail = $recipient->email;
            $recipientName = $recipient->display_name ?: ($recipient->firstname . ' ' . $recipient->lastname);
        } elseif (is_numeric($recipient)) {
            $user = User::find($recipient);
            if ($user) {
                $userId = $user->id;
                $recipientEmail = $user->email;
                $recipientName = $user->display_name ?: ($user->firstname . ' ' . $user->lastname);
            }
        } elseif (is_string($recipient)) {
            $recipientEmail = $recipient;
            $user = User::where('email', $recipient)->first();
            if ($user) {
                $userId = $user->id;
                $recipientName = $user->display_name ?: ($user->firstname . ' ' . $user->lastname);
            }
        }

        $subject = $options['subject'] ?? ($mailable->envelope()->subject ?? 'Notification');
        $senderId = $options['sender_id'] ?? Auth::id();
        $mailType = $options['mail_type'] ?? null;
        $emailable = $options['emailable'] ?? null;

        $log = new self([
            'user_id' => $userId,
            'recipient_email' => $recipientEmail,
            'recipient_name' => $recipientName,
            'sender_id' => $senderId,
            'mail_type' => $mailType,
            'subject' => $subject,
            'status' => 'pending',
            'meta' => $options['meta'] ?? null,
        ]);

        if ($emailable instanceof Model) {
            $log->emailable()->associate($emailable);
        }

        try {
            Mail::to($recipientEmail)->send($mailable);
            $log->status = 'sent';
            $log->save();
        } catch (\Throwable $e) {
            $log->status = 'failed';
            $log->error_message = $e->getMessage();
            $log->save();

            Log::error('Failed to send dynamic email log: ' . $e->getMessage(), [
                'recipient_email' => $recipientEmail,
                'user_id' => $userId,
                'mail_type' => $mailType,
                'exception' => $e,
            ]);
        }

        return $log;
    }
}
