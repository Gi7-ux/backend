<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_failures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('notification_type');
            $table->string('channel');
            $table->text('error_message');
            $table->json('notification_data')->nullable();
            $table->unsignedInteger('attempts')->default(1);
            $table->timestamp('last_attempt_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamp('failed_permanently_at')->nullable();
            $table->text('final_error')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'notification_type']);
            $table->index('channel');
            $table->index('resolved_at');
            $table->index('failed_permanently_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_failures');
    }
};