<?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up()
        {
            Schema::create('time_entries', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('user_id')->constrained('users');
                $table->uuid('job_id')->constrained('jobs');
                $table->timestamp('start_time');
                $table->timestamp('end_time');
                $table->integer('duration')->nullable(); // in minutes
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        public function down()
        {
            Schema::dropIfExists('time_entries');
        }
    };