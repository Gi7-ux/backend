<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('pending')->constrained();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->uuid('created_by')->nullable()->constrained('users');
        });

        Schema::create('assignments', function (Blueprint $table) {
            $table->uuid('job_id')->constrained('jobs');
            $table->uuid('user_id')->constrained('users');
            $table->string('status')->default('assigned')->constrained();
            $table->timestamp('assigned_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->primary(['job_id', 'user_id']);
        });

        Schema::create('status_updates', function (Blueprint $table) {
            $table->uuid('job_id')->constrained('jobs');
            $table->uuid('user_id')->constrained('users');
            $table->string('status')->constrained();
            $table->text('description')->nullable();
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->primary(['job_id', 'user_id', 'updated_at']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->constrained('users');
            $table->string('type')->constrained();
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('status_updates');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('jobs');
    }
};