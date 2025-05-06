<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $messageTypes = ['client_admin', 'freelancer_admin', 'admin_client', 'admin_freelancer', 'admin_forward'];
        
        return [
            'job_id' => Job::factory(),
            'from_id' => User::factory(),
            'to_id' => User::factory(),
            'message' => $this->faker->paragraph(),
            'message_type' => $this->faker->randomElement($messageTypes),
            'admin_notes' => null,
            'is_read' => false,
            'original_sender_id' => null,
            'requires_action' => false,
            'priority' => 'normal',
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Indicate that this is a client to admin message.
     */
    public function clientToAdmin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'message_type' => 'client_admin',
                'requires_action' => true
            ];
        });
    }

    /**
     * Indicate that this is a freelancer to admin message.
     */
    public function freelancerToAdmin(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'message_type' => 'freelancer_admin',
                'requires_action' => true
            ];
        });
    }

    /**
     * Indicate that this is an admin forwarded message.
     */
    public function adminForwarded(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'message_type' => 'admin_forward',
                'admin_notes' => $this->faker->sentence(),
                'original_sender_id' => User::factory()
            ];
        });
    }

    /**
     * Indicate this is a high priority message.
     */
    public function highPriority(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'priority' => 'high',
                'requires_action' => true
            ];
        });
    }

    /**
     * Add attachments to the message.
     */
    public function withAttachments(int $count = 1): static
    {
        return $this->afterCreating(function (Message $message) use ($count) {
            for ($i = 0; $i < $count; $i++) {
                $message->addMediaFromString($this->faker->sentence())
                    ->usingName($this->faker->word() . '.pdf')
                    ->toMediaCollection('message_attachments');
            }
        });
    }
}