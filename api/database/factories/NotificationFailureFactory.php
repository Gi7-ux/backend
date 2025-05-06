<?php

namespace Database\Factories;

use App\Models\NotificationFailure;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFailureFactory extends Factory
{
    protected $model = NotificationFailure::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $notificationTypes = [
            'App\Notifications\JobProgressUpdated',
            'App\Notifications\JobDetailsUpdated',
            'App\Notifications\JobUpdatedByAdmin',
            'App\Notifications\AdminMessageReceived',
            'App\Notifications\MessageForwarded',
        ];

        $channels = ['mail', 'database'];

        return [
            'user_id' => User::factory(),
            'notification_type' => $this->faker->randomElement($notificationTypes),
            'channel' => $this->faker->randomElement($channels),
            'error_message' => $this->faker->sentence(),
            'notification_data' => ['job_id' => $this->faker->randomNumber(), 'user_id' => $this->faker->randomNumber()], // Example data
            'attempts' => $this->faker->numberBetween(1, 3),
            'last_attempt_at' => $this->faker->dateTimeThisYear(),
            'last_error' => $this->faker->sentence(),
            'resolved_at' => null,
            'resolution_notes' => null,
            'failed_permanently_at' => null,
            'final_error' => null,
        ];
    }

    /**
     * Indicate that the failure was resolved.
     */
    public function resolved(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'resolved_at' => now(),
                'resolution_notes' => 'Issue resolved after manual intervention.'
            ];
        });
    }

    /**
     * Indicate that the failure failed permanently.
     */
    public function permanentlyFailed(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'failed_permanently_at' => now(),
                'final_error' => 'Notification failed after multiple retries.'
            ];
        });
    }
}