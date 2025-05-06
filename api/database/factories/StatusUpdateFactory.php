<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use App\Models\StatusUpdate;
use Illuminate\Database\Eloquent\Factories\Factory;

class StatusUpdateFactory extends Factory
{
    protected $model = StatusUpdate::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'job_id' => Job::factory(),
            'user_id' => User::factory(),
            'content' => $this->faker->paragraphs(2, true),
            'is_read' => $this->faker->boolean(20), // 20% chance of being read
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => function (array $attributes) {
                return $attributes['created_at'];
            },
        ];
    }

    /**
     * Indicate that the status update is read.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function read()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_read' => true,
            ];
        });
    }

    /**
     * Indicate that the status update is unread.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function unread()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_read' => false,
            ];
        });
    }
}
