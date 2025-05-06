<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\StatusUpdate;
use App\Models\AdminComment;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdminCommentFactory extends Factory
{
    protected $model = AdminComment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status_update_id' => StatusUpdate::factory(),
            'admin_id' => User::factory(),
            'content' => $this->faker->paragraph(),
            'is_read' => $this->faker->boolean(20), // 20% chance of being read
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => function (array $attributes) {
                return $attributes['created_at'];
            },
        ];
    }

    /**
     * Indicate that the admin comment is read.
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
     * Indicate that the admin comment is unread.
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
