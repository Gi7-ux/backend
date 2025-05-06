<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraphs(3, true),
            'budget' => $this->faker->randomFloat(2, 100, 10000),
            'deadline' => $this->faker->dateTimeBetween('+1 week', '+6 months'),
            'status' => 'open',
            'client_id' => User::factory(),
            'freelancer_id' => null,
            'skills_required' => $this->faker->words(3),
            'completion_percentage' => 0,
            'progress_notes' => null,
            'admin_notes' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Indicate the job is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'in_progress',
                'freelancer_id' => User::factory()->create(['role' => 'freelancer']),
                'completion_percentage' => $this->faker->numberBetween(1, 99),
                'progress_notes' => $this->faker->paragraph()
            ];
        });
    }

    /**
     * Indicate the job is completed.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
                'freelancer_id' => User::factory()->create(['role' => 'freelancer']),
                'completion_percentage' => 100,
                'progress_notes' => $this->faker->paragraph(),
                'admin_notes' => $this->faker->sentence()
            ];
        });
    }

    /**
     * Indicate the job is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'cancelled',
                'admin_notes' => $this->faker->sentence()
            ];
        });
    }

    /**
     * Add admin mediation notes.
     */
    public function withAdminNotes(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'admin_notes' => $this->faker->paragraph()
            ];
        });
    }

    /**
     * Set significant progress update.
     */
    public function withProgressUpdate(): static
    {
        return $this->state(function (array $attributes) {
            $currentProgress = $attributes['completion_percentage'] ?? 0;
            return [
                'completion_percentage' => min($currentProgress + 10, 100),
                'progress_notes' => $this->faker->paragraph()
            ];
        });
    }

    /**
     * Add specific skills requirements.
     */
    public function withSkills(array $skills): static
    {
        return $this->state(function (array $attributes) use ($skills) {
            return [
                'skills_required' => $skills
            ];
        });
    }

    /**
     * Set as needing admin review.
     */
    public function needingReview(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'requires_admin_review' => true,
                'admin_review_reason' => $this->faker->sentence()
            ];
        });
    }

    /**
     * Set as having client-requested changes.
     */
    public function withClientChanges(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'client_change_requests' => $this->faker->paragraph(),
                'requires_admin_review' => true
            ];
        });
    }
}