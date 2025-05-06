<?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up()
        {
            Schema::create('messages', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('sender_id')->constrained('users');
                $table->uuid('receiver_id')->constrained('users');
                $table->uuid('job_id')->nullable()->constrained('jobs');
                $table->text('message');
                $table->boolean('read')->default(false);
                $table->timestamps();
            });
        }

        public function down()
        {
            Schema::dropIfExists('messages');
        }
    };